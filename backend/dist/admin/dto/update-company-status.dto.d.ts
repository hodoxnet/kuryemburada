import { CompanyStatus } from '@prisma/client';
export declare class UpdateCompanyStatusDto {
    status: CompanyStatus;
    rejectionReason?: string;
}
