import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
  ApiParam 
} from '@nestjs/swagger';

@ApiTags('Sistem Parametreleri')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Yeni sistem ayarı oluştur' })
  @ApiResponse({ status: 201, description: 'Ayar oluşturuldu' })
  @ApiResponse({ status: 409, description: 'Anahtar zaten mevcut' })
  async create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Post('initialize')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Varsayılan ayarları oluştur' })
  @ApiResponse({ status: 201, description: 'Varsayılan ayarlar oluşturuldu' })
  async initializeDefaults() {
    return this.settingsService.initializeDefaults();
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tüm sistem ayarlarını listele' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Ayar listesi' })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number,
  ) {
    return this.settingsService.findAll({ skip, take });
  }

  @Get('defaults')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Varsayılan ayar değerlerini getir' })
  @ApiResponse({ status: 200, description: 'Varsayılan değerler' })
  async getDefaults() {
    return this.settingsService.getDefaultSettings();
  }

  @Get('category/:category')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kategoriye göre ayarları getir' })
  @ApiParam({ name: 'category', description: 'Ayar kategorisi' })
  @ApiResponse({ status: 200, description: 'Kategori ayarları' })
  async getByCategory(@Param('category') category: string) {
    return this.settingsService.getByCategory(category);
  }

  @Patch('category/:category')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kategori ayarlarını toplu güncelle' })
  @ApiParam({ name: 'category', description: 'Ayar kategorisi' })
  @ApiResponse({ status: 200, description: 'Ayarlar güncellendi' })
  async updateByCategory(
    @Param('category') category: string,
    @Body() values: Record<string, any>,
  ) {
    return this.settingsService.updateByCategory(category, values);
  }

  @Get(':key')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tek bir ayarı getir' })
  @ApiParam({ name: 'key', description: 'Ayar anahtarı' })
  @ApiResponse({ status: 200, description: 'Ayar detayı' })
  @ApiResponse({ status: 404, description: 'Ayar bulunamadı' })
  async findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Patch(':key')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Sistem ayarını güncelle' })
  @ApiParam({ name: 'key', description: 'Ayar anahtarı' })
  @ApiResponse({ status: 200, description: 'Ayar güncellendi' })
  @ApiResponse({ status: 404, description: 'Ayar bulunamadı' })
  async update(
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    return this.settingsService.update(key, updateSettingDto);
  }

  @Delete(':key')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Sistem ayarını sil' })
  @ApiParam({ name: 'key', description: 'Ayar anahtarı' })
  @ApiResponse({ status: 200, description: 'Ayar silindi' })
  @ApiResponse({ status: 404, description: 'Ayar bulunamadı' })
  async remove(@Param('key') key: string) {
    return this.settingsService.remove(key);
  }
}