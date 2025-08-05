import { PrismaService } from '../prisma/prisma.service';
import { UpdateCourierStatusDto } from './dto/update-courier-status.dto';
export declare class CouriersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(params: {
        status?: string;
        page: number;
        limit: number;
    }): Promise<{
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
    reject(id: number, rejectionReason: string): Promise<{
        message: string;
        courier: any;
    }>;
    updateStatus(id: number, dto: UpdateCourierStatusDto): Promise<{
        message: string;
        courier: any;
    }>;
}
