import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AppCacheModule } from './cache/cache.module';
import { AllExceptionsFilter } from './common/exceptions/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CompanyModule } from './company/company.module';
import { CourierModule } from './courier/courier.module';
import { PricingModule } from './pricing/pricing.module';
import { SettingsModule } from './settings/settings.module';
import { ReportsModule } from './reports/reports.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { LoggerModule } from './logger/logger.module';
import { DocumentsModule } from './documents/documents.module';
import { OrdersModule } from './orders/orders.module';
import { ServiceAreaModule } from './service-area/service-area.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CompanyPaymentsModule } from './company-payments/company-payments.module';
import { GeographyModule } from './geography/geography.module';
import { YemeksepetiModule } from './yemeksepeti/yemeksepeti.module';
import { TrendyolGoModule } from './trendyolgo/trendyolgo.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    AppCacheModule,
    CompanyModule,
    CourierModule,
    PricingModule,
    SettingsModule,
    ReportsModule,
    PaymentsModule,
    UsersModule,
    DocumentsModule,
    OrdersModule,
    ServiceAreaModule,
    ReconciliationModule,
    NotificationsModule,
    CompanyPaymentsModule,
    GeographyModule,
    YemeksepetiModule,
    TrendyolGoModule,
    WhatsAppModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
