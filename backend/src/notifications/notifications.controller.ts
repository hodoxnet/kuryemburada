import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Kullanıcının bildirimlerini getir' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: 'boolean', description: 'Sadece okunmamış bildirimleri getir' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Bildirim sayısı limiti' })
  @ApiResponse({ status: 200, description: 'Bildirimler başarıyla getirildi' })
  async getNotifications(
    @Request() req: any,
    @Query('unreadOnly') unreadOnly?: boolean,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.id;
    
    if (unreadOnly === true) {
      return this.notificationsService.getUnreadNotifications(userId);
    }
    
    // Tüm bildirimleri getir (limit ile)
    // Bu method'u NotificationsService'e ekleyeceğiz
    return this.getNotificationsWithLimit(userId, limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Okunmamış bildirim sayısını getir' })
  @ApiResponse({ status: 200, description: 'Okunmamış bildirim sayısı' })
  async getUnreadNotificationCount(@Request() req: any) {
    const userId = req.user.id;
    const notifications = await this.notificationsService.getUnreadNotifications(userId);
    
    return {
      count: notifications.length,
    };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Bildirimi okundu olarak işaretle' })
  @ApiResponse({ status: 200, description: 'Bildirim okundu olarak işaretlendi' })
  async markNotificationAsRead(
    @Param('id') notificationId: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    
    return this.notificationsService.markNotificationAsRead(notificationId, userId);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Tüm bildirimleri okundu olarak işaretle' })
  @ApiResponse({ status: 200, description: 'Tüm bildirimler okundu olarak işaretlendi' })
  async markAllNotificationsAsRead(@Request() req: any) {
    const userId = req.user.id;
    
    return this.notificationsService.markAllNotificationsAsRead(userId);
  }

  @Get('connected-clients')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Bağlı client\'ları getir (sadece admin)' })
  @ApiResponse({ status: 200, description: 'Bağlı client listesi' })
  getConnectedClients() {
    return {
      clients: this.notificationsService.getConnectedClients(),
      total: this.notificationsService.getConnectedClients().length,
    };
  }

  @Post('send-test')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Test bildirimi gönder (sadece admin)' })
  async sendTestNotification(
    @Body() data: {
      userId?: string;
      room?: string;
      type: string;
      title: string;
      message: string;
      sound?: boolean;
    },
  ) {
    const notification = {
      type: data.type,
      title: data.title,
      message: data.message,
      sound: data.sound ?? false,
    };

    if (data.userId) {
      // Belirli bir kullanıcıya gönder
      const clients = this.notificationsService.getClientsByUserId(data.userId);
      for (const client of clients) {
        this.notificationsGateway.sendNotificationToClient(client.clientId, notification);
      }
      
      // Veritabanına da kaydet
      await this.notificationsService.saveNotification(
        data.userId,
        data.type as any,
        data.title,
        data.message,
      );
    } else if (data.room) {
      // Belirli bir room'a gönder
      this.notificationsGateway.sendNotificationToRoom(data.room, notification);
    }

    return {
      message: 'Test bildirimi gönderildi',
      notification,
    };
  }

  @Post('send-bulk')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Toplu bildirim gönder (sadece admin)' })
  async sendBulkNotification(
    @Body() data: {
      userIds: string[];
      type: string;
      title: string;
      message: string;
      sound?: boolean;
    },
  ) {
    const notification = {
      type: data.type,
      title: data.title,
      message: data.message,
      sound: data.sound ?? false,
    };

    const results: Array<{ userId: string; success: boolean; error?: string }> = [];

    for (const userId of data.userIds) {
      try {
        // WebSocket üzerinden gönder
        const clients = this.notificationsService.getClientsByUserId(userId);
        for (const client of clients) {
          this.notificationsGateway.sendNotificationToClient(client.clientId, notification);
        }

        // Veritabanına kaydet
        await this.notificationsService.saveNotification(
          userId,
          data.type as any,
          data.title,
          data.message,
        );

        results.push({ userId, success: true });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    return {
      message: 'Toplu bildirim işlemi tamamlandı',
      results,
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
    };
  }

  private async getNotificationsWithLimit(userId: string, limit?: number) {
    // Bu method'u NotificationsService'e taşıyabiliriz
    // Şimdilik burada basit bir implementasyon yapalım
    return [];
  }
}