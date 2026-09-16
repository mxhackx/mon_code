import {
  Req,
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
import type { Request, Response } from 'express';
import 'multer';
import type { FileFilterCallback } from 'multer';
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

  // Constante pour réutiliser la configuration d'upload
  private readonly uploadOptions = {
    limits: {
      fileSize: 6 * 1024 * 1024,
      files: 10,
    },
    fileFilter: (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
      if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        return callback(
          new BadRequestException(`Le fichier "${file.originalname}" n'est pas une image valide (format attendu: PNG, JPG, WEBP)`),
          false,
        );
      }
      callback(null, true);
    },
  };

  /**
   * Création de carte d'intervention (Protégée)
   */
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
      { name: 'menu', maxCount: 8 },
    ], {
      limits: { fileSize: 6 * 1024 * 1024, files: 10 },
      fileFilter: (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
        if (!file.mimetype || !file.mimetype.startsWith('image/')) {
          return callback(new BadRequestException(`Le fichier "${file.originalname}" n'est pas une image valide`), false);
        }
        callback(null, true);
      }
    })
  )
  async uploadCardProtected(
    @Req() req: Request,
    @Headers('authorization') authHeader: string | undefined,
    @UploadedFiles() files: { file?: Express.Multer.File[]; logo?: Express.Multer.File[]; menu?: Express.Multer.File[]; },
    @Body() body?: CreateCardDto,
  ) {
    let token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/access_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      throw new UnauthorizedException("Authentification requise pour enregistrer une fiche d'intervention.");
    }

    const isValid = await this.authService.validateUserToken(token);
    if (!isValid) {
      throw new UnauthorizedException("Session utilisateur expirée ou invalide.");
    }

    const singleFile = files?.file?.[0];
    const logoFile = files?.logo?.[0];
    const menuFiles = files?.menu ?? [];

    if (!singleFile && !logoFile && menuFiles.length === 0) {
      throw new BadRequestException('Veuillez fournir au moins une image (carte, logo ou menu).');
    }

    return this.cardsService.createCard({ file: singleFile, logo: logoFile, menu: menuFiles }, body);
  }

  /**
   * Création de carte de visite publique (Non protégée)
   */
  @Post('visite')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
      { name: 'menu', maxCount: 8 },
    ], {
      limits: { fileSize: 6 * 1024 * 1024, files: 10 },
      fileFilter: (_req: any, file: any, callback: any) => {
        if (!file.mimetype || !file.mimetype.startsWith('image/')) {
          return callback(new BadRequestException(`Le fichier "${file.originalname}" n'est pas une image valide`), false);
        }
        callback(null, true);
      }
    })
  )
  async uploadCardPublic(
    @UploadedFiles() files: { file?: Express.Multer.File[]; logo?: Express.Multer.File[]; menu?: Express.Multer.File[]; },
    @Body() body?: CreateCardDto,
  ) {
    const singleFile = files?.file?.[0];
    const logoFile = files?.logo?.[0];
    const menuFiles = files?.menu ?? [];

    if (!singleFile && !logoFile && menuFiles.length === 0) {
      throw new BadRequestException('Veuillez fournir au moins une image (carte, logo ou menu).');
    }

    const sanitizedBody = { ...body };
    delete sanitizedBody.userName;
    delete sanitizedBody.clientName;
    delete sanitizedBody.workDone;
    delete sanitizedBody.amountReceived;

    return this.cardsService.createCard({ file: singleFile, logo: logoFile, menu: menuFiles }, sanitizedBody);
  }

  @Get()
  async getAllCards(@Req() req: Request, @Headers('authorization') authHeader?: string) {
    let token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/access_token=([^;]+)/);
      if (match) token = match[1];
    }
    if (!token) {
      throw new UnauthorizedException('Accès réservé aux administrateurs. Token d’authentification manquant.');
    }
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
