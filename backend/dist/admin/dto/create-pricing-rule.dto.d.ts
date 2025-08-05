export declare enum PricingRuleType {
    DISTANCE = "DISTANCE",
    ZONE = "ZONE",
    PACKAGE_TYPE = "PACKAGE_TYPE",
    TIME_SLOT = "TIME_SLOT",
    URGENCY = "URGENCY",
    BASE_FEE = "BASE_FEE",
    MINIMUM_ORDER = "MINIMUM_ORDER"
}
export declare class CreatePricingRuleDto {
    name: string;
    type: PricingRuleType;
    parameters: Record<string, any>;
    priority?: number;
    isActive: boolean;
}
export declare class UpdatePricingRuleDto {
    name?: string;
    parameters?: Record<string, any>;
    priority?: number;
    isActive?: boolean;
}
