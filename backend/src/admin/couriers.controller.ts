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
import { CouriersService } from './couriers.service';
import { UpdateCourierStatusDto } from './dto/update-courier-status.dto';

@ApiTags('Admin - Couriers')
@ApiBearerAuth()
@Controller('admin/couriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class CouriersController {
  constructor(private readonly couriersService: CouriersService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kuryeleri listele' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Kuryeler başarıyla listelendi' })
  async findAll(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.couriersService.findAll({ status, page, limit });
  }

  @Get('pending')
  @ApiOperation({ summary: 'Onay bekleyen kuryeleri listele' })
  @ApiResponse({
    status: 200,
    description: 'Onay bekleyen kuryeler listelendi',
  })
  async findPending() {
    return this.couriersService.findPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kurye detaylarını getir' })
  @ApiResponse({ status: 200, description: 'Kurye detayları getirildi' })
  @ApiResponse({ status: 404, description: 'Kurye bulunamadı' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.couriersService.findOne(id);
  }

  @Put(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kurye başvurusunu onayla' })
  @ApiResponse({ status: 200, description: 'Kurye başarıyla onaylandı' })
  @ApiResponse({ status: 404, description: 'Kurye bulunamadı' })
  async approve(@Param('id', ParseIntPipe) id: number) {
    return this.couriersService.approve(id);
  }

  @Put(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kurye başvurusunu reddet' })
  @ApiResponse({ status: 200, description: 'Kurye başarıyla reddedildi' })
  @ApiResponse({ status: 404, description: 'Kurye bulunamadı' })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { rejectionReason: string },
  ) {
    return this.couriersService.reject(id, dto.rejectionReason);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kurye durumunu güncelle' })
  @ApiResponse({ status: 200, description: 'Kurye durumu güncellendi' })
  @ApiResponse({ status: 404, description: 'Kurye bulunamadı' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourierStatusDto,
  ) {
    return this.couriersService.updateStatus(id, dto);
  }
}
