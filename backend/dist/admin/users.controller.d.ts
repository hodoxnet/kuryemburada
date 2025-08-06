import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from './dto/user-management.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(filter: UserFilterDto, page?: number, limit?: number): Promise<{
        data: {
            company: {
                id: number;
                name: string;
                taxNumber: string;
            } | null;
            courier: {
                id: number;
                tcNumber: string;
                fullName: string;
            } | null;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: number;
            status: import("@prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
            phoneVerified: boolean;
            lastLogin: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        company: {
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
        } | null;
        courier: {
            id: number;
            status: import("@prisma/client").$Enums.CourierStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            rejectionReason: string | null;
            phone: string;
            address: import("@prisma/client/runtime/library").JsonValue;
            bankInfo: import("@prisma/client/runtime/library").JsonValue;
            approvedAt: Date | null;
            balance: import("@prisma/client/runtime/library").Decimal;
            tcNumber: string;
            fullName: string;
            birthDate: Date;
            licenseInfo: import("@prisma/client/runtime/library").JsonValue;
            vehicleInfo: import("@prisma/client/runtime/library").JsonValue;
            insuranceInfo: import("@prisma/client/runtime/library").JsonValue;
            emergencyContact: import("@prisma/client/runtime/library").JsonValue;
            rating: import("@prisma/client/runtime/library").Decimal;
            totalDeliveries: number;
            isAvailable: boolean;
            isOnline: boolean;
            lastLocation: import("@prisma/client/runtime/library").JsonValue | null;
            workingHours: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        id: number;
        status: import("@prisma/client").$Enums.UserStatus;
        emailVerified: boolean;
        phoneVerified: boolean;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
        refreshTokens: {
            id: number;
            createdAt: Date;
            token: string;
            expiresAt: Date;
        }[];
    }>;
    create(dto: CreateUserDto): Promise<{
        message: string;
        user: {
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: number;
            status: import("@prisma/client").$Enums.UserStatus;
            createdAt: Date;
        };
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        message: string;
        user: {
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: number;
            status: import("@prisma/client").$Enums.UserStatus;
            updatedAt: Date;
        };
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    resetPassword(id: number, dto: {
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    getStatistics(): Promise<{
        totalUsers: number;
        recentUsers: number;
        byRole: Record<string, number>;
        byStatus: Record<string, number>;
        companies: {
            total: number;
            pending: number;
        };
        couriers: {
            total: number;
            pending: number;
        };
    }>;
}
