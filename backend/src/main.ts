import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { createWinstonLogger } from './common/logger/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createWinstonLogger(),
  });
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE', 'Kurye Operasyon API'))
    .setDescription(
      configService.get(
        'SWAGGER_DESCRIPTION',
        'Kurye Operasyon Sistemi API Dokümantasyonu',
      ),
    )
    .setVersion(configService.get('SWAGGER_VERSION', '1.0.0'))
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    configService.get('SWAGGER_PATH', 'api-docs'),
    app,
    document,
  );

  const port = configService.get('PORT', 3000);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation: http://localhost:${port}/${configService.get('SWAGGER_PATH', 'api-docs')}`,
  );
}
bootstrap();
