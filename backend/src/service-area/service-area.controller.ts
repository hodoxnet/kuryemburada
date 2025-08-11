import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ServiceAreaService } from './service-area.service';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('service-areas')
@Controller('service-areas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ServiceAreaController {
  constructor(private readonly serviceAreaService: ServiceAreaService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Yeni hizmet bölgesi oluştur' })
  @ApiResponse({ status: 201, description: 'Bölge başarıyla oluşturuldu' })
  create(@Body() createServiceAreaDto: CreateServiceAreaDto) {
    return this.serviceAreaService.create(createServiceAreaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm hizmet bölgelerini listele' })
  @ApiResponse({ status: 200, description: 'Bölgeler listelendi' })
  findAll(
    @Query('isActive') isActive?: string,
    @Query('city') city?: string,
    @Query('district') district?: string,
  ) {
    return this.serviceAreaService.findAll({
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      city,
      district,
    });
  }

  @Get('active')
  @ApiOperation({ summary: 'Aktif hizmet bölgelerini listele' })
  @ApiResponse({ status: 200, description: 'Aktif bölgeler listelendi' })
  findActive() {
    return this.serviceAreaService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Belirli bir hizmet bölgesini getir' })
  @ApiResponse({ status: 200, description: 'Bölge detayları' })
  @ApiResponse({ status: 404, description: 'Bölge bulunamadı' })
  findOne(@Param('id') id: string) {
    return this.serviceAreaService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Hizmet bölgesini güncelle' })
  @ApiResponse({ status: 200, description: 'Bölge güncellendi' })
  @ApiResponse({ status: 404, description: 'Bölge bulunamadı' })
  update(
    @Param('id') id: string,
    @Body() updateServiceAreaDto: UpdateServiceAreaDto,
  ) {
    return this.serviceAreaService.update(id, updateServiceAreaDto);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bölgeyi aktif/pasif yap' })
  @ApiResponse({ status: 200, description: 'Bölge durumu güncellendi' })
  @ApiResponse({ status: 404, description: 'Bölge bulunamadı' })
  toggleActive(@Param('id') id: string) {
    return this.serviceAreaService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Hizmet bölgesini sil' })
  @ApiResponse({ status: 200, description: 'Bölge silindi' })
  @ApiResponse({ status: 404, description: 'Bölge bulunamadı' })
  @ApiResponse({ status: 400, description: 'Bölgede aktif siparişler var' })
  remove(@Param('id') id: string) {
    return this.serviceAreaService.remove(id);
  }

  @Get(':id/statistics')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bölge istatistikleri' })
  @ApiResponse({ status: 200, description: 'Bölge istatistikleri' })
  getStatistics(@Param('id') id: string) {
    return this.serviceAreaService.getStatistics(id);
  }
}