import { Module } from '@nestjs/common';
import { ServiceAreaController } from './service-area.controller';
import { ServiceAreaService } from './service-area.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [ServiceAreaController],
  providers: [ServiceAreaService],
  exports: [ServiceAreaService],
})
export class ServiceAreaModule {}