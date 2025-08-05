import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CouriersController } from './couriers.controller';
import { CouriersService } from './couriers.service';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { SystemSettingsController } from './system-settings.controller';
import { SystemSettingsService } from './system-settings.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [
    AdminController,
    CompaniesController,
    CouriersController,
    PricingController,
    SystemSettingsController,
    PaymentsController,
    UsersController,
  ],
  providers: [
    AdminService,
    CompaniesService,
    CouriersService,
    PricingService,
    SystemSettingsService,
    PaymentsService,
    UsersService,
  ],
})
export class AdminModule {}
