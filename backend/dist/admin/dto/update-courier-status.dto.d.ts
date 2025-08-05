import { CourierStatus } from '@prisma/client';
export declare class UpdateCourierStatusDto {
    status: CourierStatus;
    rejectionReason?: string;
}
