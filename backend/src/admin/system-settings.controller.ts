import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { SystemSettingsService } from './system-settings.service';
import {
  SystemSettingDto,
  UpdateSystemSettingDto,
  SystemSettingsDto,
} from './dto/system-settings.dto';

@ApiTags('Admin - System Settings')
@ApiBearerAuth()
@Controller('admin/system-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm sistem ayarlarını getir' })
  @ApiResponse({ status: 200, description: 'Sistem ayarları getirildi' })
  async findAll() {
    return this.systemSettingsService.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Belirli bir sistem ayarını getir' })
  @ApiResponse({ status: 200, description: 'Sistem ayarı getirildi' })
  @ApiResponse({ status: 404, description: 'Ayar bulunamadı' })
  async findOne(@Param('key') key: string) {
    return this.systemSettingsService.findOne(key);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni sistem ayarı oluştur' })
  @ApiResponse({ status: 201, description: 'Sistem ayarı oluşturuldu' })
  async create(@Body() dto: SystemSettingDto) {
    return this.systemSettingsService.create(dto);
  }

  @Put(':key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sistem ayarını güncelle' })
  @ApiResponse({ status: 200, description: 'Sistem ayarı güncellendi' })
  @ApiResponse({ status: 404, description: 'Ayar bulunamadı' })
  async update(@Param('key') key: string, @Body() dto: UpdateSystemSettingDto) {
    return this.systemSettingsService.update(key, dto);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toplu sistem ayarlarını güncelle' })
  @ApiResponse({ status: 200, description: 'Sistem ayarları güncellendi' })
  async updateBulk(@Body() dto: SystemSettingsDto) {
    return this.systemSettingsService.updateBulk(dto);
  }

  @Post('initialize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Varsayılan sistem ayarlarını oluştur' })
  @ApiResponse({ status: 200, description: 'Varsayılan ayarlar oluşturuldu' })
  async initializeDefaults() {
    return this.systemSettingsService.initializeDefaults();
  }
}
