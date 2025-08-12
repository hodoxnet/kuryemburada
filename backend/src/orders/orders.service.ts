import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PackageType, PackageSize, DeliveryType, Urgency, NotificationType, CourierStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  // Sipariş numarası oluştur
  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
  }

  // Noktanın bölge içinde olup olmadığını kontrol et
  private isPointInPolygon(point: { lat: number; lng: number }, polygon: any[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;
      
      const intersect = ((yi > point.lng) !== (yj > point.lng))
        && (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Hangi bölgede olduğunu bul
  private async findServiceArea(point: { lat: number; lng: number }): Promise<any> {
    const serviceAreas = await this.prisma.serviceArea.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    for (const area of serviceAreas) {
      const boundaries = area.boundaries as any[];
      if (this.isPointInPolygon(point, boundaries)) {
        return area;
      }
    }
    return null;
  }

  // Mesafe bazlı fiyat hesaplama (bölge bazlı)
  private async calculatePrice(
    distance: number, 
    packageSize: PackageSize, 
    deliveryType: DeliveryType, 
    urgency: Urgency,
    serviceArea?: any,
    googleMapsTime?: number
  ): Promise<{ price: number; estimatedTime: number; commission: number; courierEarning: number }> {
    // Bölge varsa onun fiyatlandırmasını kullan, yoksa genel kurala bak
    let basePrice: number;
    let pricePerKm: number;
    let minimumPrice: number = 10;

    if (serviceArea) {
      basePrice = serviceArea.basePrice;
      pricePerKm = serviceArea.pricePerKm;
      
      // Mesafe kontrolü
      if (serviceArea.maxDistance && distance > serviceArea.maxDistance) {
        throw new BadRequestException(
          `Bu bölge için maksimum teslimat mesafesi ${serviceArea.maxDistance} km'dir. Sipariş mesafeniz: ${distance.toFixed(1)} km`
        );
      }
    } else {
      // Aktif genel fiyatlandırma kuralını al
      const pricingRule = await this.prisma.pricingRule.findFirst({
        where: { 
          isActive: true,
          serviceAreaId: null // Genel kural (bölgeye özel değil)
        },
      });

      if (!pricingRule) {
        throw new BadRequestException('Bu bölge hizmet alanı dışındadır');
      }

      basePrice = pricingRule.basePrice;
      pricePerKm = pricingRule.pricePerKm;
      minimumPrice = pricingRule.minimumPrice;
    }

    // Temel fiyat hesaplama
    let price = basePrice + (distance * pricePerKm);

    // Paket boyutu katsayısı
    const sizeMultipliers = {
      SMALL: 1,
      MEDIUM: 1.2,
      LARGE: 1.5,
      EXTRA_LARGE: 2,
    };
    price *= sizeMultipliers[packageSize];

    // Teslimat tipi katsayısı
    if (deliveryType === 'EXPRESS') {
      price *= 1.5; // Express teslimat %50 daha pahalı
    }

    // Aciliyet katsayısı
    const urgencyMultipliers = {
      NORMAL: 1,
      URGENT: 1.3,
      VERY_URGENT: 1.6,
    };
    price *= urgencyMultipliers[urgency];

    // Minimum fiyat kontrolü
    price = Math.max(price, minimumPrice);

    // Tahmini teslimat süresi (dakika)
    let estimatedTime: number;
    
    if (googleMapsTime) {
      // Google Maps'ten gelen gerçek süreyi kullan
      estimatedTime = googleMapsTime;
      if (deliveryType === 'EXPRESS') {
        estimatedTime = Math.ceil(estimatedTime * 0.7); // Express %30 daha hızlı
      }
    } else {
      // Fallback: Mesafeye göre tahmin et
      estimatedTime = Math.ceil(distance * 3); // Ortalama 20km/h hız varsayımı
      if (deliveryType === 'EXPRESS') {
        estimatedTime = Math.ceil(estimatedTime * 0.7); // Express %30 daha hızlı
      }
    }

    // Komisyon hesaplama (sistem ayarlarından)
    const commissionSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'commission.rate' },
    });
    const commissionRate = commissionSetting ? Number(commissionSetting.value) : 0.15;
    const commission = price * commissionRate;
    const courierEarning = price - commission;

    return {
      price: Math.round(price * 100) / 100, // 2 ondalık basamağa yuvarla
      estimatedTime,
      commission: Math.round(commission * 100) / 100,
      courierEarning: Math.round(courierEarning * 100) / 100,
    };
  }

  // Firma tarafından sipariş oluşturma
  async createOrder(companyId: string, createOrderDto: CreateOrderDto) {
    // Firma kontrolü
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Firma bulunamadı');
    }

    if (company.status !== 'APPROVED') {
      throw new ForbiddenException('Firma onaylı değil');
    }

    // Alım ve teslimat noktalarının koordinatlarını al
    const pickupPoint = createOrderDto.pickupAddress as any;
    const deliveryPoint = createOrderDto.deliveryAddress as any;

    // Alım noktasının hangi bölgede olduğunu kontrol et
    const pickupArea = await this.findServiceArea(pickupPoint);
    if (!pickupArea) {
      throw new BadRequestException(
        `Alım noktası hizmet bölgesi dışındadır. Aktif bölgeler: Beylikdüzü, Avcılar, Esenyurt, Başakşehir, Bakırköy`
      );
    }

    // Teslimat noktasının hangi bölgede olduğunu kontrol et
    const deliveryArea = await this.findServiceArea(deliveryPoint);
    if (!deliveryArea) {
      throw new BadRequestException(
        `Teslimat noktası hizmet bölgesi dışındadır. Aktif bölgeler: Beylikdüzü, Avcılar, Esenyurt, Başakşehir, Bakırköy`
      );
    }

    // Mesafe ve süre (Frontend'den Google Maps tarafından hesaplanan gerçek değerler)
    const distance = createOrderDto.distance || 10; // Google Maps mesafesi yoksa varsayılan 10 km
    const googleMapsTime = createOrderDto.estimatedTime; // Google Maps süresi (dakika)

    // Teslimat bölgesinin fiyatlandırmasını kullan
    const priceDetails = await this.calculatePrice(
      distance,
      createOrderDto.packageSize,
      createOrderDto.deliveryType,
      createOrderDto.urgency || 'NORMAL',
      deliveryArea, // Teslimat bölgesinin fiyatlandırması
      googleMapsTime // Google Maps'ten gelen süreyi kullan
    );

    // Sipariş oluştur
    const order = await this.prisma.order.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        companyId,
        serviceAreaId: deliveryArea.id, // Teslimat bölgesi
        recipientName: createOrderDto.recipientName,
        recipientPhone: createOrderDto.recipientPhone,
        pickupAddress: createOrderDto.pickupAddress as any,
        deliveryAddress: createOrderDto.deliveryAddress as any,
        packageType: createOrderDto.packageType,
        packageSize: createOrderDto.packageSize,
        deliveryType: createOrderDto.deliveryType,
        urgency: createOrderDto.urgency || 'NORMAL',
        scheduledPickupTime: createOrderDto.scheduledPickupTime,
        notes: createOrderDto.notes,
        distance,
        estimatedTime: priceDetails.estimatedTime,
        price: priceDetails.price,
        commission: priceDetails.commission,
        courierEarning: priceDetails.courierEarning,
        status: OrderStatus.PENDING,
      },
      include: {
        company: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    // Müsait kuryelere bildirim gönder
    await this.notifyAvailableCouriers(order);

    this.logger.info('Sipariş oluşturuldu', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      companyId,
    });

    return order;
  }

  // Müsait kuryelere bildirim gönder
  private async notifyAvailableCouriers(order: any) {
    // Müsait kuryeleri bul
    const availableCouriers = await this.prisma.courier.findMany({
      where: {
        status: CourierStatus.APPROVED,
        isAvailable: true,
      },
      include: {
        user: true,
      },
    });

    // Her kurye için bildirim oluştur
    const notifications = availableCouriers.map(courier => ({
      userId: courier.userId,
      type: NotificationType.ORDER_CREATED,
      title: 'Yeni Sipariş',
      message: `${order.company.name} firmasından yeni bir sipariş var`,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        pickupAddress: order.pickupAddress,
        deliveryAddress: order.deliveryAddress,
        price: order.courierEarning,
        estimatedTime: order.estimatedTime,
      },
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({
        data: notifications,
      });
    }

    this.logger.info('Kuryelere bildirim gönderildi', {
      orderId: order.id,
      courierCount: notifications.length,
    });
  }

  // Firma siparişlerini listele
  async getCompanyOrders(
    companyId: string,
    params: {
      skip?: number;
      take?: number;
      status?: OrderStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const { skip = 0, take = 10, status, startDate, endDate } = params;

    const where: any = { companyId };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          courier: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              vehicleInfo: true,
              rating: true,
              userId: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentMethod: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      skip,
      take,
    };
  }

  // Kurye siparişlerini listele (havuz)
  async getAvailableOrders(
    courierId: string,
    params: {
      skip?: number;
      take?: number;
    },
  ) {
    const { skip = 0, take = 10 } = params;

    // Kurye kontrolü
    const courier = await this.prisma.courier.findUnique({
      where: { id: courierId },
    });

    if (!courier) {
      throw new NotFoundException('Kurye bulunamadı');
    }

    if (courier.status !== 'APPROVED') {
      throw new ForbiddenException('Kurye onaylı değil');
    }

    const where = {
      status: OrderStatus.PENDING,
      courierId: null, // Henüz atanmamış siparişler
    };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          company: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
        orderBy: [
          { urgency: 'desc' }, // Önce acil siparişler
          { createdAt: 'asc' }, // Sonra eskiden yeniye
        ],
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      skip,
      take,
    };
  }

  // Kurye siparişi kabul etme
  async acceptOrder(orderId: string, courierId: string) {
    // Sipariş kontrolü
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Sipariş zaten işlemde');
    }

    if (order.courierId) {
      throw new BadRequestException('Sipariş başka bir kurye tarafından alınmış');
    }

    // Kurye kontrolü
    const courier = await this.prisma.courier.findUnique({
      where: { id: courierId },
    });

    if (!courier || courier.status !== 'APPROVED') {
      throw new ForbiddenException('Kurye onaylı değil');
    }

    // Transaction ile güncelle
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // Siparişi güncelle
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          courierId,
          status: OrderStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
        include: {
          company: true,
          courier: true,
        },
      });

      // Kuryeyi meşgul yap
      await tx.courier.update({
        where: { id: courierId },
        data: { 
          isAvailable: false,
          status: CourierStatus.BUSY,
        },
      });

      // Firmaya bildirim gönder
      await tx.notification.create({
        data: {
          userId: updated.company.userId,
          type: NotificationType.ORDER_ACCEPTED,
          title: 'Sipariş Kabul Edildi',
          message: `${updated.orderNumber} numaralı siparişiniz ${courier.fullName} tarafından kabul edildi`,
          data: {
            orderId: updated.id,
            orderNumber: updated.orderNumber,
            courierName: courier.fullName,
            courierPhone: courier.phone,
          },
        },
      });

      return updated;
    });

    this.logger.info('Sipariş kabul edildi', {
      orderId,
      courierId,
      orderNumber: updatedOrder.orderNumber,
    });

    return updatedOrder;
  }

  // Sipariş durumu güncelleme
  async updateOrderStatus(
    orderId: string,
    courierId: string,
    status: OrderStatus,
    data?: {
      deliveryProof?: string;
      cancellationReason?: string;
    },
  ) {
    // Sipariş kontrolü
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { company: true },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    if (order.courierId !== courierId) {
      throw new ForbiddenException('Bu sipariş size ait değil');
    }

    const updateData: any = { status };

    // Duruma göre ek alanları güncelle
    switch (status) {
      case OrderStatus.IN_PROGRESS:
        updateData.pickedUpAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        updateData.deliveredAt = new Date();
        if (data?.deliveryProof) {
          updateData.deliveryProof = data.deliveryProof;
        }
        break;
      case OrderStatus.CANCELLED:
        updateData.cancelledAt = new Date();
        if (data?.cancellationReason) {
          updateData.cancellationReason = data.cancellationReason;
        }
        break;
    }

    // Transaction ile güncelle
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // Siparişi güncelle
      const updated = await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      // Teslimat tamamlandıysa veya iptal edildiyse kuryeyi müsait yap
      if (status === OrderStatus.DELIVERED || status === OrderStatus.CANCELLED) {
        await tx.courier.update({
          where: { id: courierId },
          data: { 
            isAvailable: true,
            status: CourierStatus.APPROVED,
          },
        });

        // Teslimat tamamlandıysa kurye istatistiklerini güncelle
        if (status === OrderStatus.DELIVERED) {
          await tx.courier.update({
            where: { id: courierId },
            data: {
              totalDeliveries: { increment: 1 },
            },
          });
        }
      }

      // Firmaya bildirim gönder
      const notificationType =
        status === OrderStatus.DELIVERED
          ? NotificationType.ORDER_DELIVERED
          : status === OrderStatus.CANCELLED
          ? NotificationType.ORDER_CANCELLED
          : null;

      if (notificationType) {
        await tx.notification.create({
          data: {
            userId: order.company.userId,
            type: notificationType,
            title: status === OrderStatus.DELIVERED ? 'Teslimat Tamamlandı' : 'Sipariş İptal Edildi',
            message: `${order.orderNumber} numaralı siparişiniz ${
              status === OrderStatus.DELIVERED ? 'teslim edildi' : 'iptal edildi'
            }`,
            data: {
              orderId: updated.id,
              orderNumber: updated.orderNumber,
              status,
            },
          },
        });
      }

      return updated;
    });

    this.logger.info('Sipariş durumu güncellendi', {
      orderId,
      orderNumber: updatedOrder.orderNumber,
      oldStatus: order.status,
      newStatus: status,
    });

    return updatedOrder;
  }

  // Sipariş detayı
  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        company: {
          select: {
            id: true,
            userId: true,
            name: true,
            phone: true,
            address: true,
          },
        },
        courier: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            phone: true,
            vehicleInfo: true,
            rating: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    return order;
  }

  // Sipariş iptal etme (firma tarafından)
  async cancelOrder(orderId: string, companyId: string, reason: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { courier: true },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    if (order.companyId !== companyId) {
      throw new ForbiddenException('Bu sipariş size ait değil');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Teslim edilmiş sipariş iptal edilemez');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Sipariş zaten iptal edilmiş');
    }

    // İptal süresi kontrolü (5 dakika)
    const maxCancellationTime = await this.prisma.systemSetting.findUnique({
      where: { key: 'order.maxCancellationTime' },
    });
    const maxMinutes = maxCancellationTime ? Number(maxCancellationTime.value) : 5;
    const minutesPassed = (Date.now() - order.createdAt.getTime()) / 60000;

    if (order.status !== OrderStatus.PENDING && minutesPassed > maxMinutes) {
      throw new BadRequestException(`Sipariş oluşturulduktan ${maxMinutes} dakika sonra iptal edilemez`);
    }

    // Transaction ile iptal et
    const cancelledOrder = await this.prisma.$transaction(async (tx) => {
      // Siparişi iptal et
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      // Kurye atanmışsa, kuryeyi müsait yap
      if (order.courierId) {
        await tx.courier.update({
          where: { id: order.courierId },
          data: { 
            isAvailable: true,
            status: CourierStatus.APPROVED,
          },
        });

        // Kuryeye bildirim gönder
        await tx.notification.create({
          data: {
            userId: order.courier!.userId,
            type: NotificationType.ORDER_CANCELLED,
            title: 'Sipariş İptal Edildi',
            message: `${order.orderNumber} numaralı sipariş firma tarafından iptal edildi`,
            data: {
              orderId: updated.id,
              orderNumber: updated.orderNumber,
              reason,
            },
          },
        });
      }

      return updated;
    });

    this.logger.info('Sipariş iptal edildi', {
      orderId,
      orderNumber: cancelledOrder.orderNumber,
      companyId,
      reason,
    });

    return cancelledOrder;
  }

  // Sipariş değerlendirme (firma tarafından)
  async rateOrder(
    orderId: string,
    companyId: string,
    rating: number,
    feedback?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { courier: true },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    if (order.companyId !== companyId) {
      throw new ForbiddenException('Bu sipariş size ait değil');
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Sadece teslim edilmiş siparişler değerlendirilebilir');
    }

    if (order.rating) {
      throw new BadRequestException('Sipariş zaten değerlendirilmiş');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Değerlendirme 1-5 arasında olmalıdır');
    }

    // Transaction ile güncelle
    const ratedOrder = await this.prisma.$transaction(async (tx) => {
      // Siparişi güncelle
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          rating,
          feedback,
        },
      });

      // Kurye rating'ini güncelle
      if (order.courierId) {
        const courierOrders = await tx.order.findMany({
          where: {
            courierId: order.courierId,
            rating: { not: null },
          },
          select: { rating: true },
        });

        const totalRating = courierOrders.reduce((sum, o) => sum + (o.rating || 0), 0) + rating;
        const avgRating = totalRating / (courierOrders.length + 1);

        await tx.courier.update({
          where: { id: order.courierId },
          data: {
            rating: Math.round(avgRating * 10) / 10, // 1 ondalık basamak
          },
        });
      }

      return updated;
    });

    this.logger.info('Sipariş değerlendirildi', {
      orderId,
      orderNumber: ratedOrder.orderNumber,
      rating,
    });

    return ratedOrder;
  }
}
