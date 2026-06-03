import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
  
  app.setGlobalPrefix('api');
  
  await app.listen(4000);
  console.log('Backend is running on http://localhost:4000');
}

bootstrap();
