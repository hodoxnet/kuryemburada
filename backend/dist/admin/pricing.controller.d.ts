import { PricingService } from './pricing.service';
import { CreatePricingRuleDto, UpdatePricingRuleDto } from './dto/create-pricing-rule.dto';
export declare class PricingController {
    private readonly pricingService;
    constructor(pricingService: PricingService);
    findAllRules(type?: string, isActive?: boolean): Promise<any>;
    findOneRule(id: number): Promise<any>;
    createRule(dto: CreatePricingRuleDto): Promise<any>;
    updateRule(id: number, dto: UpdatePricingRuleDto): Promise<any>;
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
