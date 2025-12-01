import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { YemeksepetiController } from './yemeksepeti.controller';
import { YemeksepetiService } from './yemeksepeti.service';
import { YemeksepetiHttpService } from './yemeksepeti-http.service';
import { YemeksepetiAuthGuard } from './guards/yemeksepeti-auth.guard';

@Module({
  imports: [
    PrismaModule,
    OrdersModule,
  ],
  controllers: [YemeksepetiController],
  providers: [YemeksepetiService, YemeksepetiHttpService, YemeksepetiAuthGuard],
  exports: [YemeksepetiService, YemeksepetiHttpService],
})
export class YemeksepetiModule {}
