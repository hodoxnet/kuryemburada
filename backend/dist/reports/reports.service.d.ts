import { PrismaService } from '../prisma/prisma.service';
import { ReportFilterDto } from './dto/report-filter.dto';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCompanyIdFromUser(userId: number): Promise<number>;
    getCourierIdFromUser(userId: number): Promise<number>;
    private getDateRange;
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
    getCompanyOrderReport(companyId: number, filter: ReportFilterDto): Promise<{
        orders: any;
        statistics: any;
        dailyTrend: any;
    }>;
    getCompanyExpenseReport(companyId: number, filter: ReportFilterDto): Promise<{
        summary: {
            totalExpenses: any;
            totalPayments: any;
            avgPaymentAmount: number;
        };
        byPaymentMethod: any;
        monthlyTrend: any;
    }>;
    getCompanyPerformanceReport(companyId: number, filter: ReportFilterDto): Promise<{
        deliveryPerformance: any;
        averageMetrics: {
            avgDeliveryTime: any;
            avgOrderValue: any;
            avgDistance: any;
        };
        topCouriers: any;
    }>;
    getCompanyRoutesReport(companyId: number, filter: ReportFilterDto): Promise<{
        topRoutes: any;
    }>;
    getCourierEarningsReport(courierId: number, filter: ReportFilterDto): Promise<{
        summary: {
            totalEarnings: any;
            totalDeliveries: any;
            avgEarningPerDelivery: number;
        };
        dailyTrend: any;
        monthlyTrend: any;
    }>;
    getCourierDeliveriesReport(courierId: number, filter: ReportFilterDto): Promise<{
        deliveries: any;
        statistics: any;
    }>;
    getCourierWorkingHoursReport(courierId: number, filter: ReportFilterDto): Promise<{
        workingDays: any;
    }>;
    getCourierCollectionsReport(courierId: number, filter: ReportFilterDto): Promise<{
        cashCollections: any;
    }>;
}
