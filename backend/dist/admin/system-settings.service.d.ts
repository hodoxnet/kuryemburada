import { PrismaService } from '../prisma/prisma.service';
import { SystemSettingDto, UpdateSystemSettingDto, SystemSettingsDto } from './dto/system-settings.dto';
export declare class SystemSettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    findOne(key: string): Promise<any>;
    create(dto: SystemSettingDto): Promise<any>;
    update(key: string, dto: UpdateSystemSettingDto): Promise<any>;
    updateBulk(dto: SystemSettingsDto): Promise<{
        message: string;
        updatedCount: number;
    }>;
    initializeDefaults(): Promise<{
        message: string;
        created: never[];
        skipped: never[];
    }>;
    private getCategoryForKey;
}
