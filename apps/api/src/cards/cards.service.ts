import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Card, Prisma } from '@prisma/client';
import 'multer';

export interface CardMetadata {
  userName?: string;
  clientName?: string;
  workDone?: string;
  amountReceived?: string;
  restaurantName?: string;
  locationUrl?: string;
  phoneNumber?: string;
  themeId?: string;
  qrStyle?: string;
}

export interface UploadedCardFiles {
  file?: Express.Multer.File;
  logo?: Express.Multer.File;
  menu?: Express.Multer.File[];
}

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);
  private supabase: SupabaseClient | null = null;
  private readonly bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'cards';

  constructor(private readonly prisma: PrismaService) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log(`Supabase Storage configuré (bucket: "${this.bucketName}")`);
    } else {
      this.logger.warn(
        'Supabase Storage non configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquant). Stockage local en WebP actif en repli.',
      );
    }
  }

  /**
   * Traite une image avec Sharp (optimisation WebP) et la stocke sur Supabase Storage ou en local
   */
  private async processAndUploadImage(buffer: Buffer, fileName: string): Promise<string> {
    let webpBuffer: Buffer;
    try {
      webpBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Format inconnu';
      this.logger.error(`Erreur Sharp sur "${fileName}": ${msg}`);
      throw new BadRequestException(
        `L'image "${fileName}" est corrompue ou dans un format illisible. Veuillez fournir une image valide (PNG, JPEG, WEBP).`,
      );
    }

    if (this.supabase) {
      const { error: uploadError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, webpBuffer, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) {
        this.logger.error(`Erreur upload Supabase: ${uploadError.message}`);
        throw new BadRequestException('Échec du stockage de l’image. Veuillez réessayer ultérieurement.');
      }

      const { data } = this.supabase.storage.from(this.bucketName).getPublicUrl(fileName);
      return data.publicUrl;
    } else {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await fs.promises.writeFile(filePath, webpBuffer);

      const apiUrl = process.env.API_URL ?? 'http://localhost:5500';
      return `${apiUrl}/uploads/${fileName}`;
    }
  }

  /**
   * Génère un QR Code avec le style graphique sélectionné
   */
  private async generateStyledQrCode(cardUrl: string, qrStyle: string = 'style-1'): Promise<string> {
    let darkColor = '#181411';
    let lightColor = '#ffffff';

    switch (qrStyle) {
      case 'style-2': // Signature Orange MonCode
        darkColor = '#ef6a22';
        lightColor = '#ffffff';
        break;
      case 'style-3': // Sombre & Or
        darkColor = '#d4af37';
        lightColor = '#0f0d0c';
        break;
      case 'style-4': // Moderne Ardoise
        darkColor = '#2d3748';
        lightColor = '#f8fafc';
        break;
      case 'style-5': // Émeraude & Nature
        darkColor = '#065f46';
        lightColor = '#f0fdf4';
        break;
      case 'style-1': // Classique Pur
      default:
        darkColor = '#181411';
        lightColor = '#ffffff';
        break;
    }

    return QRCode.toDataURL(cardUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    });
  }

  async createCard(files: UploadedCardFiles, metadata?: CardMetadata) {
    const hasAnyFile = files.file || files.logo || (files.menu && files.menu.length > 0);
    if (!hasAnyFile) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // 1. Génération d'un slug unique (8 caractères alphanumériques)
    let slug = '';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let isUnique = false;

    while (!isUnique) {
      slug = Array.from({ length: 8 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join('');

      const existing = await this.prisma.card.findUnique({
        where: { slug },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    // 2. Traitement et upload des images (Logo et/ou Menu)
    let logoUrl: string | null = null;
    const menuImagesUrls: string[] = [];

    if (files.logo) {
      logoUrl = await this.processAndUploadImage(files.logo.buffer, `${slug}-logo.webp`);
    } else if (files.file) {
      logoUrl = await this.processAndUploadImage(files.file.buffer, `${slug}.webp`);
    }

    if (files.menu && files.menu.length > 0) {
      for (let i = 0; i < files.menu.length; i++) {
        const menuFile = files.menu[i];
        const menuUrl = await this.processAndUploadImage(menuFile.buffer, `${slug}-menu-${i}.webp`);
        menuImagesUrls.push(menuUrl);
      }
    }

    const primaryImageUrl = logoUrl || menuImagesUrls[0] || '';

    // 3. Génération du QR code selon le style choisi
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const cardUrl = `${appUrl}/c/${slug}`;
    const qrCode = await this.generateStyledQrCode(cardUrl, metadata?.qrStyle);

    // Validation de sécurité de l'URL de localisation (protection anti-XSS)
    let safeLocationUrl: string | null = null;
    if (metadata?.locationUrl) {
      const trimmedLocation = metadata.locationUrl.trim();
      if (trimmedLocation.startsWith('http://') || trimmedLocation.startsWith('https://')) {
        safeLocationUrl = trimmedLocation;
      }
    }

    // Helper de normalisation : convertit les chaînes vides ou avec espaces seuls en null
    const cleanStr = (val?: string | null): string | null =>
      val && val.trim().length > 0 ? val.trim() : null;

    // 4. Enregistrement dans PostgreSQL via Prisma
    const createData: Prisma.CardCreateInput = {
      slug,
      imageUrl: primaryImageUrl,
      restaurantName: cleanStr(metadata?.restaurantName),
      logoUrl: logoUrl ?? null,
      locationUrl: safeLocationUrl,
      phoneNumber: cleanStr(metadata?.phoneNumber),
      menuImages: menuImagesUrls.length > 0 ? JSON.stringify(menuImagesUrls) : null,
      themeId: cleanStr(metadata?.themeId) ?? 'theme-1',
      qrStyle: cleanStr(metadata?.qrStyle) ?? 'style-1',
      userName: cleanStr(metadata?.userName),
      clientName: cleanStr(metadata?.clientName),
      workDone: cleanStr(metadata?.workDone),
      amountReceived: cleanStr(metadata?.amountReceived),
    };

    const card: Card = await this.prisma.card.create({
      data: createData,
    });

    return {
      slug: card.slug,
      imageUrl: card.imageUrl,
      restaurantName: card.restaurantName ?? null,
      logoUrl: card.logoUrl ?? null,
      locationUrl: card.locationUrl ?? null,
      phoneNumber: card.phoneNumber ?? null,
      menuImages: menuImagesUrls,
      themeId: card.themeId ?? 'theme-1',
      qrStyle: card.qrStyle ?? 'style-1',
      cardUrl,
      qrCode,
      createdAt: card.createdAt,
    };
  }

  async getCardBySlug(slug: string) {
    const card = (await this.prisma.card.findUnique({
      where: { slug },
    }));

    if (!card) {
      throw new NotFoundException(`Carte introuvable pour le slug "${slug}"`);
    }

    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

    let menuImages: string[] = [];
    if (card.menuImages) {
      try {
        menuImages = JSON.parse(card.menuImages);
      } catch {
        menuImages = [card.menuImages];
      }
    }

    // Endpoint public : exclusion stricte des données d'intervention internes (userName, clientName, workDone, amountReceived)
    return {
      slug: card.slug,
      imageUrl: card.imageUrl,
      restaurantName: card.restaurantName ?? null,
      logoUrl: card.logoUrl ?? null,
      locationUrl: card.locationUrl ?? null,
      phoneNumber: card.phoneNumber ?? null,
      menuImages,
      themeId: card.themeId ?? 'theme-1',
      qrStyle: card.qrStyle ?? 'style-1',
      cardUrl: `${appUrl}/c/${card.slug}`,
      createdAt: card.createdAt,
    };
  }

  async getAllCards() {
    const cards: Card[] = await this.prisma.card.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

    return cards.map((card) => {
      let menuImages: string[] = [];
      if (card.menuImages) {
        try {
          menuImages = JSON.parse(card.menuImages);
        } catch {
          menuImages = [card.menuImages];
        }
      }

      return {
        id: card.id.toString(),
        slug: card.slug,
        imageUrl: card.imageUrl,
        restaurantName: card.restaurantName ?? null,
        logoUrl: card.logoUrl ?? null,
        locationUrl: card.locationUrl ?? null,
        phoneNumber: card.phoneNumber ?? null,
        menuImages,
        themeId: card.themeId ?? 'theme-1',
        qrStyle: card.qrStyle ?? 'style-1',
        userName: card.userName ?? null,
        clientName: card.clientName ?? null,
        workDone: card.workDone ?? null,
        amountReceived: card.amountReceived ?? null,
        cardUrl: `${appUrl}/c/${card.slug}`,
        createdAt: card.createdAt,
      };
    });
  }

  /**
   * Récupère le fichier binaire de la carte pour téléchargement direct
   */
  async getCardFile(slug: string): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    const card = await this.prisma.card.findUnique({
      where: { slug },
    });

    if (!card) {
      throw new NotFoundException(`Carte introuvable pour le slug "${slug}"`);
    }

    const filename = `carte-${slug}.webp`;
    const contentType = 'image/webp';

    if (this.supabase) {
      const storageKey = card.imageUrl.includes(`/${this.bucketName}/`)
        ? card.imageUrl.split(`/${this.bucketName}/`)[1]
        : `${slug}.webp`;

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .download(storageKey);

      if (!error && data) {
        const arrayBuffer = await data.arrayBuffer();
        return {
          buffer: Buffer.from(arrayBuffer),
          contentType,
          filename,
        };
      }
    }

    // Si local ou si Supabase direct
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const localFileName = path.basename(card.imageUrl);
    const localPath = path.join(uploadsDir, localFileName);
    if (fs.existsSync(localPath)) {
      const buffer = await fs.promises.readFile(localPath);
      return { buffer, contentType, filename };
    }

    // Repli via fetch HTTP sur card.imageUrl
    if (card.imageUrl.startsWith('http://') || card.imageUrl.startsWith('https://')) {
      const response = await fetch(card.imageUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return {
          buffer: Buffer.from(arrayBuffer),
          contentType,
          filename,
        };
      }
    }

    throw new NotFoundException(`Le fichier image pour la carte "${slug}" est introuvable`);
  }
}
