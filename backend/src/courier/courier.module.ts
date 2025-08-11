import { Module } from '@nestjs/common';
import { CourierService } from './courier.service';
import { CourierController } from './courier.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CourierController],
  providers: [CourierService],
  exports: [CourierService],
})
export class CourierModule {}