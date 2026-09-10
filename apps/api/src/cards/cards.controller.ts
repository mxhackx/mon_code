import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadCard(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10 Mo
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/i }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body()
    body?: {
      userName?: string;
      clientName?: string;
      workDone?: string;
      amountReceived?: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('Veuillez fournir une image.');
    }
    return this.cardsService.createCard(file, body);
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
