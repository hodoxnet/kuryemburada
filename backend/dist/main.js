"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('port');
    const corsOrigin = configService.get('cors.origin');
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    if (configService.get('swagger.enabled')) {
        const config = new swagger_1.DocumentBuilder()
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
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup(configService.get('swagger.path') || 'api-docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
            },
        });
        logger.log(`Swagger docs available at: http://localhost:${port}/${configService.get('swagger.path')}`);
    }
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Environment: ${configService.get('nodeEnv')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map