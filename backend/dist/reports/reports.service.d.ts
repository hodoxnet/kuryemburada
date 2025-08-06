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
            totalOrders: number;
            completedOrders: number;
            cancelledOrders: number;
            completionRate: number;
            totalRevenue: number;
            totalCommission: number;
            netRevenue: number;
            avgDeliveryTime: number;
        };
        users: {
            activeCompanies: number;
            activeCouriers: number;
            newCompanies: number;
            newCouriers: number;
        };
        topPerformers: {
            companies: {
                id: number;
                name: string;
                orderCount: number;
            }[];
            couriers: {
                id: number;
                name: string;
                deliveryCount: number;
            }[];
        };
    }>;
    getAdminOrderReport(filter: ReportFilterDto): Promise<{
        orders: ({
            company: {
                id: number;
                name: string;
            };
            courier: {
                id: number;
                fullName: string;
            } | null;
            payment: {
                id: number;
                status: import("@prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                orderId: number;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                transactionId: string | null;
                paidAt: Date | null;
                processedAt: Date | null;
                refundedAt: Date | null;
                refundAmount: import("@prisma/client/runtime/library").Decimal | null;
            } | null;
        } & {
            courierEarning: import("@prisma/client/runtime/library").Decimal | null;
            id: number;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: number;
            courierId: number | null;
            orderNumber: string;
            pickupAddressId: number;
            deliveryAddressId: number;
            recipientName: string;
            recipientPhone: string;
            packageType: import("@prisma/client").$Enums.PackageType;
            packageSize: string | null;
            packageWeight: import("@prisma/client/runtime/library").Decimal | null;
            urgency: import("@prisma/client").$Enums.UrgencyLevel;
            notes: string | null;
            specialInstructions: string | null;
            distance: import("@prisma/client/runtime/library").Decimal;
            estimatedTime: number;
            deliveryTime: number | null;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            urgencyFee: import("@prisma/client/runtime/library").Decimal;
            distanceFee: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
            paymentStatus: string | null;
            assignedAt: Date | null;
            pickedUpAt: Date | null;
            deliveredAt: Date | null;
            cancelledAt: Date | null;
            cancellationReason: string | null;
            deliveryProof: string | null;
            receiverSignature: string | null;
            trackingCode: string | null;
        })[];
        statistics: {
            byStatus: {
                status: import("@prisma/client").$Enums.OrderStatus;
                count: number;
            }[];
            byType: {
                type: import("@prisma/client").$Enums.PackageType;
                count: number;
            }[];
        };
        dailyTrend: unknown;
    }>;
    getAdminRevenueReport(filter: ReportFilterDto): Promise<{
        summary: {
            totalRevenue: number;
            totalPayments: number;
            avgPaymentAmount: number;
            totalCommission: number;
            netRevenue: number;
        };
        byPaymentMethod: {
            method: import("@prisma/client").$Enums.PaymentMethod;
            count: number;
            amount: number | import("@prisma/client/runtime/library").Decimal;
        }[];
        topCompanies: unknown;
        monthlyTrend: unknown;
    }>;
    getAdminPerformanceReport(filter: ReportFilterDto): Promise<{
        deliveryPerformance: {
            status: import("@prisma/client").$Enums.OrderStatus;
            count: number;
            avgDeliveryTime: number;
        }[];
        courierPerformance: unknown;
        companyActivity: unknown;
        averageMetrics: {
            avgOrderValue: number;
            avgDeliveryTime: number;
            avgDistance: number;
        };
    }>;
    getAdminRegionalReport(filter: ReportFilterDto): Promise<{
        regionalDistribution: unknown;
    }>;
    getCompanyOrderReport(companyId: number, filter: ReportFilterDto): Promise<{
        orders: ({
            courier: {
                id: number;
                fullName: string;
            } | null;
            payment: {
                id: number;
                status: import("@prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                orderId: number;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                transactionId: string | null;
                paidAt: Date | null;
                processedAt: Date | null;
                refundedAt: Date | null;
                refundAmount: import("@prisma/client/runtime/library").Decimal | null;
            } | null;
        } & {
            courierEarning: import("@prisma/client/runtime/library").Decimal | null;
            id: number;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: number;
            courierId: number | null;
            orderNumber: string;
            pickupAddressId: number;
            deliveryAddressId: number;
            recipientName: string;
            recipientPhone: string;
            packageType: import("@prisma/client").$Enums.PackageType;
            packageSize: string | null;
            packageWeight: import("@prisma/client/runtime/library").Decimal | null;
            urgency: import("@prisma/client").$Enums.UrgencyLevel;
            notes: string | null;
            specialInstructions: string | null;
            distance: import("@prisma/client/runtime/library").Decimal;
            estimatedTime: number;
            deliveryTime: number | null;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            urgencyFee: import("@prisma/client/runtime/library").Decimal;
            distanceFee: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
            paymentStatus: string | null;
            assignedAt: Date | null;
            pickedUpAt: Date | null;
            deliveredAt: Date | null;
            cancelledAt: Date | null;
            cancellationReason: string | null;
            deliveryProof: string | null;
            receiverSignature: string | null;
            trackingCode: string | null;
        })[];
        statistics: {
            status: import("@prisma/client").$Enums.OrderStatus;
            count: number;
            totalAmount: number | import("@prisma/client/runtime/library").Decimal;
        }[];
        dailyTrend: unknown;
    }>;
    getCompanyExpenseReport(companyId: number, filter: ReportFilterDto): Promise<{
        summary: {
            totalExpenses: number | import("@prisma/client/runtime/library").Decimal;
            totalPayments: number;
            avgPaymentAmount: number;
        };
        byPaymentMethod: {
            method: import("@prisma/client").$Enums.PaymentMethod;
            count: number;
            amount: number | import("@prisma/client/runtime/library").Decimal;
        }[];
        monthlyTrend: unknown;
    }>;
    getCompanyPerformanceReport(companyId: number, filter: ReportFilterDto): Promise<{
        deliveryPerformance: {
            status: import("@prisma/client").$Enums.OrderStatus;
            count: number;
            avgDeliveryTime: number;
        }[];
        averageMetrics: {
            avgDeliveryTime: number;
            avgOrderValue: number;
            avgDistance: number;
        };
        topCouriers: unknown;
    }>;
    getCompanyRoutesReport(companyId: number, filter: ReportFilterDto): Promise<{
        topRoutes: unknown;
    }>;
    getCourierEarningsReport(courierId: number, filter: ReportFilterDto): Promise<{
        summary: {
            totalEarnings: number;
            totalDeliveries: number;
            avgEarningPerDelivery: number;
        };
        dailyTrend: unknown;
        monthlyTrend: unknown;
    }>;
    getCourierDeliveriesReport(courierId: number, filter: ReportFilterDto): Promise<{
        deliveries: ({
            company: {
                id: number;
                name: string;
            };
        } & {
            courierEarning: import("@prisma/client/runtime/library").Decimal | null;
            id: number;
            status: import("@prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: number;
            courierId: number | null;
            orderNumber: string;
            pickupAddressId: number;
            deliveryAddressId: number;
            recipientName: string;
            recipientPhone: string;
            packageType: import("@prisma/client").$Enums.PackageType;
            packageSize: string | null;
            packageWeight: import("@prisma/client/runtime/library").Decimal | null;
            urgency: import("@prisma/client").$Enums.UrgencyLevel;
            notes: string | null;
            specialInstructions: string | null;
            distance: import("@prisma/client/runtime/library").Decimal;
            estimatedTime: number;
            deliveryTime: number | null;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            urgencyFee: import("@prisma/client/runtime/library").Decimal;
            distanceFee: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
            paymentStatus: string | null;
            assignedAt: Date | null;
            pickedUpAt: Date | null;
            deliveredAt: Date | null;
            cancelledAt: Date | null;
            cancellationReason: string | null;
            deliveryProof: string | null;
            receiverSignature: string | null;
            trackingCode: string | null;
        })[];
        statistics: {
            status: import("@prisma/client").$Enums.OrderStatus;
            count: number;
            totalEarnings: number;
            avgDeliveryTime: number;
        }[];
    }>;
    getCourierWorkingHoursReport(courierId: number, filter: ReportFilterDto): Promise<{
        workingDays: unknown;
    }>;
    getCourierCollectionsReport(courierId: number, filter: ReportFilterDto): Promise<{
        cashCollections: unknown;
    }>;
}
