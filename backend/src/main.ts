import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('port');
  const corsOrigin = configService.get('cors.origin');

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

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

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger configuration
  if (configService.get('swagger.enabled')) {
    const config = new DocumentBuilder()
      .setTitle('Kurye Operasyon API')
      .setDescription('Kurye operasyon sistemi REST API dokümantasyonu')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('Authentication', 'Kimlik doğrulama işlemleri')
      .addTag('Companies', 'Firma işlemleri')
      .addTag('Couriers', 'Kurye işlemleri')
      .addTag('Orders', 'Sipariş işlemleri')
      .addTag('Payments', 'Ödeme işlemleri')
      .addTag('Admin', 'Yönetici işlemleri')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(configService.get('swagger.path'), app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(
      `Swagger docs available at: http://localhost:${port}/${configService.get('swagger.path')}`,
    );
  }

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${configService.get('nodeEnv')}`);
}
bootstrap();
