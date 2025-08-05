import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentStatusDto, PaymentFilterDto, CreatePaymentDto } from './dto/payment-management.dto';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filter: PaymentFilterDto, page: number, limit: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findPending(): Promise<any>;
    findOne(id: number): Promise<any>;
    create(dto: CreatePaymentDto): Promise<{
        message: string;
        payment: any;
    }>;
    approve(id: number, transactionReference?: string): Promise<{
        message: string;
        payment: any;
    }>;
    reject(id: number, reason: string): Promise<{
        message: string;
        payment: any;
    }>;
    updateStatus(id: number, dto: UpdatePaymentStatusDto): Promise<{
        message: string;
        payment: any;
    }>;
    refund(id: number, reason: string, amount?: number): Promise<{
        message: string;
        refund: any;
        refundAmount: any;
    }>;
    getStatistics(startDate?: string, endDate?: string): Promise<{
        summary: {
            totalPayments: any;
            pendingPayments: any;
            completedPayments: any;
            failedPayments: any;
            totalAmount: any;
            pendingAmount: any;
            completedAmount: any;
            refundedAmount: any;
            totalCommission: number;
        };
        byMethod: any;
        byStatus: any;
        recentPayments: any;
    }>;
}
