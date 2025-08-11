import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  Body, 
  Query, 
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
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
}