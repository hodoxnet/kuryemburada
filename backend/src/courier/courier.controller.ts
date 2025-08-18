import { 
  Controller, 
  Get, 
  Patch, 
  Delete,
  Param, 
  Body, 
  Query, 
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
} from '@nestjs/common';
import { CourierService } from './courier.service';
import { UpdateCourierStatusDto } from './dto/update-courier-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, CourierStatus } from '@prisma/client';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';

@ApiTags('Kurye Yönetimi')
@ApiBearerAuth()
@Controller('couriers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  @Get('profile')
  @Roles(UserRole.COURIER)
  @ApiOperation({ summary: 'Kurye kendi profilini getir' })
  @ApiResponse({ status: 200, description: 'Kurye profil bilgileri' })
  @ApiResponse({ status: 404, description: 'Kurye profili bulunamadı' })
  async getProfile(@Request() req: any) {
    return this.courierService.findByUserId(req.user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tüm kuryeleri listele' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: CourierStatus })
  @ApiResponse({ status: 200, description: 'Kurye listesi' })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('status') status?: CourierStatus,
  ) {
    return this.courierService.findAll({
      skip,
      take,
      where: status ? { status } : undefined,
    });
  }

  @Get('pending')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bekleyen kurye başvurularını listele' })
  @ApiResponse({ status: 200, description: 'Bekleyen başvuru listesi' })
  async findPending() {
    return this.courierService.findPendingApplications();
  }

  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kurye istatistiklerini getir' })
  @ApiResponse({ status: 200, description: 'Kurye istatistikleri' })
  async getStatistics() {
    return this.courierService.getStatistics();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kurye detayını getir' })
  @ApiResponse({ status: 200, description: 'Kurye detayı' })
  @ApiResponse({ status: 404, description: 'Kurye bulunamadı' })
  async findOne(@Param('id') id: string) {
    return this.courierService.findOne(id);
  }

  @Get(':id/documents')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kurye belgelerini getir' })
  @ApiResponse({ status: 200, description: 'Kurye belgeleri' })
  @ApiResponse({ status: 404, description: 'Kurye bulunamadı' })
  async getDocuments(@Param('id') id: string) {
    return this.courierService.getDocuments(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kurye durumunu güncelle (onay/red)' })
  @ApiResponse({ status: 200, description: 'Durum güncellendi' })
  @ApiResponse({ status: 403, description: 'İşlem izni yok' })
  @ApiResponse({ status: 404, description: 'Kurye bulunamadı' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCourierStatusDto,
  ) {
    return this.courierService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kuryeyi sil' })
  @ApiResponse({ status: 200, description: 'Kurye başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Kurye bulunamadı' })
  async delete(@Param('id') id: string) {
    return this.courierService.delete(id);
  }

  @Patch(':id/availability')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COURIER)
  @ApiOperation({ summary: 'Kurye müsaitlik durumunu güncelle' })
  @ApiResponse({ status: 200, description: 'Müsaitlik durumu güncellendi' })
  @ApiResponse({ status: 404, description: 'Kurye bulunamadı' })
  async updateAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.courierService.updateAvailability(id, isAvailable);
  }
}