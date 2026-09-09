import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'multer';

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

  async createCard(file: Express.Multer.File) {
    if (!file) {
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

    // 2. Conversion et optimisation de l'image en WebP avec Sharp
    // - .rotate() : applique l'orientation EXIF (crucial pour les photos mobiles)
    // - .resize() : limite la largeur à 1600px max pour éviter les fichiers géants
    // - .webp() : compression optimisée de haute qualité
    const webpBuffer = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const fileName = `${slug}.webp`;
    let imageUrl = '';

    // 3. Stockage sur Supabase Storage (si configuré) ou repli local
    if (this.supabase) {
      const { error: uploadError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, webpBuffer, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) {
        this.logger.error(`Erreur upload Supabase: ${uploadError.message}`);
        throw new BadRequestException(`Échec du stockage sur Supabase: ${uploadError.message}`);
      }

      const { data } = this.supabase.storage.from(this.bucketName).getPublicUrl(fileName);
      imageUrl = data.publicUrl;
      this.logger.log(`Image uploadée sur Supabase Storage : ${imageUrl}`);
    } else {
      // Repli local en WebP
      const uploadsDir = path.join(process.cwd(), 'uploads');
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, fileName);
      await fs.promises.writeFile(filePath, webpBuffer);

      const apiUrl = process.env.API_URL ?? 'http://localhost:5500';
      imageUrl = `${apiUrl}/uploads/${fileName}`;
      this.logger.log(`Image WebP enregistrée en local : ${filePath}`);
    }

    // 4. Génération du QR code en DataURL (base64 PNG)
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const cardUrl = `${appUrl}/c/${slug}`;

    const qrCode = await QRCode.toDataURL(cardUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#181411',
        light: '#ffffff',
      },
    });

    // 5. Enregistrement dans PostgreSQL via Prisma
    const card = await this.prisma.card.create({
      data: {
        slug,
        imageUrl,
      },
    });

    return {
      id: card.id.toString(),
      slug: card.slug,
      imageUrl: card.imageUrl,
      cardUrl,
      qrCode,
      createdAt: card.createdAt,
    };
  }

  async getCardBySlug(slug: string) {
    const card = await this.prisma.card.findUnique({
      where: { slug },
    });

    if (!card) {
      throw new NotFoundException(`Carte introuvable pour le slug "${slug}"`);
    }

    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

    return {
      id: card.id.toString(),
      slug: card.slug,
      imageUrl: card.imageUrl,
      cardUrl: `${appUrl}/c/${card.slug}`,
      createdAt: card.createdAt,
    };
  }
}
