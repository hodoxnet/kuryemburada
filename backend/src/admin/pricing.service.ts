import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePricingRuleDto,
  UpdatePricingRuleDto,
  PricingRuleType,
} from './dto/create-pricing-rule.dto';

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllRules(params: { type?: string; isActive?: boolean }) {
    const { type, isActive } = params;

    const where: any = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    return this.prisma.pricingRule.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOneRule(id: number) {
    const rule = await this.prisma.pricingRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException(`Pricing rule with ID ${id} not found`);
    }

    return rule;
  }

  async createRule(dto: CreatePricingRuleDto) {
    return this.prisma.pricingRule.create({
      data: {
        name: dto.name,
        type: dto.type,
        parameters: dto.parameters,
        priority: dto.priority || 100,
        isActive: dto.isActive,
      },
    });
  }

  async updateRule(id: number, dto: UpdatePricingRuleDto) {
    const rule = await this.prisma.pricingRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException(`Pricing rule with ID ${id} not found`);
    }

    return this.prisma.pricingRule.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.parameters && { parameters: dto.parameters }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deleteRule(id: number) {
    const rule = await this.prisma.pricingRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException(`Pricing rule with ID ${id} not found`);
    }

    await this.prisma.pricingRule.delete({
      where: { id },
    });

    return {
      message: 'Fiyatlandırma kuralı başarıyla silindi',
    };
  }

  async calculatePrice(dto: {
    distance: number;
    packageType: string;
    urgency: string;
    zone?: string;
  }) {
    const activeRules = await this.prisma.pricingRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' },
    });

    let totalPrice = 0;
    const breakdown: any[] = [];

    // Base fee
    const baseFeeRule = activeRules.find(
      (r) => r.type === PricingRuleType.BASE_FEE,
    );
    if (baseFeeRule) {
      const baseFee = baseFeeRule.parameters?.['amount'] || 0;
      totalPrice += baseFee;
      breakdown.push({
        type: 'Base Fee',
        amount: baseFee,
      });
    }

    // Distance pricing
    const distanceRule = activeRules.find(
      (r) => r.type === PricingRuleType.DISTANCE,
    );
    if (distanceRule && dto.distance) {
      const pricePerKm = distanceRule.parameters?.['pricePerKm'] || 0;
      const distancePrice = dto.distance * pricePerKm;
      totalPrice += distancePrice;
      breakdown.push({
        type: 'Distance',
        amount: distancePrice,
        detail: `${dto.distance} km x ${pricePerKm} TL`,
      });
    }

    // Package type multiplier
    const packageRule = activeRules.find(
      (r) => r.type === PricingRuleType.PACKAGE_TYPE,
    );
    if (packageRule && dto.packageType) {
      const multiplier = packageRule.parameters?.[dto.packageType] || 1;
      if (multiplier > 1) {
        const additionalPrice = totalPrice * (multiplier - 1);
        totalPrice += additionalPrice;
        breakdown.push({
          type: 'Package Type',
          amount: additionalPrice,
          detail: `${dto.packageType} multiplier: ${multiplier}x`,
        });
      }
    }

    // Urgency fee
    const urgencyRule = activeRules.find(
      (r) => r.type === PricingRuleType.URGENCY,
    );
    if (urgencyRule && dto.urgency) {
      const urgencyFee = urgencyRule.parameters?.[dto.urgency] || 0;
      if (urgencyFee > 0) {
        totalPrice += urgencyFee;
        breakdown.push({
          type: 'Urgency',
          amount: urgencyFee,
          detail: dto.urgency,
        });
      }
    }

    // Zone pricing
    if (dto.zone) {
      const zoneRule = activeRules.find((r) => r.type === PricingRuleType.ZONE);
      if (zoneRule) {
        const zoneFee = zoneRule.parameters?.[dto.zone] || 0;
        if (zoneFee > 0) {
          totalPrice += zoneFee;
          breakdown.push({
            type: 'Zone',
            amount: zoneFee,
            detail: dto.zone,
          });
        }
      }
    }

    // Minimum order check
    const minimumOrderRule = activeRules.find(
      (r) => r.type === PricingRuleType.MINIMUM_ORDER,
    );
    if (minimumOrderRule) {
      const minimumAmount = minimumOrderRule.parameters?.['amount'] || 0;
      if (totalPrice < minimumAmount) {
        breakdown.push({
          type: 'Minimum Order Adjustment',
          amount: minimumAmount - totalPrice,
        });
        totalPrice = minimumAmount;
      }
    }

    return {
      totalPrice: Math.round(totalPrice * 100) / 100,
      breakdown,
      parameters: dto,
    };
  }
}
