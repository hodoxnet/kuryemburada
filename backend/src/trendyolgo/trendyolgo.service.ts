import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import {
  DeliveryType,
  PackageSize,
  PackageType,
  Urgency,
  OrderSource,
  UserRole,
} from '@prisma/client';
import {
  TrendyolGoHttpService,
  TrendyolGoPackage,
} from './trendyolgo-http.service';

@Injectable()
export class TrendyolGoService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private readonly httpService: TrendyolGoHttpService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Yeni siparişleri Trendyol Go'dan çeker ve işler
   */
  async fetchAndProcessOrders(vendorId: string): Promise<number> {
    const vendor = await this.prisma.trendyolGoVendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor || !vendor.isActive) {
      this.logger.warn('Trendyol Go vendor bulunamadı veya pasif', { vendorId });
      return 0;
    }

    try {
      // Yeni siparişleri çek (Created durumunda olanlar)
      const response = await this.httpService.getPackages(vendorId, {
        status: 'Created',
        sortDirection: 'DESC',
        size: 50,
      });

      let processedCount = 0;

      for (const pkg of response.content) {
        try {
          // Bu paket zaten işlenmiş mi kontrol et
          const existingOrder = await this.prisma.trendyolGoOrder.findUnique({
            where: { packageId: pkg.id },
          });

          if (existingOrder) {
            // Eğer orderId varsa başarıyla işlenmiş demektir, atla
            if (existingOrder.orderId) {
              continue;
            }

            // orderId null ise önceki denemede başarısız olmuş demektir
            // Eski kaydı sil ve tekrar dene
            this.logger.info('Başarısız Trendyol Go paketi tekrar deneniyor', {
              packageId: pkg.id,
              previousStatus: existingOrder.status,
              previousError: existingOrder.rejectionReason,
            });

            await this.prisma.trendyolGoOrder.delete({
              where: { id: existingOrder.id },
            });
          }

          // Yeni sipariş oluştur
          await this.createOrderFromPackage(vendor, pkg);
          processedCount++;
        } catch (error) {
          this.logger.error('Trendyol Go paketi işlenemedi', {
            vendorId,
            packageId: pkg.id,
            error: error instanceof Error ? error.message : 'Bilinmeyen hata',
          });
        }
      }

      // Son polling zamanını güncelle
      await this.prisma.trendyolGoVendor.update({
        where: { id: vendorId },
        data: { lastPolledAt: new Date() },
      });

      if (processedCount > 0) {
        this.logger.info('Trendyol Go siparişleri işlendi', {
          vendorId,
          processedCount,
          totalPackages: response.content.length,
        });
      }

      return processedCount;
    } catch (error) {
      this.logger.error('Trendyol Go siparişleri çekilemedi', {
        vendorId,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      });
      throw error;
    }
  }

  /**
   * Trendyol Go paketinden sipariş oluşturur
   */
  async createOrderFromPackage(
    vendor: {
      id: string;
      companyId: string;
      pickupAddress: any;
      autoCourierDispatch: boolean;
    },
    pkg: TrendyolGoPackage,
  ): Promise<{ orderId: string; trendyolGoOrderId: string }> {
    if (!vendor.pickupAddress) {
      throw new BadRequestException('Pickup adresi tanımlı değil');
    }

    const sanitizedPayload = this.toSerializableJson(pkg);
    const deliveryAddress = this.buildDeliveryAddress(pkg);
    const pickupAddress = vendor.pickupAddress as any;

    const distance = this.computeDistance(pickupAddress, deliveryAddress);
    const estimatedTime = this.estimateDeliveryMinutes(pkg.orderDate);

    const createOrderDto = {
      recipientName: this.buildCustomerName(pkg),
      recipientPhone: '', // Trendyol Go müşteri telefonu göstermiyor
      pickupAddress,
      deliveryAddress,
      packageType: PackageType.FOOD,
      packageSize: PackageSize.MEDIUM,
      deliveryType: DeliveryType.STANDARD,
      urgency: Urgency.NORMAL,
      notes: this.buildOrderNotes(pkg),
      distance,
      estimatedTime,
      source: OrderSource.TRENDYOLGO,
      isDispatchedToCouriers: vendor.autoCourierDispatch,
    };

    // Önce TrendyolGoOrder kaydı oluştur
    const createdIntegrationOrder = await this.prisma.trendyolGoOrder.create({
      data: {
        vendorId: vendor.id,
        packageId: pkg.id,
        trendyolOrderId: pkg.orderId,
        orderNumber: pkg.orderNumber,
        status: 'Created',
        payload: sanitizedPayload,
      },
    });

    try {
      // Order oluştur
      const order = await this.ordersService.createOrder(
        vendor.companyId,
        createOrderDto as any,
      );

      // TrendyolGoOrder'ı güncelle
      await this.prisma.trendyolGoOrder.update({
        where: { id: createdIntegrationOrder.id },
        data: {
          orderId: order.id,
        },
      });

      this.logger.info('Trendyol Go siparişi oluşturuldu', {
        vendorId: vendor.id,
        packageId: pkg.id,
        orderNumber: pkg.orderNumber,
        orderId: order.id,
      });

      return {
        orderId: order.id,
        trendyolGoOrderId: createdIntegrationOrder.id,
      };
    } catch (error: any) {
      // Hata durumunda TrendyolGoOrder'ı güncelle
      await this.prisma.trendyolGoOrder.update({
        where: { id: createdIntegrationOrder.id },
        data: {
          status: 'Failed',
          rejectionReason: error?.message,
        },
      });

      this.logger.error('Trendyol Go siparişi oluşturulamadı', {
        vendorId: vendor.id,
        packageId: pkg.id,
        error: error?.message,
      });

      throw new BadRequestException(
        error?.message || 'Sipariş oluşturma hatası',
      );
    }
  }

  /**
   * Sipariş kabul (Picking) bildirimi gönderir
   */
  async sendPickedStatus(orderId: string): Promise<void> {
    const trendyolOrder = await this.prisma.trendyolGoOrder.findUnique({
      where: { orderId },
      include: { vendor: true },
    });

    if (!trendyolOrder) {
      this.logger.warn('Trendyol Go order kaydı bulunamadı', { orderId });
      return;
    }

    try {
      await this.httpService.sendPickedStatus(
        trendyolOrder.vendorId,
        trendyolOrder.packageId,
      );

      await this.prisma.trendyolGoOrder.update({
        where: { id: trendyolOrder.id },
        data: {
          status: 'Picking',
          pickedAt: new Date(),
        },
      });

      this.logger.info('Trendyol Go Picking bildirimi gönderildi', {
        orderId,
        packageId: trendyolOrder.packageId,
      });
    } catch (error) {
      this.logger.error('Trendyol Go Picking bildirimi gönderilemedi', {
        orderId,
        packageId: trendyolOrder.packageId,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      });
      throw error;
    }
  }

  /**
   * Sipariş hazırlandı (Invoiced) bildirimi gönderir
   */
  async sendInvoicedStatus(
    orderId: string,
    invoiceData: {
      invoiceAmount: number;
      bagCount?: number;
      receiptLink?: string;
      invoiceTaxAmount?: number;
    },
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    // Sahiplik kontrolü
    const { trendyolOrder } = await this.validateOrderOwnership(
      orderId,
      userId,
      userRole,
    );

    try {
      await this.httpService.sendInvoicedStatus(
        trendyolOrder.vendorId,
        trendyolOrder.packageId,
        invoiceData,
      );

      await this.prisma.trendyolGoOrder.update({
        where: { id: trendyolOrder.id },
        data: {
          status: 'Invoiced',
          invoicedAt: new Date(),
          invoiceAmount: invoiceData.invoiceAmount,
          invoiceTaxAmount: invoiceData.invoiceTaxAmount,
          bagCount: invoiceData.bagCount,
          receiptLink: invoiceData.receiptLink,
        },
      });

      this.logger.info('Trendyol Go Invoiced bildirimi gönderildi', {
        orderId,
        packageId: trendyolOrder.packageId,
        invoiceData,
      });
    } catch (error) {
      this.logger.error('Trendyol Go Invoiced bildirimi gönderilemedi', {
        orderId,
        packageId: trendyolOrder.packageId,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      });
      throw error;
    }
  }

  /**
   * Siparişin kullanıcıya ait olup olmadığını doğrular
   * SUPER_ADMIN her siparişe erişebilir
   */
  async validateOrderOwnership(
    orderId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<{ trendyolOrder: any; companyId: string }> {
    // Önce siparişi bul
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        trendyolGoOrder: true,
        company: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    if (!order.trendyolGoOrder) {
      throw new NotFoundException('Bu sipariş bir Trendyol Go siparişi değil');
    }

    // SUPER_ADMIN her siparişe erişebilir
    if (userRole === UserRole.SUPER_ADMIN) {
      return {
        trendyolOrder: order.trendyolGoOrder,
        companyId: order.companyId,
      };
    }

    // COMPANY kullanıcısı için firma kontrolü yap
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      throw new ForbiddenException('Firma bulunamadı');
    }

    if (order.companyId !== company.id) {
      throw new ForbiddenException('Bu siparişe erişim yetkiniz yok');
    }

    return {
      trendyolOrder: order.trendyolGoOrder,
      companyId: company.id,
    };
  }

  /**
   * Vendor'ın kullanıcıya ait olup olmadığını doğrular
   */
  async validateVendorOwnership(
    vendorId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const vendor = await this.prisma.trendyolGoVendor.findUnique({
      where: { id: vendorId },
      include: { company: true },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor bulunamadı');
    }

    // SUPER_ADMIN her vendor'a erişebilir
    if (userRole === UserRole.SUPER_ADMIN) {
      return;
    }

    // COMPANY kullanıcısı için firma kontrolü yap
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      throw new ForbiddenException('Firma bulunamadı');
    }

    if (vendor.companyId !== company.id) {
      throw new ForbiddenException('Bu entegrasyona erişim yetkiniz yok');
    }
  }

  /**
   * Invoice amount aralığını kontrol eder
   */
  async getInvoiceAmountRange(
    orderId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<{ min: number; max: number }> {
    // Sahiplik kontrolü
    const { trendyolOrder } = await this.validateOrderOwnership(
      orderId,
      userId,
      userRole,
    );

    return this.httpService.getInvoiceAmountRange(
      trendyolOrder.vendorId,
      trendyolOrder.trendyolOrderId,
    );
  }

  /**
   * Trendyol Go'dan sipariş durumlarını senkronize eder
   */
  async syncOrderStatuses(vendorId: string): Promise<void> {
    // Aktif durumları senkronize et (Created dahil - UI'da "Hazırlandı Bildir" butonu için gerekli)
    // Cancelled, Returned, Delivered gibi final durumlar hariç tutuldu
    const orders = await this.prisma.trendyolGoOrder.findMany({
      where: {
        vendorId,
        status: {
          in: ['Created', 'Picking', 'Invoiced', 'Shipped'],
        },
      },
    });

    for (const order of orders) {
      try {
        const response = await this.httpService.getPackageById(
          vendorId,
          order.packageId,
        );

        if (response.content.length > 0) {
          const pkg = response.content[0];

          if (pkg.packageStatus !== order.status) {
            await this.prisma.trendyolGoOrder.update({
              where: { id: order.id },
              data: {
                status: pkg.packageStatus,
                payload: this.toSerializableJson(pkg),
              },
            });

            // Order durumunu da güncelle
            if (order.orderId) {
              await this.updateOrderStatus(order.orderId, pkg.packageStatus);
            }

            this.logger.info('Trendyol Go sipariş durumu güncellendi', {
              packageId: order.packageId,
              oldStatus: order.status,
              newStatus: pkg.packageStatus,
            });
          }
        }
      } catch (error) {
        this.logger.error('Trendyol Go sipariş durumu güncellenemedi', {
          packageId: order.packageId,
          error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        });
      }
    }
  }

  /**
   * Trendyol Go durumuna göre Order durumunu günceller
   */
  private async updateOrderStatus(
    orderId: string,
    trendyolStatus: string,
  ): Promise<void> {
    const statusMap: Record<string, string> = {
      Created: 'PENDING',
      Picking: 'ACCEPTED',
      Invoiced: 'ACCEPTED',
      Shipped: 'IN_PROGRESS',
      Delivered: 'DELIVERED',
      Cancelled: 'CANCELLED',
      Returned: 'CANCELLED',
    };

    const orderStatus = statusMap[trendyolStatus];
    if (!orderStatus) return;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return;

    // Sadece ileri yönlü durum güncellemelerini yap
    const statusOrder = [
      'PENDING',
      'ACCEPTED',
      'IN_PROGRESS',
      'DELIVERED',
      'CANCELLED',
    ];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(orderStatus);

    if (newIndex > currentIndex || orderStatus === 'CANCELLED') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: orderStatus as any,
          ...(orderStatus === 'DELIVERED' && { deliveredAt: new Date() }),
          ...(orderStatus === 'CANCELLED' && { cancelledAt: new Date() }),
        },
      });
    }
  }

  /**
   * Manuel senkronizasyon tetikler
   */
  async manualSync(vendorId: string): Promise<{ processedCount: number }> {
    const processedCount = await this.fetchAndProcessOrders(vendorId);
    await this.syncOrderStatuses(vendorId);
    return { processedCount };
  }

  // Yardımcı metodlar

  private toSerializableJson(payload: any) {
    return JSON.parse(JSON.stringify(payload || {}));
  }

  private buildCustomerName(pkg: TrendyolGoPackage): string {
    const firstName = pkg.customer?.firstName || 'Müşteri';
    const lastName = pkg.customer?.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }

  private buildDeliveryAddress(pkg: TrendyolGoPackage) {
    const addr = pkg.shipmentAddress;
    if (!addr) {
      throw new BadRequestException('Teslimat adresi eksik');
    }

    const lat = addr.latitude;
    const lng = addr.longitude;

    if (lat === undefined || lng === undefined) {
      throw new BadRequestException('Adres koordinatları eksik');
    }

    // Tam adres oluştur
    const addressParts = [
      addr.address1,
      addr.address2,
      addr.district,
      addr.city,
    ].filter(Boolean);

    const addressText = addressParts.join(', ') || 'Trendyol Go teslimat adresi';

    // Detay bilgisi oluştur
    const detailParts: string[] = [];
    if (addr.apartmentNumber) detailParts.push(`Daire: ${addr.apartmentNumber}`);
    if (addr.floor) detailParts.push(`Kat: ${addr.floor}`);
    if (addr.doorNumber) detailParts.push(`Kapı: ${addr.doorNumber}`);
    if (addr.addressDescription) detailParts.push(addr.addressDescription);

    return {
      lat: Number(lat),
      lng: Number(lng),
      address: addressText,
      detail: detailParts.join(', ') || undefined,
    };
  }

  private buildOrderNotes(pkg: TrendyolGoPackage): string {
    const notes: string[] = [];
    notes.push(`Trendyol Go Sipariş No: ${pkg.orderNumber}`);
    notes.push(`Toplam: ${pkg.totalPrice} TL`);

    if (pkg.lines && pkg.lines.length > 0) {
      notes.push('Ürünler:');
      pkg.lines.forEach((line) => {
        notes.push(`- ${line.productName} x${line.quantity}`);
      });
    }

    return notes.join('\n');
  }

  private computeDistance(
    pickup: { lat: number; lng: number },
    delivery: { lat: number; lng: number },
  ): number {
    const earthRadiusKm = 6371;
    const dLat = this.deg2rad(delivery.lat - pickup.lat);
    const dLon = this.deg2rad(delivery.lng - pickup.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(pickup.lat)) *
        Math.cos(this.deg2rad(delivery.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;

    return Math.max(Number(distance.toFixed(2)), 0.1);
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private estimateDeliveryMinutes(orderDateMs?: number): number | undefined {
    if (!orderDateMs) return undefined;

    // Varsayılan olarak 45 dakika tahmin et
    return 45;
  }
}
