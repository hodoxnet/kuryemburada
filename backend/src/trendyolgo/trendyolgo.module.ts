import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TrendyolGoController } from './trendyolgo.controller';
import { TrendyolGoService } from './trendyolgo.service';
import { TrendyolGoHttpService } from './trendyolgo-http.service';
import { TrendyolGoPollingService } from './trendyolgo-polling.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => OrdersModule),
    ScheduleModule.forRoot(),
  ],
  controllers: [TrendyolGoController],
  providers: [
    TrendyolGoService,
    TrendyolGoHttpService,
    TrendyolGoPollingService,
  ],
  exports: [TrendyolGoService, TrendyolGoHttpService],
})
export class TrendyolGoModule {}
