import { PaymentStatus, PaymentMethod } from '@prisma/client';
export declare class UpdatePaymentStatusDto {
    status: PaymentStatus;
    note?: string;
    transactionReference?: string;
}
export declare class PaymentFilterDto {
    status?: PaymentStatus;
    method?: PaymentMethod;
    companyId?: number;
    courierId?: number;
    startDate?: string;
    endDate?: string;
}
export declare class CreatePaymentDto {
    orderId: number;
    amount: number;
    method: PaymentMethod;
    description?: string;
}
