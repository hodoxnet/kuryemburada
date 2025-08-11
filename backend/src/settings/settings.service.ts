import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Prisma } from '@prisma/client';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async create(createSettingDto: CreateSettingDto) {
    const existingSetting = await this.prisma.systemSetting.findUnique({
      where: { key: createSettingDto.key },
    });

    if (existingSetting) {
      throw new ConflictException(`Bu anahtar zaten mevcut: ${createSettingDto.key}`);
    }

    const setting = await this.prisma.systemSetting.create({
      data: createSettingDto,
    });

    this.logger.info('Yeni sistem ayarı oluşturuldu', {
      key: setting.key,
    });

    return setting;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.SystemSettingWhereInput;
    orderBy?: Prisma.SystemSettingOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 20, where, orderBy } = params || {};

    const [settings, total] = await Promise.all([
      this.prisma.systemSetting.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { key: 'asc' },
      }),
      this.prisma.systemSetting.count({ where }),
    ]);

    return {
      data: settings,
      total,
      skip,
      take,
    };
  }

  async findOne(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Ayar bulunamadı: ${key}`);
    }

    return setting;
  }

  async update(key: string, updateSettingDto: UpdateSettingDto) {
    await this.findOne(key);

    const updatedSetting = await this.prisma.systemSetting.update({
      where: { key },
      data: {
        value: updateSettingDto.value,
        description: updateSettingDto.description,
      },
    });

    this.logger.info('Sistem ayarı güncellendi', {
      key,
      oldValue: updateSettingDto.value,
    });

    return updatedSetting;
  }

  async remove(key: string) {
    await this.findOne(key);

    const deletedSetting = await this.prisma.systemSetting.delete({
      where: { key },
    });

    this.logger.info('Sistem ayarı silindi', {
      key,
    });

    return deletedSetting;
  }

  async getDefaultSettings() {
    return {
      commission: {
        rate: 0.15,
        minAmount: 5,
        maxAmount: 100,
      },
      order: {
        maxCancellationTime: 5,
        autoAssignRadius: 5,
        maxDeliveryTime: 120,
      },
      courier: {
        maxActiveOrders: 3,
        minRating: 3.5,
        inactivityPeriod: 30,
      },
      company: {
        creditLimit: 10000,
        paymentDueDays: 30,
        minOrderAmount: 20,
      },
      notification: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
      },
      system: {
        maintenanceMode: false,
        apiRateLimit: 100,
        sessionTimeout: 3600,
      },
    };
  }

  async initializeDefaults() {
    const defaults = await this.getDefaultSettings();
    const results: any[] = [];

    for (const [category, settings] of Object.entries(defaults)) {
      for (const [key, value] of Object.entries(settings)) {
        const fullKey = `${category}.${key}`;
        
        const existing = await this.prisma.systemSetting.findUnique({
          where: { key: fullKey },
        });

        if (!existing) {
          const created = await this.prisma.systemSetting.create({
            data: {
              key: fullKey,
              value: value as any,
              description: `${category} kategorisi için ${key} ayarı`,
            },
          });
          results.push(created);
        }
      }
    }

    this.logger.info('Varsayılan sistem ayarları oluşturuldu', {
      count: results.length,
    });

    return results;
  }

  async getByCategory(category: string) {
    const settings = await this.prisma.systemSetting.findMany({
      where: {
        key: {
          startsWith: `${category}.`,
        },
      },
      orderBy: { key: 'asc' },
    });

    const result: Record<string, any> = {};
    
    for (const setting of settings) {
      const key = setting.key.replace(`${category}.`, '');
      result[key] = setting.value;
    }

    return result;
  }

  async updateByCategory(category: string, values: Record<string, any>) {
    const updates: any[] = [];

    for (const [key, value] of Object.entries(values)) {
      const fullKey = `${category}.${key}`;
      
      const updated = await this.prisma.systemSetting.upsert({
        where: { key: fullKey },
        update: { value },
        create: {
          key: fullKey,
          value,
          description: `${category} kategorisi için ${key} ayarı`,
        },
      });
      
      updates.push(updated);
    }

    this.logger.info('Kategori ayarları güncellendi', {
      category,
      count: updates.length,
    });

    return updates;
  }
}