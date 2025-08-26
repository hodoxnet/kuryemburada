import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException
} from '@nestjs/common';
import { CompanyPaymentsService } from './company-payments.service';
import { CreateCompanyPaymentDto } from './dto/create-company-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';

@ApiTags('Firma Ödemeleri')
@Controller('company-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CompanyPaymentsController {
  constructor(private readonly companyPaymentsService: CompanyPaymentsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firma ödemesi kaydet' })
  @ApiResponse({ status: 201, description: 'Ödeme başarıyla kaydedildi' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async create(
    @Request() req,
    @Body() createDto: CreateCompanyPaymentDto,
  ) {
    return this.companyPaymentsService.create(createDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tüm firma ödemelerini listele' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('companyId') companyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const where: any = {};
    
    if (companyId) where.companyId = companyId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    return this.companyPaymentsService.findAll({
      skip,
      take,
      where,
    });
  }

  @Get('company/:companyId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firmaya ait ödemeleri listele' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.companyPaymentsService.findByCompany(companyId, {
      skip,
      take,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('company/:companyId/summary')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firma ödeme özetini getir' })
  @ApiResponse({ status: 200, description: 'Firma ödeme özeti' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async getCompanyPaymentSummary(@Param('companyId') companyId: string) {
    return this.companyPaymentsService.getCompanyPaymentSummary(companyId);
  }

  @Get('reconciliation/:reconciliationId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Mutabakat detaylarını getir' })
  @ApiResponse({ status: 200, description: 'Mutabakat detayları' })
  @ApiResponse({ status: 404, description: 'Mutabakat kaydı bulunamadı' })
  async getReconciliationDetails(@Param('reconciliationId') reconciliationId: string) {
    return this.companyPaymentsService.getReconciliationDetails(reconciliationId);
  }

  @Get('my-payments')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma kendi ödemelerini görüntüle' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getMyPayments(
    @Request() req,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ) {
    return this.companyPaymentsService.getMyPayments(req.user.id, { skip, take });
  }
}