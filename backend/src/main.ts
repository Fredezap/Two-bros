import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:5173',
      'https://futsalforher.ch',
      'https://www.futsalforher.ch'
    ],
    credentials: true,
  });
  const port = process.env.PORT ?? 4300;
  await app.listen(port);
  console.log(`🚀 Server is running on port ${port}`);
}
bootstrap();