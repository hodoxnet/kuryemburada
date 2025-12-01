import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { YemeksepetiService } from './yemeksepeti.service';
import type { YemeksepetiDispatchOrder } from './dto/dispatch-order.dto';
import { YemeksepetiAuthGuard } from './guards/yemeksepeti-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Yemeksepeti')
@Controller('yemeksepeti')
export class YemeksepetiController {
  constructor(private readonly yemeksepetiService: YemeksepetiService) {}

  @Post('order/:remoteId')
  @UseGuards(YemeksepetiAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yemeksepeti yeni sipariş dispatch' })
  async dispatchOrder(
    @Param('remoteId') remoteId: string,
    @Body() payload: YemeksepetiDispatchOrder,
  ) {
    const { remoteOrderId } = await this.yemeksepetiService.handleDispatch(remoteId, payload);
    return {
      remoteResponse: {
        remoteOrderId,
      },
    };
  }

  @Put('remoteId/:remoteId/remoteOrder/:remoteOrderId/posOrderStatus')
  @UseGuards(YemeksepetiAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yemeksepeti sipariş durum güncellemesi' })
  async updateOrderStatus(
    @Param('remoteId') remoteId: string,
    @Param('remoteOrderId') remoteOrderId: string,
    @Body('status') status: string,
    @Body('message') message?: string,
    @Body('updatedOrder') updatedOrder?: any,
  ) {
    return this.yemeksepetiService.handleStatusUpdate(remoteId, remoteOrderId, status, message, updatedOrder);
  }
}
