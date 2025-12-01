import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { YemeksepetiDispatchOrder } from './dto/dispatch-order.dto';
import { DeliveryType, PackageSize, PackageType, Urgency, OrderSource } from '@prisma/client';
import { YemeksepetiHttpService } from './yemeksepeti-http.service';

@Injectable()
export class YemeksepetiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly httpService: YemeksepetiHttpService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async handleDispatch(remoteId: string, payload: YemeksepetiDispatchOrder) {
    if (!payload?.token || !payload?.code) {
      throw new BadRequestException('Eksik sipariş kimliği (token/code)');
    }

    const vendor = await this.prisma.yemeksepetiVendor.findUnique({
      where: { remoteId },
    });

    if (!vendor || !vendor.isActive) {
      throw new BadRequestException('remoteId tanımlı değil veya pasif');
    }

    if (!vendor.pickupAddress) {
      throw new BadRequestException('Pickup adresi tanımlı değil');
    }

    const sanitizedPayload = this.toSerializableJson(payload);
    const remoteOrderId = this.buildRemoteOrderId(remoteId);
    const deliveryAddress = this.buildDeliveryAddress(payload);
    const pickupAddress = vendor.pickupAddress as any;

    const distance = this.computeDistance(pickupAddress, deliveryAddress);
    const estimatedTime = this.estimateDeliveryMinutes(payload.delivery?.expectedDeliveryTime, payload.createdAt);

    const createOrderDto = {
      recipientName: this.buildCustomerName(payload),
      recipientPhone: this.buildCustomerPhone(payload),
      pickupAddress,
      deliveryAddress,
      packageType: PackageType.FOOD,
      packageSize: PackageSize.MEDIUM,
      deliveryType: DeliveryType.STANDARD,
      urgency: Urgency.NORMAL,
      notes: payload.comments?.customerComment,
      scheduledPickupTime: payload.delivery?.riderPickupTime || undefined,
      distance,
      estimatedTime,
      source: OrderSource.YEMEKSEPETI,
    };

    const createdIntegrationOrder = await this.prisma.yemeksepetiOrder.create({
      data: {
        vendorId: vendor.id,
        token: payload.token,
        code: payload.code,
        remoteOrderId,
        status: 'dispatched',
        payload: sanitizedPayload,
        callbackUrls: payload.callbackUrls || undefined,
      },
    });

