import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface NotificationData {
  type: string;
  title: string;
  message: string;
  data?: any;
  sound?: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  
  // Bağlı client'ları takip etmek için Map yapısı
  private connectedClients: Map<string, {
    clientId: string;
    userId: string;
    userRole: string;
    rooms: string[];
    connectedAt: Date;
  }> = new Map();
  
  constructor(private readonly prisma: PrismaService) {}
  
  // Client bağlantısını kaydet
  registerClient(clientId: string, userId: string, userRole: string) {
    this.connectedClients.set(clientId, {
      clientId,
      userId,
      userRole,
      rooms: [],
      connectedAt: new Date(),
    });
    
    this.logger.log(`Client registered: ${clientId} (User: ${userId}, Role: ${userRole})`);
  }
  
  // Client'ın room'a katılımını takip et
  addClientToRoom(clientId: string, roomName: string) {
    const client = this.connectedClients.get(clientId);
    if (client && !client.rooms.includes(roomName)) {
      client.rooms.push(roomName);
      this.logger.log(`Client ${clientId} added to room: ${roomName}`);
    }
  }
  
  // Client bağlantı kesildiğinde temizlik yap
  handleClientDisconnect(clientId: string) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      this.logger.log(`Cleaning up client: ${clientId} (was in rooms: ${client.rooms.join(', ')})`);
      this.connectedClients.delete(clientId);
    }
  }
  
  // Bağlı client'ları getir
  getConnectedClients(): Array<any> {
    return Array.from(this.connectedClients.values());
  }
  
  // Belirli bir role sahip client'ları getir
  getClientsByRole(role: string): Array<any> {
    return Array.from(this.connectedClients.values())
      .filter(client => client.userRole === role);
  }
  
  // Belirli bir kullanıcının bağlı client'larını getir
  getClientsByUserId(userId: string): Array<any> {
    return Array.from(this.connectedClients.values())
      .filter(client => client.userId === userId);
  }
  
  // Veritabanına bildirim kaydet
  async saveNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
  ) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data: data ? JSON.stringify(data) : undefined,
          isRead: false,
        },
      });
      
      this.logger.log(`Notification saved to database: ${notification.id}`);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to save notification: ${error.message}`);
      throw error;
    }
  }
  
  // Kullanıcının okunmamış bildirimlerini getir
  async getUnreadNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  
  // Bildirimi okundu olarak işaretle
  async markNotificationAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.update({
      where: {
        id: notificationId,
        userId, // Güvenlik için userId kontrolü
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
  
  // Tüm bildirimleri okundu olarak işaretle
  async markAllNotificationsAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
  
  // Eski bildirimleri temizle (örneğin 30 günden eski olanları)
  async cleanupOldNotifications(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    this.logger.log(`Cleaned up ${result.count} old notifications`);
    return result;
  }
  
  // Yeni sipariş bildirimi oluştur
  createNewOrderNotification(order: any): NotificationData {
    const pickup = order?.pickupAddress?.address || order?.pickupAddress || '';
    const delivery = order?.deliveryAddress?.address || order?.deliveryAddress || '';
    const totalPrice = order?.totalPrice ?? order?.price;
    const courierEarning = order?.courierEarning ?? null;
    return {
      type: 'NEW_ORDER',
      title: 'Yeni Sipariş Mevcut',
      message: `${pickup} → ${delivery}`,
      data: {
        ...order,
        orderId: order?.id,
        totalPrice,
        courierEarning,
        price: totalPrice, // geriye dönük uyumluluk
      },
      sound: true,
    };
  }
  
  // Sipariş atama bildirimi oluştur
  createOrderAssignedNotification(order: any): NotificationData {
    return {
      type: 'ORDER_ASSIGNED',
      title: 'Sipariş Atandı',
      message: `Yeni sipariş atandı: ${order.pickupAddress}`,
      data: order,
      sound: true,
    };
  }
  
  // Sipariş durumu güncelleme bildirimi oluştur
  createOrderStatusUpdateNotification(order: any, status: string): NotificationData {
    const statusMessages = {
      ACCEPTED: 'Sipariş kurye tarafından kabul edildi',
      IN_PROGRESS: 'Kurye teslimat için yola çıktı',
      DELIVERED: 'Sipariş başarıyla teslim edildi',
      CANCELLED: 'Sipariş iptal edildi',
      REJECTED: 'Sipariş kurye tarafından reddedildi',
    };
    
    return {
      type: 'ORDER_STATUS_UPDATE',
      title: 'Sipariş Durumu Güncellendi',
      message: statusMessages[status] || `Sipariş durumu: ${status}`,
      data: { order, status },
      sound: true,
    };
  }
  
  // Ödeme bildirimi oluştur
  createPaymentNotification(payment: any): NotificationData {
    return {
      type: 'PAYMENT_UPDATE',
      title: 'Ödeme Durumu Güncellendi',
      message: `Ödeme durumu: ${payment.status}`,
      data: payment,
      sound: false,
    };
  }
}
