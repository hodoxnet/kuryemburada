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
    ruleId: string;
    distance: number;
    duration: number;
    isRushHour?: boolean;
    isBadWeather?: boolean;
  }) {
    const { ruleId, distance, duration, isRushHour = false, isBadWeather = false } = params;

    const rule = await this.findOne(ruleId);

    if (!rule.isActive) {
      throw new ConflictException('Bu fiyatlandırma kuralı aktif değil');
    }

    let price = rule.basePrice;
    price += distance * rule.pricePerKm;
    price += duration * rule.pricePerMinute;

    if (isRushHour && rule.rushHourMultiplier) {
      price *= rule.rushHourMultiplier;
    }

    if (isBadWeather && rule.weatherMultiplier) {
      price *= rule.weatherMultiplier;
    }

    price = Math.max(price, rule.minimumPrice);

    return {
      basePrice: rule.basePrice,
      distancePrice: distance * rule.pricePerKm,
      durationPrice: duration * rule.pricePerMinute,
      rushHourMultiplier: isRushHour ? rule.rushHourMultiplier : 1,
      weatherMultiplier: isBadWeather ? rule.weatherMultiplier : 1,
      totalPrice: Math.round(price * 100) / 100,
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