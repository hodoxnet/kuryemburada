import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getAdminOverview(filter: ReportFilterDto): Promise<{
        overview: {
            totalOrders: any;
            completedOrders: any;
            cancelledOrders: any;
            completionRate: number;
            totalRevenue: any;
            totalCommission: number;
            netRevenue: number;
            avgDeliveryTime: any;
        };
        users: {
            activeCompanies: any;
            activeCouriers: any;
            newCompanies: any;
            newCouriers: any;
        };
        topPerformers: {
            companies: any;
            couriers: any;
        };
    }>;
    getAdminOrderReport(filter: ReportFilterDto): Promise<{
        orders: any;
        statistics: {
            byStatus: any;
            byType: any;
        };
        dailyTrend: any;
    }>;
    getAdminRevenueReport(filter: ReportFilterDto): Promise<{
        summary: {
            totalRevenue: any;
            totalPayments: any;
            avgPaymentAmount: number;
            totalCommission: number;
            netRevenue: number;
        };
        byPaymentMethod: any;
        topCompanies: any;
        monthlyTrend: any;
    }>;
    getAdminPerformanceReport(filter: ReportFilterDto): Promise<{
        deliveryPerformance: any;
        courierPerformance: any;
        companyActivity: any;
        averageMetrics: {
            avgOrderValue: any;
            avgDeliveryTime: any;
            avgDistance: any;
        };
    }>;
    getAdminRegionalReport(filter: ReportFilterDto): Promise<{
        regionalDistribution: any;
    }>;
    getCompanyOrderReport(req: any, filter: ReportFilterDto): Promise<{
        orders: any;
        statistics: any;
        dailyTrend: any;
    }>;
    getCompanyExpenseReport(req: any, filter: ReportFilterDto): Promise<{
        summary: {
            totalExpenses: any;
            totalPayments: any;
            avgPaymentAmount: number;
        };
        byPaymentMethod: any;
        monthlyTrend: any;
    }>;
    getCompanyPerformanceReport(req: any, filter: ReportFilterDto): Promise<{
        deliveryPerformance: any;
        averageMetrics: {
            avgDeliveryTime: any;
            avgOrderValue: any;
            avgDistance: any;
        };
        topCouriers: any;
    }>;
    getCompanyRoutesReport(req: any, filter: ReportFilterDto): Promise<{
        topRoutes: any;
    }>;
    getCourierEarningsReport(req: any, filter: ReportFilterDto): Promise<{
        summary: {
            totalEarnings: any;
            totalDeliveries: any;
            avgEarningPerDelivery: number;
        };
        dailyTrend: any;
        monthlyTrend: any;
    }>;
    getCourierDeliveriesReport(req: any, filter: ReportFilterDto): Promise<{
        deliveries: any;
        statistics: any;
    }>;
    getCourierWorkingHoursReport(req: any, filter: ReportFilterDto): Promise<{
        workingDays: any;
    }>;
    getCourierCollectionsReport(req: any, filter: ReportFilterDto): Promise<{
        cashCollections: any;
    }>;
}
