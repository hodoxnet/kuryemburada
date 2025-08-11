import { 
  Controller, 
  Get, 
  Patch, 
  Post,
  Param, 
  Body, 
  Query, 
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, PaymentStatus, PaymentMethod } from '@prisma/client';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';

@ApiTags('Ödeme Yönetimi')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tüm ödemeleri listele' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'method', required: false, enum: PaymentMethod })
  @ApiResponse({ status: 200, description: 'Ödeme listesi' })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('status') status?: PaymentStatus,
    @Query('method') method?: PaymentMethod,
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (method) where.paymentMethod = method;

    return this.paymentsService.findAll({
      skip,
      take,
      where,
    });
  }

  @Get('pending')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bekleyen ödemeleri listele' })
  @ApiResponse({ status: 200, description: 'Bekleyen ödeme listesi' })
  async findPending() {
    return this.paymentsService.findPendingPayments();
  }

  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ödeme istatistiklerini getir' })
  @ApiResponse({ status: 200, description: 'Ödeme istatistikleri' })
  async getStatistics() {
    return this.paymentsService.getStatistics();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ödeme detayını getir' })
  @ApiResponse({ status: 200, description: 'Ödeme detayı' })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ödeme durumunu güncelle' })
  @ApiResponse({ status: 200, description: 'Durum güncellendi' })
  @ApiResponse({ status: 403, description: 'İşlem izni yok' })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/approve')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ödemeyi onayla' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        transactionId: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Ödeme onaylandı' })
  @ApiResponse({ status: 403, description: 'İşlem izni yok' })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async approve(
    @Param('id') id: string,
    @Body('transactionId') transactionId?: string,
  ) {
    return this.paymentsService.approvePayment(id, transactionId);
  }

  @Post(':id/reject')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ödemeyi reddet' })
  @ApiResponse({ status: 200, description: 'Ödeme reddedildi' })
  @ApiResponse({ status: 403, description: 'İşlem izni yok' })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async reject(@Param('id') id: string) {
    return this.paymentsService.rejectPayment(id);
  }

  @Post(':id/refund')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ödemeyi iade et' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refundReason: { type: 'string' },
      },
      required: ['refundReason'],
    },
  })
  @ApiResponse({ status: 200, description: 'Ödeme iade edildi' })
  @ApiResponse({ status: 403, description: 'İşlem izni yok' })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async refund(
    @Param('id') id: string,
    @Body('refundReason') refundReason: string,
  ) {
    return this.paymentsService.refundPayment(id, refundReason);
  }

  @Post('bulk-approve')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Toplu ödeme onayı' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        paymentIds: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['paymentIds'],
    },
  })
  @ApiResponse({ status: 200, description: 'Toplu onay tamamlandı' })
  async bulkApprove(@Body('paymentIds') paymentIds: string[]) {
    return this.paymentsService.bulkApprove(paymentIds);
  }
}