import { UserRole } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    password: string;
    role: UserRole;
}
