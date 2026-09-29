import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET.length < 32 ||
      !process.env.REFRESH_TOKEN_SECRET || process.env.REFRESH_TOKEN_SECRET.length < 32 ||
      !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL and two distinct secrets of at least 32 characters are required.');
  }
  if (process.env.ACCESS_TOKEN_SECRET === process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('Access and refresh token secrets must be different.');
  }
  const app = await NestFactory.create(AppModule, { rawBody: true });
  // Enable only when the API sits behind a trusted single-hop proxy (never for a public direct API).
  if (process.env.TRUST_PROXY === 'true') app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.setGlobalPrefix('api');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());
  app.enableCors({ origin: process.env.WEB_ORIGIN || 'http://localhost:3000', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true,
    transformOptions: { enableImplicitConversion: false } }));
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NexusForge Foundation API')
      .setDescription('Authenticated REST API for workspaces, projects, issues and tasks.')
      .setVersion('0.1.0').addCookieAuth('nf_access').build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }
  await app.listen(Number(process.env.PORT) || 4000, '0.0.0.0');
  Logger.log(`API ready on port ${process.env.PORT || 4000}`, 'Bootstrap');
}
bootstrap().catch((error) => { console.error(error); process.exit(1); });
