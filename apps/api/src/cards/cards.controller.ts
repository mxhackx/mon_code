import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import 'multer';
import { CardsService } from './cards.service';

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
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
      { name: 'menu', maxCount: 10 },
    ]),
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
  async getAllCards() {
    return this.cardsService.getAllCards();
  }

  @Get(':slug')
  async getCard(@Param('slug') slug: string) {
    return this.cardsService.getCardBySlug(slug);
  }
}
