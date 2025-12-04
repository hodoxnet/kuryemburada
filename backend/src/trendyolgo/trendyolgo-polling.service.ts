import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import { TrendyolGoService } from './trendyolgo.service';

@Injectable()
export class TrendyolGoPollingService implements OnModuleInit {
  private isPolling = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly trendyolGoService: TrendyolGoService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  onModuleInit() {
    this.logger.info('TrendyolGo Polling Service başlatıldı');
  }

  /**
   * Her 60 saniyede aktif vendor'ları kontrol eder ve yeni siparişleri çeker
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async pollActiveVendors(): Promise<void> {
    // Eş zamanlı polling'i önle
    if (this.isPolling) {
      this.logger.warn('TrendyolGo polling zaten devam ediyor, atlanıyor');
      return;
    }

    this.isPolling = true;

    try {
      const activeVendors = await this.prisma.trendyolGoVendor.findMany({
        where: { isActive: true },
        select: {
          id: true,
          supplierId: true,
          companyId: true,
          lastPolledAt: true,
          pollingIntervalSec: true,
        },
      });

      if (activeVendors.length === 0) {
        return;
      }

      this.logger.debug('TrendyolGo polling başladı', {
        vendorCount: activeVendors.length,
      });

      let totalProcessed = 0;

      for (const vendor of activeVendors) {
        try {
          // Polling aralığını kontrol et
          if (vendor.lastPolledAt) {
            const elapsedSeconds =
              (Date.now() - vendor.lastPolledAt.getTime()) / 1000;
            if (elapsedSeconds < vendor.pollingIntervalSec) {
              continue; // Henüz polling zamanı gelmemiş
            }
          }

          const processedCount =
            await this.trendyolGoService.fetchAndProcessOrders(vendor.id);
          totalProcessed += processedCount;

          // Durum senkronizasyonu da yap (her 5. polling'de)
          const shouldSyncStatuses =
            !vendor.lastPolledAt ||
            Math.floor(Date.now() / 1000 / 300) !==
              Math.floor(vendor.lastPolledAt.getTime() / 1000 / 300);

          if (shouldSyncStatuses) {
            await this.trendyolGoService.syncOrderStatuses(vendor.id);
          }
        } catch (error) {
          this.logger.error('TrendyolGo vendor polling hatası', {
            vendorId: vendor.id,
            supplierId: vendor.supplierId,
            error: error instanceof Error ? error.message : 'Bilinmeyen hata',
          });
        }
      }

      if (totalProcessed > 0) {
        this.logger.info('TrendyolGo polling tamamlandı', {
          vendorCount: activeVendors.length,
          totalProcessed,
        });
      }
    } catch (error) {
      this.logger.error('TrendyolGo polling genel hatası', {
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      });
    } finally {
      this.isPolling = false;
    }
  }

  /**
   * Belirli bir vendor için manuel polling tetikler
   */
  async triggerPollForVendor(vendorId: string): Promise<{
    processedCount: number;
    message: string;
  }> {
    try {
      const vendor = await this.prisma.trendyolGoVendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendor) {
        return {
          processedCount: 0,
          message: 'Vendor bulunamadı',
        };
      }

      if (!vendor.isActive) {
        return {
          processedCount: 0,
          message: 'Vendor pasif durumda',
        };
      }

      const processedCount =
        await this.trendyolGoService.fetchAndProcessOrders(vendorId);

      // Durum senkronizasyonu da yap
      await this.trendyolGoService.syncOrderStatuses(vendorId);

      return {
        processedCount,
        message: `${processedCount} yeni sipariş işlendi`,
      };
    } catch (error) {
      this.logger.error('Manuel polling hatası', {
        vendorId,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      });

      return {
        processedCount: 0,
        message: error instanceof Error ? error.message : 'Polling hatası',
      };
    }
  }
}
