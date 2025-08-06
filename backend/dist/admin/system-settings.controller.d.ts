import { SystemSettingsService } from './system-settings.service';
import { SystemSettingDto, UpdateSystemSettingDto, SystemSettingsDto } from './dto/system-settings.dto';
export declare class SystemSettingsController {
    private readonly systemSettingsService;
    constructor(systemSettingsService: SystemSettingsService);
    findAll(): Promise<Record<string, any[]>>;
    findOne(key: string): Promise<{
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
        category: string | null;
    }>;
    create(dto: SystemSettingDto): Promise<{
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
        category: string | null;
    }>;
    update(key: string, dto: UpdateSystemSettingDto): Promise<{
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
        category: string | null;
    }>;
    updateBulk(dto: SystemSettingsDto): Promise<{
        message: string;
        updatedCount: number;
    }>;
    initializeDefaults(): Promise<{
        message: string;
        created: string[];
        skipped: string[];
    }>;
}
