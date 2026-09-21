import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const allowedOrigins = [
  process.env.APP_URL,
  'http://localhost:3000', 
].filter(Boolean) as string[];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,  
});
  app.use(
    cookieParser(),
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  const port = process.env.PORT ?? 5500;
  await app.listen(port);
  console.log(`MonCode API is running on: http://localhost:${port}`);
}
bootstrap();
