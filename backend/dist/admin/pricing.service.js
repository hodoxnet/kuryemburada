"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const create_pricing_rule_dto_1 = require("./dto/create-pricing-rule.dto");
let PricingService = class PricingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllRules(params) {
        const { type, isActive } = params;
        const where = {};
        if (type)
            where.ruleType = type;
        if (isActive !== undefined)
            where.isActive = isActive;
        return this.prisma.pricingRule.findMany({
            where,
            orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        });
    }
    async findOneRule(id) {
        const rule = await this.prisma.pricingRule.findUnique({
            where: { id },
        });
        if (!rule) {
            throw new common_1.NotFoundException(`Pricing rule with ID ${id} not found`);
        }
        return rule;
    }
    async createRule(dto) {
        return this.prisma.pricingRule.create({
            data: {
                name: dto.name,
                ruleType: dto.type,
                parameters: dto.parameters,
                priority: dto.priority || 100,
                isActive: dto.isActive,
            },
        });
    }
    async updateRule(id, dto) {
        const rule = await this.prisma.pricingRule.findUnique({
            where: { id },
        });
        if (!rule) {
            throw new common_1.NotFoundException(`Pricing rule with ID ${id} not found`);
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
    async deleteRule(id) {
        const rule = await this.prisma.pricingRule.findUnique({
            where: { id },
        });
        if (!rule) {
            throw new common_1.NotFoundException(`Pricing rule with ID ${id} not found`);
        }
        await this.prisma.pricingRule.delete({
            where: { id },
        });
        return {
            message: 'Fiyatlandırma kuralı başarıyla silindi',
        };
    }
    async calculatePrice(dto) {
        const activeRules = await this.prisma.pricingRule.findMany({
            where: { isActive: true },
            orderBy: { priority: 'asc' },
        });
        let totalPrice = 0;
        const breakdown = [];
        const baseFeeRule = activeRules.find((r) => r.ruleType === create_pricing_rule_dto_1.PricingRuleType.BASE_FEE);
        if (baseFeeRule) {
            const baseFee = baseFeeRule.parameters?.['amount'] || 0;
            totalPrice += baseFee;
            breakdown.push({
                type: 'Base Fee',
                amount: baseFee,
            });
        }
        const distanceRule = activeRules.find((r) => r.ruleType === create_pricing_rule_dto_1.PricingRuleType.DISTANCE);
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
        const packageRule = activeRules.find((r) => r.ruleType === create_pricing_rule_dto_1.PricingRuleType.PACKAGE_TYPE);
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
        const urgencyRule = activeRules.find((r) => r.ruleType === create_pricing_rule_dto_1.PricingRuleType.URGENCY);
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
        if (dto.zone) {
            const zoneRule = activeRules.find((r) => r.ruleType === create_pricing_rule_dto_1.PricingRuleType.ZONE);
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
        const minimumOrderRule = activeRules.find((r) => r.ruleType === create_pricing_rule_dto_1.PricingRuleType.MINIMUM_ORDER);
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
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map