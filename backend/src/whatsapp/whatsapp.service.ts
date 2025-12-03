import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppApiService } from './whatsapp-api.service';
import { WhatsAppFlowService } from './whatsapp-flow.service';
import {
  WhatsAppWebhookPayload,
  WhatsAppMessage,
  ManualSetupDto,
  UpdateSettingsDto,
  WhatsAppConfigResponseDto,
  TestConnectionResponseDto,
  WhatsAppStatisticsDto,
  WhatsAppSessionDto,
  OAuthCallbackDto,
  ApproveOrderDto,
  RejectOrderDto,
} from './dto';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, WhatsAppFlowState } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private prisma: PrismaService,
    private whatsAppApi: WhatsAppApiService,
    private flowService: WhatsAppFlowService,
    private configService: ConfigService,
  ) {}

  // ==================== Config Yönetimi ====================

  /**
   * Mevcut WhatsApp config'ini getir
   */
  async getConfig(): Promise<WhatsAppConfigResponseDto | null> {
    const config = await this.prisma.whatsAppConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      return null;
    }

    const webhookUrl = `${this.configService.get<string>('API_BASE_URL', 'https://api.kuryemburada.com')}/whatsapp/webhook`;

    return {
      id: config.id,
      connectionMethod: config.connectionMethod as any,
      phoneNumberId: config.phoneNumberId,
      businessAccountId: config.businessAccountId,
      isActive: config.isActive,
      isVerified: config.isVerified,
      welcomeMessage: config.welcomeMessage,
      offHoursMessage: config.offHoursMessage,
      notifyOnOrderApproval: config.notifyOnOrderApproval,
      notifyOnCourierAssign: config.notifyOnCourierAssign,
      notifyOnDelivery: config.notifyOnDelivery,
      connectedAt: config.connectedAt,
      lastTestedAt: config.lastTestedAt,
      webhookUrl,
    };
  }

  /**
   * Manuel kurulum ile config oluştur (alias for controller)
   */
  async manualSetup(dto: ManualSetupDto): Promise<WhatsAppConfigResponseDto | null> {
    return this.setupManual(dto);
  }

  /**
   * Manuel kurulum ile config oluştur
   */
  async setupManual(dto: ManualSetupDto): Promise<WhatsAppConfigResponseDto | null> {
    // Mevcut config'i kontrol et
    const existingConfig = await this.prisma.whatsAppConfig.findFirst();
    if (existingConfig) {
      // Güncelle
      const updated = await this.prisma.whatsAppConfig.update({
        where: { id: existingConfig.id },
        data: {
          connectionMethod: 'MANUAL',
          phoneNumberId: dto.phoneNumberId,
          businessAccountId: dto.businessAccountId,
          accessToken: this.encryptToken(dto.accessToken),
          webhookVerifyToken: dto.webhookVerifyToken || this.generateVerifyToken(),
          isVerified: false,
          connectedAt: new Date(),
        },
      });

      this.logger.log(`WhatsApp config güncellendi: ${updated.id}`);
      return this.getConfig();
    }

    // Yeni oluştur
    const config = await this.prisma.whatsAppConfig.create({
      data: {
        connectionMethod: 'MANUAL',
        phoneNumberId: dto.phoneNumberId,
        businessAccountId: dto.businessAccountId,
        accessToken: this.encryptToken(dto.accessToken),
        webhookVerifyToken: dto.webhookVerifyToken || this.generateVerifyToken(),
      },
    });

    this.logger.log(`WhatsApp config oluşturuldu: ${config.id}`);
    return this.getConfig();
  }

  /**
   * Embedded Signup OAuth callback işle
   */
  async handleOAuthCallback(dto: OAuthCallbackDto): Promise<WhatsAppConfigResponseDto | null> {
    this.logger.log(`OAuth callback başlatılıyor - waba_id: ${dto.waba_id}, phone_number_id: ${dto.phone_number_id}`);

    // Token exchange veya frontend'den gelen token'ı kullan
    let accessToken: string;

    if (dto.access_token) {
      // Frontend'den access token geldi
      this.logger.log('Frontend access token kullanılıyor');
      accessToken = dto.access_token;
    } else {
      // Code ile token exchange yap
      const tokenResponse = await this.whatsAppApi.exchangeCodeForToken(dto.code);
      accessToken = tokenResponse.access_token;
    }

    let businessAccountId: string;
    let phoneNumberId: string;

    // Frontend'den WABA ID ve Phone Number ID geldiyse kullan
    if (dto.waba_id && dto.phone_number_id) {
      this.logger.log('Frontend\'den gelen WABA ve Phone Number ID kullanılıyor');
      businessAccountId = dto.waba_id;
      phoneNumberId = dto.phone_number_id;
    } else {
      // API'den al
      this.logger.log('API\'den WABA bilgileri alınıyor...');

      // Business account bilgilerini al
      const accounts = await this.whatsAppApi.getWhatsAppBusinessAccounts(accessToken);

      if (!accounts.data || accounts.data.length === 0) {
        throw new BadRequestException('WhatsApp Business hesabı bulunamadı. Lütfen Manuel Kurulum sekmesini kullanın.');
      }

      businessAccountId = accounts.data[0].id;

      // Phone numbers al
      const phoneNumbers = await this.whatsAppApi.getPhoneNumbers(accessToken, businessAccountId);

      if (!phoneNumbers.data || phoneNumbers.data.length === 0) {
        throw new BadRequestException('WhatsApp telefon numarası bulunamadı. Lütfen Manuel Kurulum sekmesini kullanın.');
      }

      phoneNumberId = phoneNumbers.data[0].id;
    }

    // Webhook'a subscribe ol (hata olursa devam et)
    try {
      await this.whatsAppApi.subscribeToWebhook(accessToken, businessAccountId);
    } catch (error) {
      this.logger.warn(`Webhook subscription hatası (devam ediliyor): ${error.message}`);
    }

    // Config kaydet
    const existingConfig = await this.prisma.whatsAppConfig.findFirst();

    const configData = {
      connectionMethod: 'EMBEDDED_SIGNUP' as const,
      phoneNumberId: phoneNumberId,
      businessAccountId: businessAccountId,
      accessToken: this.encryptToken(accessToken),
      webhookVerifyToken: this.generateVerifyToken(),
      refreshToken: null, // Permanent token kullanıyoruz
      tokenExpiresAt: null, // System User token'lar expire olmaz
      isVerified: true,
      connectedAt: new Date(),
    };

    if (existingConfig) {
      await this.prisma.whatsAppConfig.update({
        where: { id: existingConfig.id },
        data: configData,
      });
    } else {
      await this.prisma.whatsAppConfig.create({
        data: configData,
      });
    }

    this.logger.log(`WhatsApp Embedded Signup tamamlandı - WABA: ${businessAccountId}, Phone: ${phoneNumberId}`);
    return this.getConfig();
  }

  /**
   * Ayarları güncelle
   */
  async updateSettings(dto: UpdateSettingsDto): Promise<WhatsAppConfigResponseDto | null> {
    const config = await this.prisma.whatsAppConfig.findFirst();

    if (!config) {
      throw new NotFoundException('WhatsApp config bulunamadı');
    }

    await this.prisma.whatsAppConfig.update({
      where: { id: config.id },
      data: {
        welcomeMessage: dto.welcomeMessage ?? config.welcomeMessage,
        offHoursMessage: dto.offHoursMessage ?? config.offHoursMessage,
        notifyOnOrderApproval: dto.notifyOnOrderApproval ?? config.notifyOnOrderApproval,
        notifyOnCourierAssign: dto.notifyOnCourierAssign ?? config.notifyOnCourierAssign,
        notifyOnDelivery: dto.notifyOnDelivery ?? config.notifyOnDelivery,
        isActive: dto.isActive ?? config.isActive,
      },
    });

    this.logger.log('WhatsApp ayarları güncellendi');
    return this.getConfig();
  }

  /**
   * Bağlantıyı test et
   */
  async testConnection(): Promise<TestConnectionResponseDto> {
    const config = await this.prisma.whatsAppConfig.findFirst();

    if (!config) {
      return {
        success: false,
        message: 'WhatsApp config bulunamadı',
      };
    }

    const accessToken = this.decryptToken(config.accessToken);
    const result = await this.whatsAppApi.testConnection(accessToken, config.phoneNumberId);

    if (result.success) {
      await this.prisma.whatsAppConfig.update({
        where: { id: config.id },
        data: {
          isVerified: true,
          lastTestedAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Bağlantı başarılı',
        phoneNumber: result.data.display_phone_number,
        businessName: result.data.verified_name,
      };
    }

    return {
      success: false,
      message: 'Bağlantı başarısız',
      error: result.error,
    };
  }

  /**
   * Bağlantıyı kes
   */
  async disconnect(): Promise<void> {
    const config = await this.prisma.whatsAppConfig.findFirst();

    if (config) {
      await this.prisma.whatsAppConfig.delete({
        where: { id: config.id },
      });
    }

    this.logger.log('WhatsApp bağlantısı kesildi');
  }

  // ==================== Webhook İşleme ====================

  /**
   * Gelen webhook'u işle (alias for controller)
   */
  async processWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
    return this.handleWebhook(payload);
  }

  /**
   * Gelen webhook'u işle
   */
  async handleWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        const value = change.value;

        // Mesaj işle
        if (value.messages && value.messages.length > 0) {
          for (const message of value.messages) {
            await this.handleIncomingMessage(message, value.contacts?.[0]);
          }
        }

        // Status güncellemesi işle
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            await this.handleStatusUpdate(status);
          }
        }
      }
    }
  }

  /**
   * Gelen mesajı işle
   */
  private async handleIncomingMessage(
    message: WhatsAppMessage,
    contact: { profile: { name: string }; wa_id: string } | undefined,
  ): Promise<void> {
    this.logger.debug(`Gelen mesaj: ${message.from} - ${message.type}`);

    // Config'i al ve API'yi başlat
    const config = await this.getActiveConfig();
    if (!config) {
      this.logger.warn('WhatsApp config bulunamadı, mesaj işlenemiyor');
      return;
    }

    // API client'ı başlat
    const accessToken = this.decryptToken(config.accessToken);
    this.whatsAppApi.initializeClient(config.phoneNumberId, accessToken);

    // Mesajı okundu olarak işaretle
    await this.whatsAppApi.markAsRead(message.id);

    // Mesajı kaydet
    await this.saveMessage(message, 'INBOUND');

    // Flow servisine yönlendir
    await this.flowService.processMessage(message, contact?.profile?.name);
  }

  /**
   * Status güncellemesini işle
   */
  private async handleStatusUpdate(status: any): Promise<void> {
    this.logger.debug(`Status güncelleme: ${status.id} - ${status.status}`);

    await this.prisma.whatsAppMessage.updateMany({
      where: { messageId: status.id },
      data: {
        status: status.status,
        statusUpdatedAt: new Date(),
      },
    });
  }

  // ==================== Session Yönetimi ====================

  /**
   * Aktif oturumları listele
   */
  async getActiveSessions(): Promise<WhatsAppSessionDto[]> {
    const sessions = await this.prisma.whatsAppSession.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        company: {
          select: { name: true },
        },
        order: {
          select: { orderNumber: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
    });

    return sessions.map((s) => ({
      id: s.id,
      phoneNumber: s.phoneNumber,
      customerName: s.customerName,
      state: s.state,
      companyName: s.company?.name || null,
      orderNumber: s.order?.orderNumber || null,
      lastMessageAt: s.lastMessageAt,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }));
  }

  // ==================== İstatistikler ====================

  /**
   * WhatsApp istatistiklerini getir
   */
  async getStatistics(period: 'today' | 'week' | 'month' = 'today'): Promise<WhatsAppStatisticsDto> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Bugünkü mesajlar ve siparişler
    const [todayMessages, todayOrders] = await Promise.all([
      this.prisma.whatsAppMessage.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.order.count({
        where: {
          source: 'WHATSAPP',
          createdAt: { gte: today },
        },
      }),
    ]);

    // Bu haftaki mesajlar ve siparişler
    const [weekMessages, weekOrders] = await Promise.all([
      this.prisma.whatsAppMessage.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      this.prisma.order.count({
        where: {
          source: 'WHATSAPP',
          createdAt: { gte: weekAgo },
        },
      }),
    ]);

    // Bu ayki mesajlar ve siparişler
    const [monthMessages, monthOrders] = await Promise.all([
      this.prisma.whatsAppMessage.count({
        where: { createdAt: { gte: monthAgo } },
      }),
      this.prisma.order.count({
        where: {
          source: 'WHATSAPP',
          createdAt: { gte: monthAgo },
        },
      }),
    ]);

    // Aktif oturumlar
    const activeSessions = await this.prisma.whatsAppSession.count({
      where: { expiresAt: { gt: now } },
    });

    // Son 30 gün grafik verisi
    const dailyStats = await this.getDailyStats(monthAgo);

    return {
      todayMessages,
      todayOrders,
      todayConversionRate: todayMessages > 0 ? Math.round((todayOrders / todayMessages) * 100) : 0,
      weekMessages,
      weekOrders,
      weekConversionRate: weekMessages > 0 ? Math.round((weekOrders / weekMessages) * 100) : 0,
      monthMessages,
      monthOrders,
      monthConversionRate: monthMessages > 0 ? Math.round((monthOrders / monthMessages) * 100) : 0,
      activeSessions,
      dailyStats,
    };
  }

  /**
   * Günlük istatistikleri al
   */
  private async getDailyStats(since: Date): Promise<{ date: string; messages: number; orders: number }[]> {
    // Son 30 gün için günlük bazda verileri grupla
    const messages = await this.prisma.whatsAppMessage.groupBy({
      by: ['createdAt'],
      _count: true,
      where: { createdAt: { gte: since } },
    });

    const orders = await this.prisma.order.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        source: 'WHATSAPP',
        createdAt: { gte: since },
      },
    });

    // Basit bir günlük aggregation (gerçek implementasyonda raw SQL kullanılabilir)
    const stats: { date: string; messages: number; orders: number }[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      stats.push({
        date: dateStr,
        messages: 0, // TODO: Gerçek değerleri hesapla
        orders: 0,
      });
    }

    return stats;
  }

  // ==================== Yardımcı Metodlar ====================

  /**
   * Aktif config'i al
   */
  private async getActiveConfig() {
    return this.prisma.whatsAppConfig.findFirst({
      where: { isActive: true },
    });
  }

  /**
   * Mesajı kaydet
   */
  private async saveMessage(message: WhatsAppMessage, direction: 'INBOUND' | 'OUTBOUND'): Promise<void> {
    // Session bul
    const session = await this.prisma.whatsAppSession.findFirst({
      where: { phoneNumber: message.from },
      orderBy: { createdAt: 'desc' },
    });

    await this.prisma.whatsAppMessage.create({
      data: {
        sessionId: session?.id,
        messageId: message.id,
        from: message.from,
        to: direction === 'INBOUND' ? 'system' : message.from,
        direction,
        type: message.type,
        content: this.extractMessageContent(message),
        status: 'received',
      },
    });
  }

  /**
   * Mesaj içeriğini çıkar
   */
  private extractMessageContent(message: WhatsAppMessage): any {
    switch (message.type) {
      case 'text':
        return { text: message.text?.body };
      case 'location':
        return message.location;
      case 'interactive':
        return message.interactive;
      case 'button':
        return message.button;
      case 'contacts':
        return message.contacts;
      default:
        return { type: message.type };
    }
  }

  /**
   * Token şifrele (basit implementasyon - production'da daha güçlü kullanın)
   */
  private encryptToken(token: string): string {
    const key = this.configService.get<string>('JWT_SECRET', 'default-secret');
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      crypto.scryptSync(key, 'salt', 32),
      Buffer.alloc(16, 0),
    );
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Token çöz
   */
  private decryptToken(encryptedToken: string): string {
    const key = this.configService.get<string>('JWT_SECRET', 'default-secret');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      crypto.scryptSync(key, 'salt', 32),
      Buffer.alloc(16, 0),
    );
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Rastgele verify token oluştur
   */
  private generateVerifyToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // ==================== Session Yönetimi (Pagination) ====================

  /**
   * Oturumları pagination ile listele
   */
  async getSessions(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: WhatsAppSessionDto[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this.prisma.whatsAppSession.findMany({
        where: {
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          company: {
            select: { name: true },
          },
          order: {
            select: { orderNumber: true },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.whatsAppSession.count({
        where: {
          expiresAt: {
            gt: new Date(),
          },
        },
      }),
    ]);

    return {
      data: sessions.map((s) => ({
        id: s.id,
        phoneNumber: s.phoneNumber,
        customerName: s.customerName,
        state: s.state,
        companyName: s.company?.name || null,
        orderNumber: s.order?.orderNumber || null,
        lastMessageAt: s.lastMessageAt,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * Tek bir oturumu getir
   */
  async getSession(id: string): Promise<WhatsAppSessionDto> {
    const session = await this.prisma.whatsAppSession.findUnique({
      where: { id },
      include: {
        company: {
          select: { name: true },
        },
        order: {
          select: { orderNumber: true, status: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Oturum bulunamadı');
    }

    return {
      id: session.id,
      phoneNumber: session.phoneNumber,
      customerName: session.customerName,
      state: session.state,
      companyName: session.company?.name || null,
      orderNumber: session.order?.orderNumber || null,
      lastMessageAt: session.lastMessageAt,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  }

  // ==================== Firma Sipariş İşlemleri ====================

  /**
   * Onay bekleyen siparişleri listele (Firma için)
   */
  async getPendingApprovalOrders(
    companyId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          companyId,
          source: 'WHATSAPP',
          status: OrderStatus.PENDING_APPROVAL,
        },
        include: {
          whatsappSession: {
            select: {
              phoneNumber: true,
              customerName: true,
              customerLocation: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: {
          companyId,
          source: 'WHATSAPP',
          status: OrderStatus.PENDING_APPROVAL,
        },
      }),
    ]);

    return {
      data: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        orderContent: order.orderContent,
        customerName: order.whatsappSession?.customerName || order.recipientName,
        customerPhone: order.whatsappSession?.phoneNumber || order.customerWhatsApp,
        customerLocation: order.whatsappSession?.customerLocation,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes,
        createdAt: order.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * Siparişi onayla ve fiyat belirle
   */
  async approveOrder(
    orderId: string,
    companyId: string,
    dto: ApproveOrderDto,
  ): Promise<any> {
    // Siparişi bul ve yetkiyi kontrol et
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        companyId,
        source: 'WHATSAPP',
        status: OrderStatus.PENDING_APPROVAL,
      },
      include: {
        whatsappSession: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı veya onaylanamaz durumda');
    }

    // Siparişi güncelle
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        approvedPrice: dto.price,
        approvalNotes: dto.notes,
        approvedAt: new Date(),
        estimatedTime: dto.estimatedDeliveryTime,
      },
    });

    // WhatsApp session'ı güncelle
    if (order.whatsappSession) {
      await this.prisma.whatsAppSession.update({
        where: { id: order.whatsappSession.id },
        data: {
          state: WhatsAppFlowState.CONFIRM_PRICE,
          stateData: {
            approvedPrice: dto.price,
            estimatedDeliveryTime: dto.estimatedDeliveryTime,
            approvalNotes: dto.notes,
          },
        },
      });

      // Müşteriye WhatsApp mesajı gönder
      await this.sendPriceConfirmationMessage(
        order.whatsappSession.phoneNumber,
        dto.price,
        dto.estimatedDeliveryTime,
      );
    }

    this.logger.log(`Sipariş onaylandı: ${orderId}, fiyat: ${dto.price}`);

    return updatedOrder;
  }

  /**
   * Siparişi reddet
   */
  async rejectOrder(
    orderId: string,
    companyId: string,
    dto: RejectOrderDto,
  ): Promise<any> {
    // Siparişi bul ve yetkiyi kontrol et
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        companyId,
        source: 'WHATSAPP',
        status: OrderStatus.PENDING_APPROVAL,
      },
      include: {
        whatsappSession: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı veya reddedilemez durumda');
    }

    // Siparişi güncelle
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.REJECTED,
        approvalNotes: dto.reason,
      },
    });

    // WhatsApp session'ı sonlandır
    if (order.whatsappSession) {
      await this.prisma.whatsAppSession.update({
        where: { id: order.whatsappSession.id },
        data: {
          state: WhatsAppFlowState.WELCOME,
          stateData: {},
        },
      });

      // Müşteriye WhatsApp mesajı gönder
      await this.sendRejectionMessage(
        order.whatsappSession.phoneNumber,
        dto.reason,
      );
    }

    this.logger.log(`Sipariş reddedildi: ${orderId}, neden: ${dto.reason}`);

    return updatedOrder;
  }

  /**
   * Test mesajı gönder
   */
  async sendTestMessage(phoneNumber: string, message: string): Promise<any> {
    const config = await this.getActiveConfig();
    if (!config) {
      throw new BadRequestException('WhatsApp config bulunamadı');
    }

    const accessToken = this.decryptToken(config.accessToken);
    this.whatsAppApi.initializeClient(config.phoneNumberId, accessToken);

    return this.whatsAppApi.sendTextMessage({
      to: phoneNumber,
      text: message,
    });
  }

  // ==================== WhatsApp Bildirim Mesajları ====================

  /**
   * Fiyat onay mesajı gönder
   */
  private async sendPriceConfirmationMessage(
    phoneNumber: string,
    price: number,
    estimatedDeliveryTime?: number,
  ): Promise<void> {
    const config = await this.getActiveConfig();
    if (!config) return;

    const accessToken = this.decryptToken(config.accessToken);
    this.whatsAppApi.initializeClient(config.phoneNumberId, accessToken);

    const deliveryText = estimatedDeliveryTime
      ? `\n⏱️ Tahmini Teslimat: ${estimatedDeliveryTime} dakika`
      : '';

    await this.whatsAppApi.sendButtonMessage({
      to: phoneNumber,
      headerText: '🎉 Siparişiniz Onaylandı!',
      bodyText: `Restoran siparişinizi onayladı.\n\n💰 Toplam Tutar: ${price}₺${deliveryText}\n\nOnaylıyor musunuz?`,
      buttons: [
        { id: 'confirm_price', title: '✅ Onayla' },
        { id: 'cancel_order', title: '❌ Vazgeç' },
      ],
    });
  }

  /**
   * Red mesajı gönder
   */
  private async sendRejectionMessage(
    phoneNumber: string,
    reason?: string,
  ): Promise<void> {
    const config = await this.getActiveConfig();
    if (!config) return;

    const accessToken = this.decryptToken(config.accessToken);
    this.whatsAppApi.initializeClient(config.phoneNumberId, accessToken);

    const reasonText = reason ? `\n\nNeden: ${reason}` : '';

    await this.whatsAppApi.sendTextMessage({
      to: phoneNumber,
      text: `😔 Üzgünüz, siparişiniz restoran tarafından kabul edilemedi.${reasonText}\n\nYeni bir sipariş vermek için "Merhaba" yazabilirsiniz.`,
    });
  }
}
