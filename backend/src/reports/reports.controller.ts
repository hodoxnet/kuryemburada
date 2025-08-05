import { 
  Controller, 
  Get, 
  Query,
  UseGuards,
  Request,
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
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Admin Reports
  @Get('admin/overview')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin genel özet raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Rapor başarıyla oluşturuldu' })
  async getAdminOverview(@Query() filter: ReportFilterDto) {
    return this.reportsService.getAdminOverview(filter);
  }

  @Get('admin/orders')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin sipariş raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: Number })
  @ApiQuery({ name: 'courierId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Sipariş raporu oluşturuldu' })
  async getAdminOrderReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getAdminOrderReport(filter);
  }

  @Get('admin/revenue')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin gelir raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] })
  @ApiResponse({ status: 200, description: 'Gelir raporu oluşturuldu' })
  async getAdminRevenueReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getAdminRevenueReport(filter);
  }

  @Get('admin/performance')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin performans raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: Number })
  @ApiQuery({ name: 'courierId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Performans raporu oluşturuldu' })
  async getAdminPerformanceReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getAdminPerformanceReport(filter);
  }

  @Get('admin/regional')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin bölgesel analiz raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Bölgesel analiz raporu oluşturuldu' })
  async getAdminRegionalReport(@Query() filter: ReportFilterDto) {
    return this.reportsService.getAdminRegionalReport(filter);
  }

  // Company Reports
  @Get('company/orders')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma sipariş raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @ApiResponse({ status: 200, description: 'Sipariş raporu oluşturuldu' })
  async getCompanyOrderReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const companyId = await this.reportsService.getCompanyIdFromUser(req.user.id);
    return this.reportsService.getCompanyOrderReport(companyId, filter);
  }

  @Get('company/expenses')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma harcama raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Harcama raporu oluşturuldu' })
  async getCompanyExpenseReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const companyId = await this.reportsService.getCompanyIdFromUser(req.user.id);
    return this.reportsService.getCompanyExpenseReport(companyId, filter);
  }

  @Get('company/performance')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma teslimat performans raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Performans raporu oluşturuldu' })
  async getCompanyPerformanceReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const companyId = await this.reportsService.getCompanyIdFromUser(req.user.id);
    return this.reportsService.getCompanyPerformanceReport(companyId, filter);
  }

  @Get('company/routes')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma en çok kullanılan güzergahlar raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Güzergah raporu oluşturuldu' })
  async getCompanyRoutesReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const companyId = await this.reportsService.getCompanyIdFromUser(req.user.id);
    return this.reportsService.getCompanyRoutesReport(companyId, filter);
  }

  // Courier Reports
  @Get('courier/earnings')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COURIER)
  @ApiOperation({ summary: 'Kurye kazanç raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @ApiResponse({ status: 200, description: 'Kazanç raporu oluşturuldu' })
  async getCourierEarningsReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const courierId = await this.reportsService.getCourierIdFromUser(req.user.id);
    return this.reportsService.getCourierEarningsReport(courierId, filter);
  }

  @Get('courier/deliveries')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COURIER)
  @ApiOperation({ summary: 'Kurye teslimat raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Teslimat raporu oluşturuldu' })
  async getCourierDeliveriesReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const courierId = await this.reportsService.getCourierIdFromUser(req.user.id);
    return this.reportsService.getCourierDeliveriesReport(courierId, filter);
  }

  @Get('courier/working-hours')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COURIER)
  @ApiOperation({ summary: 'Kurye çalışma saatleri raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Çalışma saatleri raporu oluşturuldu' })
  async getCourierWorkingHoursReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const courierId = await this.reportsService.getCourierIdFromUser(req.user.id);
    return this.reportsService.getCourierWorkingHoursReport(courierId, filter);
  }

  @Get('courier/collections')
  @UseGuards(RolesGuard)
  @Roles(UserRole.COURIER)
  @ApiOperation({ summary: 'Kurye tahsilat raporu' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Tahsilat raporu oluşturuldu' })
  async getCourierCollectionsReport(@Request() req: any, @Query() filter: ReportFilterDto) {
    const courierId = await this.reportsService.getCourierIdFromUser(req.user.id);
    return this.reportsService.getCourierCollectionsReport(courierId, filter);
  }
}
