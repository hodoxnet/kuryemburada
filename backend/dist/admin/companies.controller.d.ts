import { CompaniesService } from './companies.service';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    findAll(status?: string, page?: number, limit?: number): Promise<{
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
    approve(id: number): Promise<{
        message: string;
        company: any;
    }>;
    reject(id: number, dto: {
        rejectionReason: string;
    }): Promise<{
        message: string;
        company: any;
    }>;
    updateStatus(id: number, dto: UpdateCompanyStatusDto): Promise<{
        message: string;
        company: any;
    }>;
}
