import { UserRole, UserStatus } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    role: UserRole;
    status?: UserStatus;
}
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    role?: UserRole;
    status?: UserStatus;
}
export declare class UserFilterDto {
    role?: UserRole;
    status?: UserStatus;
    email?: string;
}
