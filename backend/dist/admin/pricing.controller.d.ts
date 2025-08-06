import { PricingService } from './pricing.service';
import { CreatePricingRuleDto, UpdatePricingRuleDto } from './dto/create-pricing-rule.dto';
export declare class PricingController {
    private readonly pricingService;
    constructor(pricingService: PricingService);
    findAllRules(type?: string, isActive?: boolean): Promise<{
        description: string | null;
        parameters: import("@prisma/client/runtime/library").JsonValue;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        priority: number;
        isActive: boolean;
        ruleType: string;
        validFrom: Date | null;
        validUntil: Date | null;
    }[]>;
    findOneRule(id: number): Promise<{
        description: string | null;
        parameters: import("@prisma/client/runtime/library").JsonValue;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        priority: number;
        isActive: boolean;
        ruleType: string;
        validFrom: Date | null;
        validUntil: Date | null;
    }>;
    createRule(dto: CreatePricingRuleDto): Promise<{
        description: string | null;
        parameters: import("@prisma/client/runtime/library").JsonValue;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        priority: number;
        isActive: boolean;
        ruleType: string;
        validFrom: Date | null;
        validUntil: Date | null;
    }>;
    updateRule(id: number, dto: UpdatePricingRuleDto): Promise<{
        description: string | null;
        parameters: import("@prisma/client/runtime/library").JsonValue;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        priority: number;
        isActive: boolean;
        ruleType: string;
        validFrom: Date | null;
        validUntil: Date | null;
    }>;
    deleteRule(id: number): Promise<{
        message: string;
    }>;
    calculatePrice(dto: {
        distance: number;
        packageType: string;
        urgency: string;
        zone?: string;
    }): Promise<{
        totalPrice: number;
        breakdown: any[];
        parameters: {
            distance: number;
            packageType: string;
            urgency: string;
            zone?: string;
        };
    }>;
}
