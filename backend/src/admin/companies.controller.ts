import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CompaniesService } from './companies.service';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';

@ApiTags('Admin - Companies')
@ApiBearerAuth()
@Controller('admin/companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm firmaları listele' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Firmalar başarıyla listelendi' })
  async findAll(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.companiesService.findAll({ status, page, limit });
  }

  @Get('pending')
  @ApiOperation({ summary: 'Onay bekleyen firmaları listele' })
  @ApiResponse({
    status: 200,
    description: 'Onay bekleyen firmalar listelendi',
  })
  async findPending() {
    return this.companiesService.findPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Firma detaylarını getir' })
  @ApiResponse({ status: 200, description: 'Firma detayları getirildi' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @Put(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Firma başvurusunu onayla' })
  @ApiResponse({ status: 200, description: 'Firma başarıyla onaylandı' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.approve(id);
  }

  @Put(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Firma başvurusunu reddet' })
  @ApiResponse({ status: 200, description: 'Firma başarıyla reddedildi' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { rejectionReason: string },
  ) {
    return this.companiesService.reject(id, dto.rejectionReason);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Firma durumunu güncelle' })
  @ApiResponse({ status: 200, description: 'Firma durumu güncellendi' })
  @ApiResponse({ status: 404, description: 'Firma bulunamadı' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyStatusDto,
  ) {
    return this.companiesService.updateStatus(id, dto);
  }
}
