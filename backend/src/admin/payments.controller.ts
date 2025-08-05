import { 
  Controller, 
  Get, 
  Post,
  Put, 
  Param, 
  Body, 
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { UpdatePaymentStatusDto, PaymentFilterDto, CreatePaymentDto } from './dto/payment-management.dto';

@ApiTags('Admin - Payments')
@ApiBearerAuth()
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm ödemeleri listele' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'] })
  @ApiQuery({ name: 'method', required: false, enum: ['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'WALLET'] })
  @ApiQuery({ name: 'companyId', required: false, type: Number })
  @ApiQuery({ name: 'courierId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Ödemeler listelendi' })
  async findAll(
    @Query() filter: PaymentFilterDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.paymentsService.findAll(filter, page, limit);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Onay bekleyen ödemeleri listele' })
  @ApiResponse({ status: 200, description: 'Onay bekleyen ödemeler listelendi' })
  async findPending() {
    return this.paymentsService.findPending();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Ödeme istatistiklerini getir' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'İstatistikler getirildi' })
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getStatistics(startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ödeme detaylarını getir' })
  @ApiResponse({ status: 200, description: 'Ödeme detayları getirildi' })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni ödeme oluştur' })
  @ApiResponse({ status: 201, description: 'Ödeme oluşturuldu' })
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Put(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ödemeyi onayla' })
  @ApiResponse({ status: 200, description: 'Ödeme onaylandı' })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { transactionReference?: string }
  ) {
    return this.paymentsService.approve(id, dto.transactionReference);
  }

  @Put(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ödemeyi reddet' })
  @ApiResponse({ status: 200, description: 'Ödeme reddedildi' })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { reason: string }
  ) {
    return this.paymentsService.reject(id, dto.reason);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ödeme durumunu güncelle' })
  @ApiResponse({ status: 200, description: 'Ödeme durumu güncellendi' })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentStatusDto
  ) {
    return this.paymentsService.updateStatus(id, dto);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ödemeyi iade et' })
  @ApiResponse({ status: 200, description: 'Ödeme iade edildi' })
  @ApiResponse({ status: 404, description: 'Ödeme bulunamadı' })
  async refund(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { reason: string; amount?: number }
  ) {
    return this.paymentsService.refund(id, dto.reason, dto.amount);
  }
}
