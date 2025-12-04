import { Module, forwardRef } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TrendyolGoModule } from '../trendyolgo/trendyolgo.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    forwardRef(() => TrendyolGoModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
