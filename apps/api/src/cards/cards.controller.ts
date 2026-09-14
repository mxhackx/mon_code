import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  Headers,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import 'multer';
import { CardsService } from './cards.service';
import { AuthService } from '../auth/auth.service';

export class CreateCardDto {
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

@Controller('cards')
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'logo', maxCount: 1 },
        { name: 'menu', maxCount: 8 },
      ],
      {
        limits: {
          fileSize: 6 * 1024 * 1024, // Limite de 6 Mo par fichier (évite les saturations RAM)
          files: 10,
        },
        fileFilter: (_req, file, callback) => {
          if (!file.mimetype || !file.mimetype.startsWith('image/')) {
            return callback(
              new BadRequestException(`Le fichier "${file.originalname}" n'est pas une image valide (format attendu: PNG, JPG, WEBP)`),
              false,
            );
          }
          callback(null, true);
        },
      },
    ),
  )
  async uploadCard(
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      logo?: Express.Multer.File[];
      menu?: Express.Multer.File[];
    },
    @Body()
    body?: CreateCardDto,
  ) {
    const singleFile = files?.file?.[0];
    const logoFile = files?.logo?.[0];
    const menuFiles = files?.menu ?? [];

    if (!singleFile && !logoFile && menuFiles.length === 0) {
      throw new BadRequestException('Veuillez fournir au moins une image (carte, logo ou menu).');
    }

    return this.cardsService.createCard(
      {
        file: singleFile,
        logo: logoFile,
        menu: menuFiles,
      },
      body,
    );
  }

  @Get()
  async getAllCards(@Headers('authorization') authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Accès réservé aux administrateurs. Token d’authentification manquant.');
    }

    const token = authHeader.split(' ')[1];
    const isValid = await this.authService.validateAdminToken(token);
    if (!isValid) {
      throw new UnauthorizedException('Session administrateur expirée ou invalide');
    }

    return this.cardsService.getAllCards();
  }

  @Get(':slug/download')
  async downloadCard(@Param('slug') slug: string, @Res() res: Response) {
    const fileData = await this.cardsService.getCardFile(slug);
    res.setHeader('Content-Type', fileData.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
    res.send(fileData.buffer);
  }

  @Get(':slug')
  async getCard(@Param('slug') slug: string) {
    return this.cardsService.getCardBySlug(slug);
  }
}
