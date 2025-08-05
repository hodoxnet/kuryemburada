import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SystemSettingDto,
  UpdateSystemSettingDto,
  SystemSettingsDto,
} from './dto/system-settings.dto';

@Injectable()
export class SystemSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const settings = await this.prisma.systemSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // Group settings by category
    const grouped = settings.reduce(
      (acc, setting) => {
        const category = setting.category || 'general';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(setting);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return grouped;
  }

  async findOne(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }

    return setting;
  }

  async create(dto: SystemSettingDto) {
    // Check if setting already exists
    const existing = await this.prisma.systemSetting.findUnique({
      where: { key: dto.key },
    });

    if (existing) {
      throw new Error(`Setting with key '${dto.key}' already exists`);
    }

    return this.prisma.systemSetting.create({
      data: {
        key: dto.key,
        value: dto.value,
        description: dto.description,
        category: dto.category,
      },
    });
  }

  async update(key: string, dto: UpdateSystemSettingDto) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }

    return this.prisma.systemSetting.update({
      where: { key },
      data: {
        value: dto.value,
        ...(dto.description && { description: dto.description }),
      },
    });
  }

  async updateBulk(dto: SystemSettingsDto) {
    const updates = [];

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        // Try to update, if not exists create
        const existing = await this.prisma.systemSetting.findUnique({
          where: { key },
        });

        if (existing) {
          updates.push(
            this.prisma.systemSetting.update({
              where: { key },
              data: { value },
            }),
          );
        } else {
          updates.push(
            this.prisma.systemSetting.create({
              data: {
                key,
                value,
                category: this.getCategoryForKey(key),
              },
            }),
          );
        }
      }
    }

    await Promise.all(updates);

    return {
      message: 'Sistem ayarları güncellendi',
      updatedCount: updates.length,
    };
  }

  async initializeDefaults() {
    const defaultSettings = [
      {
        key: 'commissionRate',
        value: 15,
        description: 'Platform komisyon oranı (%)',
        category: 'payment',
      },
      {
        key: 'maxOrderDistance',
        value: 50,
        description: 'Maksimum sipariş mesafesi (km)',
        category: 'order',
      },
      {
        key: 'orderTimeout',
        value: 30,
        description: 'Sipariş timeout süresi (dakika)',
        category: 'order',
      },
      {
        key: 'courierAcceptanceTime',
        value: 5,
        description: 'Kurye kabul süresi (dakika)',
        category: 'order',
      },
      {
        key: 'autoAssignment',
        value: true,
        description: 'Otomatik kurye atama',
        category: 'order',
      },
      {
        key: 'smsNotifications',
        value: true,
        description: 'SMS bildirimleri',
        category: 'notification',
      },
      {
        key: 'emailNotifications',
        value: true,
        description: 'Email bildirimleri',
        category: 'notification',
      },
      {
        key: 'pushNotifications',
        value: true,
        description: 'Push bildirimleri',
        category: 'notification',
      },
      {
        key: 'maintenanceMode',
        value: false,
        description: 'Bakım modu',
        category: 'system',
      },
      {
        key: 'maintenanceMessage',
        value: 'Sistem bakımda. Lütfen daha sonra tekrar deneyin.',
        description: 'Bakım modu mesajı',
        category: 'system',
      },
      {
        key: 'minCourierRating',
        value: 3.5,
        description: 'Minimum kurye puanı',
        category: 'courier',
      },
      {
        key: 'maxActiveOrdersPerCourier',
        value: 3,
        description: 'Kurye başına maksimum aktif sipariş',
        category: 'courier',
      },
      {
        key: 'workingHoursStart',
        value: '08:00',
        description: 'Çalışma saatleri başlangıç',
        category: 'system',
      },
      {
        key: 'workingHoursEnd',
        value: '22:00',
        description: 'Çalışma saatleri bitiş',
        category: 'system',
      },
    ];

    const created = [];
    const skipped = [];

    for (const setting of defaultSettings) {
      const existing = await this.prisma.systemSetting.findUnique({
        where: { key: setting.key },
      });

      if (!existing) {
        await this.prisma.systemSetting.create({
          data: setting,
        });
        created.push(setting.key);
      } else {
        skipped.push(setting.key);
      }
    }

    return {
      message: 'Varsayılan ayarlar işlendi',
      created,
      skipped,
    };
  }

  private getCategoryForKey(key: string): string {
    const categoryMap: Record<string, string> = {
      commissionRate: 'payment',
      maxOrderDistance: 'order',
      orderTimeout: 'order',
      courierAcceptanceTime: 'order',
      autoAssignment: 'order',
      smsNotifications: 'notification',
      emailNotifications: 'notification',
      pushNotifications: 'notification',
      maintenanceMode: 'system',
      maintenanceMessage: 'system',
      minCourierRating: 'courier',
      maxActiveOrdersPerCourier: 'courier',
      workingHoursStart: 'system',
      workingHoursEnd: 'system',
    };

    return categoryMap[key] || 'general';
  }
}
