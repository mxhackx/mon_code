import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { CardsModule } from './cards/cards.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, CardsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