    try {
      const order = await this.ordersService.createOrder(vendor.companyId, createOrderDto as any);

      await this.prisma.yemeksepetiOrder.update({
        where: { id: createdIntegrationOrder.id },
        data: {
          orderId: order.id,
          status: 'order_created',
        },
      });

      this.logger.info('Yemeksepeti siparişi oluşturuldu', {
        remoteId,
        remoteOrderId,
        orderId: order.id,
      });

      return { remoteOrderId };
    } catch (error: any) {
      await this.prisma.yemeksepetiOrder.update({
        where: { id: createdIntegrationOrder.id },
        data: {
          status: 'failed',
          rejectionReason: error?.message,
        },
      });

      this.logger.error('Yemeksepeti siparişi oluşturulamadı', {
        remoteId,
        remoteOrderId,
        error: error?.message,
      });

      throw new BadRequestException(error?.message || 'Sipariş oluşturma hatası');
    }
  }

  async handleStatusUpdate(
    remoteId: string,
    remoteOrderId: string,
    status: string,
    message?: string,
    updatedOrder?: any,
  ) {
    const vendor = await this.prisma.yemeksepetiVendor.findUnique({
      where: { remoteId },
    });

    if (!vendor) {
      throw new NotFoundException('remoteId bulunamadı');
    }

    const yemOrder = await this.prisma.yemeksepetiOrder.findFirst({
      where: {
        remoteOrderId,
        vendorId: vendor.id,
      },
    });

    if (!yemOrder) {
      throw new NotFoundException('remoteOrderId bulunamadı');
    }

    await this.prisma.yemeksepetiOrder.update({
      where: { id: yemOrder.id },
      data: {
        status,
        rejectionReason: message,
        payload: updatedOrder ? this.toSerializableJson(updatedOrder) : yemOrder.payload,
      },
    });

    if (status === 'ORDER_CANCELLED' && yemOrder.orderId) {
      await this.ordersService.cancelOrderFromIntegration(
        yemOrder.orderId,
        message || 'Yemeksepeti iptal bildirimi',
      );
    }

    this.logger.info('Yemeksepeti sipariş statüsü güncellendi', {
      remoteId,
      remoteOrderId,
      status,
    });

    return { ok: true };
  }

  async sendStatusCallback(vendorId: string, url: string | undefined, payload: any) {
    if (!url) {
      this.logger.warn('Yemeksepeti callback URL tanımsız, çağrı atlandı', { vendorId, payload });
      return;
    }

    await this.httpService.postWithAuth(vendorId, url, payload);
  }

  async sendOrderStatus(
    orderId: string,
    status: 'order_accepted' | 'order_rejected' | 'order_picked_up',
    extra?: { acceptanceTime?: string; rejectReason?: string },
  ) {
    const yemOrder = await this.prisma.yemeksepetiOrder.findUnique({
      where: { orderId },
    });

    if (!yemOrder) {
      this.logger.warn('Yemeksepeti order kaydı bulunamadı, status gönderilemedi', { orderId, status });
      return;
    }

    const callbackUrls = (yemOrder.callbackUrls as any) || {};
    let targetUrl: string | undefined;

    if (status === 'order_accepted') {
      targetUrl = callbackUrls.orderAcceptedUrl;
    } else if (status === 'order_rejected') {
      targetUrl = callbackUrls.orderRejectedUrl;
    } else if (status === 'order_picked_up') {
      targetUrl = callbackUrls.orderPickedUpUrl;
    }

    const payload: any = {
      status,
      remoteOrderId: yemOrder.remoteOrderId,
      acceptanceTime: extra?.acceptanceTime,
      rejectReason: extra?.rejectReason,
    };

    await this.sendStatusCallback(yemOrder.vendorId, targetUrl, payload);
  }

  private buildRemoteOrderId(remoteId: string) {
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `${remoteId}-${random}`;
  }

  private toSerializableJson(payload: any) {
    return JSON.parse(JSON.stringify(payload || {}));
  }

  private buildCustomerName(payload: YemeksepetiDispatchOrder) {
    const firstName = payload.customer?.firstName || 'Müşteri';
    const lastName = payload.customer?.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }

  private buildCustomerPhone(payload: YemeksepetiDispatchOrder) {
    return payload.customer?.mobilePhone || 'N/A';
  }

  private buildDeliveryAddress(payload: YemeksepetiDispatchOrder) {
    if (!payload.delivery?.address) {
      throw new BadRequestException('Teslimat adresi eksik');
    }

    const { lat, lng } = this.extractCoordinates(payload.delivery.address);
    const addressText =
      payload.delivery.address.address ||
      payload.delivery.address.fullAddress ||
      payload.delivery.address.description ||
      payload.delivery.address.street ||
      'Yemeksepeti teslimat adresi';

    return {
      lat,
      lng,
      address: addressText,
      detail:
        payload.delivery.address.detail ||
        payload.delivery.address.addressLine2 ||
        payload.delivery.address.apartment,
    };
  }

  private extractCoordinates(address: any) {
    const lat =
      address.lat ??
      address.latitude ??
      address.latDegrees ??
      (typeof address.geo === 'object' ? address.geo.lat : undefined);
    const lng =
      address.lng ??
      address.longitude ??
      address.lon ??
      address.long ??
      (typeof address.geo === 'object' ? address.geo.lng : undefined);

    if (lat === undefined || lng === undefined) {
      throw new BadRequestException('Adres koordinatları eksik');
    }

    return { lat: Number(lat), lng: Number(lng) };
  }

  private computeDistance(
    pickup: { lat: number; lng: number },
    delivery: { lat: number; lng: number },
  ) {
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

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  private estimateDeliveryMinutes(expectedDeliveryTime?: string, createdAt?: string) {
    if (!expectedDeliveryTime || !createdAt) {
      return undefined;
    }

    const expected = new Date(expectedDeliveryTime).getTime();
    const created = new Date(createdAt).getTime();

    if (Number.isNaN(expected) || Number.isNaN(created)) {
      return undefined;
    }

    const diffMinutes = Math.max(Math.round((expected - created) / 60000), 0);
    return diffMinutes || undefined;
  }
}
