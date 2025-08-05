export declare enum ReportPeriod {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
    CUSTOM = "CUSTOM"
}
export declare class ReportFilterDto {
    startDate?: string;
    endDate?: string;
    period?: ReportPeriod;
    companyId?: number;
    courierId?: number;
    region?: string;
}
