import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  // Configure Winston logger
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            return `${timestamp} [${context}] ${level}: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
            }`;
          }),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // Security
  app.use(helmet());

  // Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN')?.split(',') || '*',
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger Documentation
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Agent Directory Manager API')
      .setDescription(
        'API completa para la gestión del ciclo de vida de agentes de inteligencia artificial',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticación y autorización')
      .addTag('users', 'Gestión de usuarios')
      .addTag('organizations', 'Organizaciones multi-tenant')
      .addTag('projects', 'Proyectos de agentes')
      .addTag('agents', 'Agentes de IA')
      .addTag('templates', 'Plantillas de agentes')
      .addTag('prompts', 'Prompts jerárquicos')
      .addTag('resources', 'APIs, herramientas y componentes MCP')
      .addTag('tags', 'Etiquetado y categorización')
      .addTag('metrics', 'Métricas y monitoreo')
      .addTag('alerts', 'Alertas y notificaciones')
      .addTag('integrations', 'Integraciones externas')
      .addTag('sandbox', 'Entorno de pruebas')
      .addTag('audit', 'Auditoría y registros')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`, 'Bootstrap');
  logger.log(
    `📚 API Documentation available at: http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
}

bootstrap();
