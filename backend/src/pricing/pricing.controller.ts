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
import { PricingService } from './pricing.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
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
  ApiBody 
} from '@nestjs/swagger';

@ApiTags('Fiyatlandırma Yönetimi')
@ApiBearerAuth()
@Controller('pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Yeni fiyatlandırma kuralı oluştur' })
  @ApiResponse({ status: 201, description: 'Kural oluşturuldu' })
  @ApiResponse({ status: 409, description: 'Kural zaten mevcut' })
  async create(@Body() createPricingRuleDto: CreatePricingRuleDto) {
    return this.pricingService.create(createPricingRuleDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tüm fiyatlandırma kurallarını listele' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Kural listesi' })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('isActive') isActive?: string,
  ) {
    return this.pricingService.findAll({
      skip,
      take,
      where: isActive !== undefined ? { isActive: isActive === 'true' } : undefined,
    });
  }

  @Get('active')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY)
  @ApiOperation({ summary: 'Aktif fiyatlandırma kurallarını listele' })
  @ApiResponse({ status: 200, description: 'Aktif kural listesi' })
  async findActive() {
    return this.pricingService.findActive();
  }

  @Post('calculate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY)
  @ApiOperation({ summary: 'Bölge bazlı fiyat hesapla' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        serviceAreaId: { type: 'string', description: 'Hizmet bölgesi ID' },
        distance: { type: 'number', description: 'Mesafe (km)' },
        duration: { type: 'number', description: 'Süre (dakika)' },
        packageSize: { type: 'string', enum: ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'] },
        deliveryType: { type: 'string', enum: ['STANDARD', 'EXPRESS'] },
        urgency: { type: 'string', enum: ['NORMAL', 'URGENT', 'VERY_URGENT'] },
      },
      required: ['serviceAreaId', 'distance'],
    },
  })
  @ApiResponse({ status: 200, description: 'Hesaplanan fiyat' })
  async calculatePrice(
    @Body() params: {
      serviceAreaId: string;
      distance: number;
      duration?: number;
      packageSize?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
      deliveryType?: 'STANDARD' | 'EXPRESS';
      urgency?: 'NORMAL' | 'URGENT' | 'VERY_URGENT';
    },
  ) {
    return this.pricingService.calculatePrice(params);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Fiyatlandırma kuralı detayını getir' })
  @ApiResponse({ status: 200, description: 'Kural detayı' })
  @ApiResponse({ status: 404, description: 'Kural bulunamadı' })
  async findOne(@Param('id') id: string) {
    return this.pricingService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Fiyatlandırma kuralını güncelle' })
  @ApiResponse({ status: 200, description: 'Kural güncellendi' })
  @ApiResponse({ status: 404, description: 'Kural bulunamadı' })
  @ApiResponse({ status: 409, description: 'İsim çakışması' })
  async update(
    @Param('id') id: string,
    @Body() updatePricingRuleDto: UpdatePricingRuleDto,
  ) {
    return this.pricingService.update(id, updatePricingRuleDto);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kural aktif/pasif durumunu değiştir' })
  @ApiResponse({ status: 200, description: 'Durum değiştirildi' })
  @ApiResponse({ status: 404, description: 'Kural bulunamadı' })
  async toggleActive(@Param('id') id: string) {
    return this.pricingService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Fiyatlandırma kuralını sil' })
  @ApiResponse({ status: 200, description: 'Kural silindi' })
  @ApiResponse({ status: 404, description: 'Kural bulunamadı' })
  @ApiResponse({ status: 409, description: 'Kural kullanımda' })
  async remove(@Param('id') id: string) {
    return this.pricingService.remove(id);
  }
}