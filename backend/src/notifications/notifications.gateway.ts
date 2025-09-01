import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class NotificationsGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(NotificationsGateway.name);
  
  constructor(private readonly notificationsService: NotificationsService) {}
  
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Authentication kontrolü
    const token = client.handshake.auth.token || client.handshake.headers.authorization;
    
    if (!token) {
      this.logger.warn(`Client ${client.id} disconnected: No token provided`);
      client.disconnect();
      return;
    }
    
    // Token'ı verify etmek için servisi kullanabiliriz
    // Şimdilik basic implementasyon yapıyoruz
  }
  
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Client'ın room'lardan çıkışını yönet
    this.notificationsService.handleClientDisconnect(client.id);
  }
  
  // Kurye'nin belirli bir room'a katılması (örneğin courier-{courierId})
  @SubscribeMessage('join-courier-room')
  async joinCourierRoom(
    @MessageBody() data: { courierId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `courier-${data.courierId}`;
    await client.join(roomName);
    
    // Ayrıca genel kurye room'una da kat
    await client.join('couriers');
    
    this.logger.log(`Client ${client.id} joined courier room: ${roomName} and couriers room`);
    
    client.emit('joined-room', { room: roomName, type: 'courier' });
  }
  
  // Firma'nın belirli bir room'a katılması (örneğin company-{companyId})
  @SubscribeMessage('join-company-room')
  async joinCompanyRoom(
    @MessageBody() data: { companyId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `company-${data.companyId}`;
    await client.join(roomName);
    
    this.logger.log(`Client ${client.id} joined company room: ${roomName}`);
    
    client.emit('joined-room', { room: roomName, type: 'company' });
  }
  
  // Tüm kuryelere sipariş bildirimi gönderme
  sendNewOrderToCouriers(order: any) {
    this.server.to('couriers').emit('new-order', {
      type: 'NEW_ORDER',
      title: 'Yeni Sipariş',
      message: `${order.pickupAddress} adresinden yeni bir sipariş var`,
      data: order,
      timestamp: new Date(),
      sound: true, // Zil sesi çalması için
    });
    
    this.logger.log(`New order notification sent to couriers: ${order.id}`);
  }
  
  // Belirli bir kuryeye sipariş ataması bildirimi
  sendOrderAssignedToCourier(courierId: string, order: any) {
    this.server.to(`courier-${courierId}`).emit('order-assigned', {
      type: 'ORDER_ASSIGNED',
      title: 'Sipariş Atandı',
      message: `Size yeni bir sipariş atandı: ${order.pickupAddress}`,
      data: order,
      timestamp: new Date(),
      sound: true,
    });
    
    this.logger.log(`Order assigned notification sent to courier ${courierId}: ${order.id}`);
  }
  
  // Firmaya sipariş durumu güncelleme bildirimi
  sendOrderStatusUpdateToCompany(companyId: string, order: any, status: string) {
    const statusMessages = {
      ACCEPTED: 'Siparişiniz kurye tarafından kabul edildi',
      IN_PROGRESS: 'Kurye siparişinizi teslim etmek için yola çıktı',
      DELIVERED: 'Siparişiniz başarıyla teslim edildi',
      CANCELLED: 'Siparişiniz iptal edildi',
    };
    
    this.server.to(`company-${companyId}`).emit('order-status-update', {
      type: 'ORDER_STATUS_UPDATE',
      title: 'Sipariş Durumu Güncellendi',
      message: statusMessages[status] || `Sipariş durumu: ${status}`,
      data: { order, status },
      timestamp: new Date(),
      sound: true,
    });
    
    this.logger.log(`Order status update notification sent to company ${companyId}: ${order.id} - ${status}`);
  }
  
  // Genel bildirim gönderme metodu
  sendNotificationToRoom(room: string, notification: any) {
    this.server.to(room).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
    
    this.logger.log(`Notification sent to room ${room}: ${notification.type}`);
  }
  
  // Belirli bir client'a bildirim gönderme
  sendNotificationToClient(clientId: string, notification: any) {
    this.server.to(clientId).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
    
    this.logger.log(`Notification sent to client ${clientId}: ${notification.type}`);
  }
}