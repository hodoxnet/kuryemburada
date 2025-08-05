import { CouriersService } from './couriers.service';
import { UpdateCourierStatusDto } from './dto/update-courier-status.dto';
export declare class CouriersController {
    private readonly couriersService;
    constructor(couriersService: CouriersService);
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
        courier: any;
    }>;
    reject(id: number, dto: {
        rejectionReason: string;
    }): Promise<{
        message: string;
        courier: any;
    }>;
    updateStatus(id: number, dto: UpdateCourierStatusDto): Promise<{
        message: string;
        courier: any;
    }>;
}
