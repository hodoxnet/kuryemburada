import { CompaniesService } from './companies.service';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    findAll(status?: string, page?: number, limit?: number): Promise<{
        data: ({
            user: {
                email: string;
                id: number;
                emailVerified: boolean;
                phoneVerified: boolean;
                createdAt: Date;
            };
            _count: {
                orders: number;
            };
            documents: {
                id: number;
                status: import("@prisma/client").$Enums.DocumentStatus;
                createdAt: Date;
                updatedAt: Date;
                rejectionReason: string | null;
                entityType: string;
                entityId: number;
                documentType: import("@prisma/client").$Enums.DocumentType;
                fileUrl: string;
                fileName: string;
                fileSize: number;
                mimeType: string;
                verifiedBy: number | null;
                verifiedAt: Date | null;
                expiryDate: Date | null;
            }[];
        } & {
            id: number;
            status: import("@prisma/client").$Enums.CompanyStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: number;
            rejectionReason: string | null;
            taxNumber: string;
            taxOffice: string;
            kepAddress: string | null;
            phone: string;
            address: import("@prisma/client/runtime/library").JsonValue;
            bankInfo: import("@prisma/client/runtime/library").JsonValue | null;
            authorizedPerson: import("@prisma/client/runtime/library").JsonValue;
            tradeRegistry: string | null;
            activityArea: string | null;
            logo: string | null;
            approvedAt: Date | null;
            balance: import("@prisma/client/runtime/library").Decimal;
            creditLimit: import("@prisma/client/runtime/library").Decimal;
            commission: import("@prisma/client/runtime/library").Decimal;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findPending(): Promise<({
        user: {
            email: string;
            id: number;
            createdAt: Date;
        };
        documents: {
            id: number;
            status: import("@prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
            rejectionReason: string | null;
            entityType: string;
            entityId: number;
            documentType: import("@prisma/client").$Enums.DocumentType;
            fileUrl: string;
            fileName: string;
            fileSize: number;
            mimeType: string;
            verifiedBy: number | null;
            verifiedAt: Date | null;
            expiryDate: Date | null;
        }[];
    } & {
        id: number;
        status: import("@prisma/client").$Enums.CompanyStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: number;
        rejectionReason: string | null;
        taxNumber: string;
        taxOffice: string;
        kepAddress: string | null;
        phone: string;
        address: import("@prisma/client/runtime/library").JsonValue;
        bankInfo: import("@prisma/client/runtime/library").JsonValue | null;
        authorizedPerson: import("@prisma/client/runtime/library").JsonValue;
        tradeRegistry: string | null;
        activityArea: string | null;
        logo: string | null;
        approvedAt: Date | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        creditLimit: import("@prisma/client/runtime/library").Decimal;
        commission: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: number): Promise<{
        user: {
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: number;
            status: import("@prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
            phoneVerified: boolean;
            lastLogin: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        _count: {
            orders: number;
        };
        orders: {
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
        }[];
        documents: {
            id: number;
            status: import("@prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
            rejectionReason: string | null;
            entityType: string;
            entityId: number;
            documentType: import("@prisma/client").$Enums.DocumentType;
            fileUrl: string;
            fileName: string;
            fileSize: number;
            mimeType: string;
            verifiedBy: number | null;
            verifiedAt: Date | null;
            expiryDate: Date | null;
        }[];
    } & {
        id: number;
        status: import("@prisma/client").$Enums.CompanyStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: number;
        rejectionReason: string | null;
        taxNumber: string;
        taxOffice: string;
        kepAddress: string | null;
        phone: string;
        address: import("@prisma/client/runtime/library").JsonValue;
        bankInfo: import("@prisma/client/runtime/library").JsonValue | null;
        authorizedPerson: import("@prisma/client/runtime/library").JsonValue;
        tradeRegistry: string | null;
        activityArea: string | null;
        logo: string | null;
        approvedAt: Date | null;
        balance: import("@prisma/client/runtime/library").Decimal;
        creditLimit: import("@prisma/client/runtime/library").Decimal;
        commission: import("@prisma/client/runtime/library").Decimal;
    }>;
    approve(id: number): Promise<{
        message: string;
        company: {
            user: {
                email: string;
                password: string;
                role: import("@prisma/client").$Enums.UserRole;
                id: number;
                status: import("@prisma/client").$Enums.UserStatus;
                emailVerified: boolean;
                phoneVerified: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            status: import("@prisma/client").$Enums.CompanyStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: number;
            rejectionReason: string | null;
            taxNumber: string;
            taxOffice: string;
            kepAddress: string | null;
            phone: string;
            address: import("@prisma/client/runtime/library").JsonValue;
            bankInfo: import("@prisma/client/runtime/library").JsonValue | null;
            authorizedPerson: import("@prisma/client/runtime/library").JsonValue;
            tradeRegistry: string | null;
            activityArea: string | null;
            logo: string | null;
            approvedAt: Date | null;
            balance: import("@prisma/client/runtime/library").Decimal;
            creditLimit: import("@prisma/client/runtime/library").Decimal;
            commission: import("@prisma/client/runtime/library").Decimal;
        };
    }>;
    reject(id: number, dto: {
        rejectionReason: string;
    }): Promise<{
        message: string;
        company: {
            user: {
                email: string;
                password: string;
                role: import("@prisma/client").$Enums.UserRole;
                id: number;
                status: import("@prisma/client").$Enums.UserStatus;
                emailVerified: boolean;
                phoneVerified: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            status: import("@prisma/client").$Enums.CompanyStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: number;
            rejectionReason: string | null;
            taxNumber: string;
            taxOffice: string;
            kepAddress: string | null;
            phone: string;
            address: import("@prisma/client/runtime/library").JsonValue;
            bankInfo: import("@prisma/client/runtime/library").JsonValue | null;
            authorizedPerson: import("@prisma/client/runtime/library").JsonValue;
            tradeRegistry: string | null;
            activityArea: string | null;
            logo: string | null;
            approvedAt: Date | null;
            balance: import("@prisma/client/runtime/library").Decimal;
            creditLimit: import("@prisma/client/runtime/library").Decimal;
            commission: import("@prisma/client/runtime/library").Decimal;
        };
    }>;
    updateStatus(id: number, dto: UpdateCompanyStatusDto): Promise<{
        message: string;
        company: {
            user: {
                email: string;
                password: string;
                role: import("@prisma/client").$Enums.UserRole;
                id: number;
                status: import("@prisma/client").$Enums.UserStatus;
                emailVerified: boolean;
                phoneVerified: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            status: import("@prisma/client").$Enums.CompanyStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: number;
            rejectionReason: string | null;
            taxNumber: string;
            taxOffice: string;
            kepAddress: string | null;
            phone: string;
            address: import("@prisma/client/runtime/library").JsonValue;
            bankInfo: import("@prisma/client/runtime/library").JsonValue | null;
            authorizedPerson: import("@prisma/client/runtime/library").JsonValue;
            tradeRegistry: string | null;
            activityArea: string | null;
            logo: string | null;
            approvedAt: Date | null;
            balance: import("@prisma/client/runtime/library").Decimal;
            creditLimit: import("@prisma/client/runtime/library").Decimal;
            commission: import("@prisma/client/runtime/library").Decimal;
        };
    }>;
}
