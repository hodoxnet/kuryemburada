import { 
  Controller, 
  Get, 
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';
import { CreateReconciliationDto } from './dto/create-reconciliation.dto';
import { UpdateReconciliationDto, ProcessPaymentDto } from './dto/update-reconciliation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, ReconciliationStatus } from '@prisma/client';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';
const dayjs = require('dayjs');

@ApiTags('Mutabakat Yönetimi')
@ApiBearerAuth()
@Controller('reconciliation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  // Firma sipariş raporlarını görür (mutabakat oluşturmadan)
  @Get('company/orders-report')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma sipariş raporlarını listele' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Sipariş raporu' })
  async getCompanyOrdersReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const company = req.user.company;
    if (!company) {
      throw new Error('Firma bilgisi bulunamadı');
    }

    const start = startDate ? dayjs(startDate).toDate() : dayjs().startOf('month').toDate();
    const end = endDate ? dayjs(endDate).toDate() : dayjs().endOf('month').toDate();

    return this.reconciliationService.getOrdersReport(company.id, start, end);
  }

  // Firma kendi mutabakatlarını görür
  @Get('company')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma mutabakatlarını listele' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Mutabakat listesi' })
  async getCompanyReconciliations(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const company = req.user.company;
    if (!company) {
      throw new Error('Firma bilgisi bulunamadı');
    }

    const start = startDate ? dayjs(startDate).toDate() : undefined;
    const end = endDate ? dayjs(endDate).toDate() : undefined;

    return this.reconciliationService.findAllByCompany(company.id, start, end);
  }

  // Firma özet raporu
  @Get('company/summary')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma özet raporunu getir' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Özet rapor' })
  async getCompanySummary(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const company = req.user.company;
    if (!company) {
      throw new Error('Firma bilgisi bulunamadı');
    }

    const start = startDate ? dayjs(startDate).toDate() : undefined;
    const end = endDate ? dayjs(endDate).toDate() : undefined;

    return this.reconciliationService.getCompanySummary(company.id, start, end);
  }

  // Admin tüm mutabakatları görür
  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tüm mutabakatları listele' })
  @ApiQuery({ name: 'status', required: false, enum: ReconciliationStatus })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Mutabakat listesi' })
  async getAllReconciliations(
    @Query('status') status?: ReconciliationStatus,
    @Query('companyId') companyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.reconciliationService.findAll({
      status,
      companyId,
      startDate: startDate ? dayjs(startDate).toDate() : undefined,
      endDate: endDate ? dayjs(endDate).toDate() : undefined,
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 10,
    });
  }

  // Günlük mutabakatları oluştur (Cron job veya manuel tetikleme)
  @Post('generate-daily')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Günlük mutabakatları oluştur' })
  @ApiResponse({ status: 200, description: 'Mutabakatlar oluşturuldu' })
  async generateDailyReconciliations() {
    return this.reconciliationService.generateDailyReconciliations();
  }

  // Belirli bir firma için mutabakat oluştur
  @Post('company/:companyId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firma için mutabakat oluştur' })
  @ApiResponse({ status: 201, description: 'Mutabakat oluşturuldu' })
  async createReconciliation(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('date') date: string,
  ) {
    const reconciliationDate = date ? dayjs(date).toDate() : new Date();
    return this.reconciliationService.createOrUpdateDailyReconciliation(
      companyId,
      reconciliationDate
    );
  }

  // Mutabakat detayını getir
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY)
  @ApiOperation({ summary: 'Mutabakat detayını getir' })
  @ApiResponse({ status: 200, description: 'Mutabakat detayı' })
  @ApiResponse({ status: 404, description: 'Mutabakat bulunamadı' })
  async getReconciliation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const reconciliation = await this.reconciliationService.findOne(id);
    
    // Firma kullanıcısı sadece kendi mutabakatını görebilir
    if (req.user.role === UserRole.COMPANY) {
      if (reconciliation.companyId !== req.user.company?.id) {
        throw new Error('Bu mutabakatı görüntüleme yetkiniz yok');
      }
    }

    return reconciliation;
  }

  // Mutabakat güncelle
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Mutabakat güncelle' })
  @ApiResponse({ status: 200, description: 'Mutabakat güncellendi' })
  @ApiResponse({ status: 404, description: 'Mutabakat bulunamadı' })
  async updateReconciliation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateReconciliationDto,
  ) {
    return this.reconciliationService.update(id, updateDto);
  }

  // Ödeme işle
  @Post(':id/payment')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Mutabakat ödemesi işle' })
  @ApiResponse({ status: 201, description: 'Ödeme işlendi' })
  @ApiResponse({ status: 400, description: 'Ödeme işlenemedi' })
  @ApiResponse({ status: 404, description: 'Mutabakat bulunamadı' })
  async processPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() paymentDto: ProcessPaymentDto,
    @Request() req,
  ) {
    return this.reconciliationService.processPayment(id, paymentDto, req.user.id);
  }
}
