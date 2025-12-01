import { 
  Controller, 
  Get, 
  Patch, 
  Put,
  Delete,
  Param, 
  Body, 
  Query, 
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpsertYemeksepetiVendorDto } from './dto/upsert-yemeksepeti-vendor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, CompanyStatus } from '@prisma/client';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';

@ApiTags('Firma Yönetimi')
@ApiBearerAuth()
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('profile')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma kendi bilgilerini getir' })
  @ApiResponse({ status: 200, description: 'Firma bilgileri' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async getProfile(@Request() req) {
    return this.companyService.findByUserId(req.user.id);
  }

  @Patch('profile')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma kendi bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Firma bilgileri güncellendi' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async updateProfile(
    @Request() req,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companyService.updateByUserId(req.user.id, updateCompanyDto);
  }

  @Get('profile/yemeksepeti')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma Yemeksepeti entegrasyon bilgilerini getir' })
  @ApiResponse({ status: 200, description: 'Yemeksepeti bilgileri' })
  async getYemeksepetiSettings(@Request() req) {
    return this.companyService.getYemeksepetiSettings(req.user.id);
  }

  @Put('profile/yemeksepeti')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma Yemeksepeti entegrasyon bilgilerini güncelle/oluştur' })
  @ApiResponse({ status: 200, description: 'Yemeksepeti bilgileri güncellendi' })
  async upsertYemeksepetiSettings(
    @Request() req,
    @Body() payload: UpsertYemeksepetiVendorDto,
  ) {
    return this.companyService.upsertYemeksepetiSettings(req.user.id, payload);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tüm firmaları listele' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: CompanyStatus })
  @ApiResponse({ status: 200, description: 'Firma listesi' })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('status') status?: CompanyStatus,
  ) {
    return this.companyService.findAll({
      skip,
      take,
      where: status ? { status } : undefined,
    });
  }

  @Get('pending')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bekleyen firma başvurularını listele' })
  @ApiResponse({ status: 200, description: 'Bekleyen başvuru listesi' })
  async findPending() {
    return this.companyService.findPendingApplications();
  }

  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firma istatistiklerini getir' })
  @ApiResponse({ status: 200, description: 'Firma istatistikleri' })
  async getStatistics() {
    return this.companyService.getStatistics();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firma detayını getir' })
  @ApiResponse({ status: 200, description: 'Firma detayı' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Get(':id/documents')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firma belgelerini getir' })
  @ApiResponse({ status: 200, description: 'Firma belgeleri' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async getDocuments(@Param('id') id: string) {
    return this.companyService.getDocuments(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firma durumunu güncelle (onay/red)' })
  @ApiResponse({ status: 200, description: 'Durum güncellendi' })
  @ApiResponse({ status: 403, description: 'İşlem izni yok' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCompanyStatusDto,
  ) {
    return this.companyService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Firmayı sil' })
  @ApiResponse({ status: 200, description: 'Firma başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async delete(@Param('id') id: string) {
    return this.companyService.delete(id);
  }
}
