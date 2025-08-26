import { Module } from '@nestjs/common';
import { CompanyPaymentsController } from './company-payments.controller';
import { CompanyPaymentsService } from './company-payments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyPaymentsController],
  providers: [CompanyPaymentsService],
  exports: [CompanyPaymentsService],
})
export class CompanyPaymentsModule {}