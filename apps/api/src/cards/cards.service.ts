import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import 'multer';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCard(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Génération d'un slug unique (8 caractères alphanumériques)
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

    // Sauvegarde du fichier dans le dossier uploads
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const rawExt = path.extname(file.originalname).toLowerCase();
    const ext = rawExt || '.png';
    const fileName = `${slug}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    const apiUrl = process.env.API_URL ?? 'http://localhost:5500';
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const imageUrl = `${apiUrl}/uploads/${fileName}`;
    const cardUrl = `${appUrl}/c/${slug}`;

    // Génération du QR code en DataURL (base64 PNG)
    const qrCode = await QRCode.toDataURL(cardUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#181411',
        light: '#ffffff',
      },
    });

    // Enregistrement dans PostgreSQL via Prisma
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
