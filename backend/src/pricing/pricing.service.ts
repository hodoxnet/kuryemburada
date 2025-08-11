import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { Prisma } from '@prisma/client';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class PricingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async create(createPricingRuleDto: CreatePricingRuleDto) {
    const existingRule = await this.prisma.pricingRule.findFirst({
      where: { 
        name: createPricingRuleDto.name,
      },
    });

    if (existingRule) {
      throw new ConflictException('Bu isimde bir fiyatlandırma kuralı zaten mevcut');
    }

    const pricingRule = await this.prisma.pricingRule.create({
      data: {
        ...createPricingRuleDto,
        isActive: createPricingRuleDto.isActive ?? true,
      },
    });

    this.logger.info('Yeni fiyatlandırma kuralı oluşturuldu', {
      ruleId: pricingRule.id,
      name: pricingRule.name,
    });

    return pricingRule;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.PricingRuleWhereInput;
    orderBy?: Prisma.PricingRuleOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 10, where, orderBy } = params || {};

    const [rules, total] = await Promise.all([
      this.prisma.pricingRule.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
      }),
      this.prisma.pricingRule.count({ where }),
    ]);

    return {
      data: rules,
      total,
      skip,
      take,
    };
  }

  async findActive() {
    return this.findAll({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const pricingRule = await this.prisma.pricingRule.findUnique({
      where: { id },
    });

    if (!pricingRule) {
      throw new NotFoundException(`Fiyatlandırma kuralı bulunamadı: ${id}`);
    }

    return pricingRule;
  }

  async update(id: string, updatePricingRuleDto: UpdatePricingRuleDto) {
    await this.findOne(id);

    if (updatePricingRuleDto.name) {
      const existingRule = await this.prisma.pricingRule.findFirst({
        where: { 
          name: updatePricingRuleDto.name,
          NOT: { id },
        },
      });

      if (existingRule) {
        throw new ConflictException('Bu isimde bir fiyatlandırma kuralı zaten mevcut');
      }
    }

    const updatedRule = await this.prisma.pricingRule.update({
      where: { id },
      data: updatePricingRuleDto,
    });

    this.logger.info('Fiyatlandırma kuralı güncellendi', {
      ruleId: id,
      updates: updatePricingRuleDto,
    });

    return updatedRule;
  }

  async remove(id: string) {
    await this.findOne(id);

    const ordersUsingRule = await this.prisma.order.count({
      where: { pricingRuleId: id },
    });

    if (ordersUsingRule > 0) {
      throw new ConflictException(
        `Bu fiyatlandırma kuralı ${ordersUsingRule} sipariş tarafından kullanılıyor ve silinemez`
      );
    }

    const deletedRule = await this.prisma.pricingRule.delete({
      where: { id },
    });

    this.logger.info('Fiyatlandırma kuralı silindi', {
      ruleId: id,
      name: deletedRule.name,
    });

    return deletedRule;
  }

  async calculatePrice(params: {
    distance: number;
    duration?: number;
    packageSize?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
    deliveryType?: 'STANDARD' | 'EXPRESS';
    urgency?: 'NORMAL' | 'URGENT' | 'VERY_URGENT';
  }) {
    const { 
      distance, 
      duration = 15, 
      packageSize = 'MEDIUM',
      deliveryType = 'STANDARD',
      urgency = 'NORMAL'
    } = params;

    // Aktif genel fiyatlandırma kuralını al
    const rule = await this.prisma.pricingRule.findFirst({
      where: { 
        isActive: true,
        serviceAreaId: null // Genel kural
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!rule) {
      throw new NotFoundException('Aktif fiyatlandırma kuralı bulunamadı');
    }

    // Temel fiyat hesaplama
    let price = rule.basePrice;
    price += distance * rule.pricePerKm;
    price += duration * rule.pricePerMinute;

    // Paket boyutu katsayısı
    const sizeMultipliers = {
      SMALL: 1,
      MEDIUM: 1.2,
      LARGE: 1.5,
      EXTRA_LARGE: 2,
    };
    price *= sizeMultipliers[packageSize];

    // Teslimat tipi
    if (deliveryType === 'EXPRESS') {
      price *= 1.5;
    }

    // Aciliyet
    const urgencyMultipliers = {
      NORMAL: 1,
      URGENT: 1.3,
      VERY_URGENT: 1.6,
    };
    price *= urgencyMultipliers[urgency];

    // Minimum fiyat kontrolü
    price = Math.max(price, rule.minimumPrice);

    return {
      price: Math.round(price * 100) / 100,
      basePrice: rule.basePrice,
      distancePrice: distance * rule.pricePerKm,
      durationPrice: duration * rule.pricePerMinute,
      minimumPrice: rule.minimumPrice,
    };
  }

  async toggleActive(id: string) {
    const rule = await this.findOne(id);

    const updatedRule = await this.prisma.pricingRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });

    this.logger.info('Fiyatlandırma kuralı durumu değiştirildi', {
      ruleId: id,
      isActive: updatedRule.isActive,
    });

    return updatedRule;
  }
}