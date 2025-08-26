import { 
  Controller, 
  Get, 
  Query, 
  Param,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, OrderStatus, PaymentStatus } from '@prisma/client';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';

@ApiTags('Raporlama')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Dashboard istatistiklerini getir' })
  @ApiResponse({ status: 200, description: 'Dashboard istatistikleri' })
  async getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('orders')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Sipariş raporlarını getir' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'courierId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiResponse({ status: 200, description: 'Sipariş raporları' })
  async getOrderReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('companyId') companyId?: string,
    @Query('courierId') courierId?: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.reportsService.getOrderReports({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      companyId,
      courierId,
      status,
    });
  }

  @Get('payments')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Ödeme raporlarını getir' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiResponse({ status: 200, description: 'Ödeme raporları' })
  async getPaymentReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: PaymentStatus,
  ) {
    return this.reportsService.getPaymentReports({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    });
  }

  @Get('courier-performance')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kurye performans raporlarını getir' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'courierId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Kurye performans raporları' })
  async getCourierPerformance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('courierId') courierId?: string,
  ) {
    return this.reportsService.getCourierPerformance({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      courierId,
    });
  }

  @Get('company-activity')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firma aktivite raporlarını getir' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Firma aktivite raporları' })
  async getCompanyActivity(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.reportsService.getCompanyActivity({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      companyId,
    });
  }

  @Get('revenue')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Gelir analizi raporlarını getir' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'groupBy', required: true, enum: ['day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: 'Gelir analizi raporları' })
  async getRevenueAnalysis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy', new ParseEnumPipe(['day', 'week', 'month'])) 
    groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    return this.reportsService.getRevenueAnalysis({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      groupBy,
    });
  }

  @Get('company-balance/:companyId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firma cari durumunu getir' })
  @ApiResponse({ status: 200, description: 'Firma cari durumu' })
  async getCompanyBalance(@Param('companyId') companyId: string) {
    return this.reportsService.getCompanyBalance(companyId);
  }

  @Get('company-detailed/:companyId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firma detaylı raporunu getir' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: 'Firma detaylı raporu' })
  async getCompanyDetailedReport(
    @Param('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    return this.reportsService.getCompanyDetailedReport(companyId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      groupBy,
    });
  }

  @Get('courier-earnings/:courierId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kurye kazanç raporunu getir' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'] })
  @ApiResponse({ status: 200, description: 'Kurye kazanç raporu' })
  async getCourierEarnings(
    @Param('courierId') courierId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    return this.reportsService.getCourierEarnings(courierId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      groupBy,
    });
  }

  @Get('all-companies-balance')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tüm firmaların cari durumunu getir' })
  @ApiResponse({ status: 200, description: 'Tüm firmaların cari durumu' })
  async getAllCompaniesBalance() {
    return this.reportsService.getAllCompaniesBalance();
  }

  @Get('export')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Raporu dışa aktar' })
  @ApiQuery({ name: 'reportType', required: true })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'Rapor verisi' })
  async exportReport(
    @Query('reportType') reportType: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query() otherParams?: any,
  ) {
    return this.reportsService.exportReport(reportType, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      ...otherParams,
    });
  }
}