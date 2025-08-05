import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { PricingService } from './pricing.service';
import {
  CreatePricingRuleDto,
  UpdatePricingRuleDto,
} from './dto/create-pricing-rule.dto';

@ApiTags('Admin - Pricing')
@ApiBearerAuth()
@Controller('admin/pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('rules')
  @ApiOperation({ summary: 'Tüm fiyatlandırma kurallarını listele' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: [
      'DISTANCE',
      'ZONE',
      'PACKAGE_TYPE',
      'TIME_SLOT',
      'URGENCY',
      'BASE_FEE',
      'MINIMUM_ORDER',
    ],
  })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Fiyatlandırma kuralları listelendi',
  })
  async findAllRules(
    @Query('type') type?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.pricingService.findAllRules({ type, isActive });
  }

  @Get('rules/:id')
  @ApiOperation({ summary: 'Fiyatlandırma kuralı detayını getir' })
  @ApiResponse({ status: 200, description: 'Fiyatlandırma kuralı getirildi' })
  @ApiResponse({ status: 404, description: 'Kural bulunamadı' })
  async findOneRule(@Param('id', ParseIntPipe) id: number) {
    return this.pricingService.findOneRule(id);
  }

  @Post('rules')
  @ApiOperation({ summary: 'Yeni fiyatlandırma kuralı oluştur' })
  @ApiResponse({ status: 201, description: 'Fiyatlandırma kuralı oluşturuldu' })
  async createRule(@Body() dto: CreatePricingRuleDto) {
    return this.pricingService.createRule(dto);
  }

  @Put('rules/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fiyatlandırma kuralını güncelle' })
  @ApiResponse({ status: 200, description: 'Fiyatlandırma kuralı güncellendi' })
  @ApiResponse({ status: 404, description: 'Kural bulunamadı' })
  async updateRule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePricingRuleDto,
  ) {
    return this.pricingService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fiyatlandırma kuralını sil' })
  @ApiResponse({ status: 200, description: 'Fiyatlandırma kuralı silindi' })
  @ApiResponse({ status: 404, description: 'Kural bulunamadı' })
  async deleteRule(@Param('id', ParseIntPipe) id: number) {
    return this.pricingService.deleteRule(id);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Fiyat hesapla' })
  @ApiResponse({ status: 200, description: 'Fiyat hesaplandı' })
  async calculatePrice(
    @Body()
    dto: {
      distance: number;
      packageType: string;
      urgency: string;
      zone?: string;
    },
  ) {
    return this.pricingService.calculatePrice(dto);
  }
}
