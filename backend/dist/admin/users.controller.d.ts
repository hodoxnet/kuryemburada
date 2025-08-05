import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from './dto/user-management.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(filter: UserFilterDto, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<any>;
    create(dto: CreateUserDto): Promise<{
        message: string;
        user: any;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        message: string;
        user: any;
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
        totalUsers: any;
        recentUsers: any;
        byRole: any;
        byStatus: any;
        companies: {
            total: any;
            pending: any;
        };
        couriers: {
            total: any;
            pending: any;
        };
    }>;
}
