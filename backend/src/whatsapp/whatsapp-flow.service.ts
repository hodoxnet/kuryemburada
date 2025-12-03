import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppApiService } from './whatsapp-api.service';
import { WhatsAppMessage, WhatsAppFlowState, Prisma } from '@prisma/client';
import {
  WhatsAppMessage as IncomingMessage,
  SendButtonMessageDto,
  SendListMessageDto,
} from './dto';

@Injectable()
export class WhatsAppFlowService {
  private readonly logger = new Logger(WhatsAppFlowService.name);

  constructor(
    private prisma: PrismaService,
    private whatsAppApi: WhatsAppApiService,
  ) {}

  /**
   * Gelen mesajı işle ve uygun yanıtı gönder
   */
  async processMessage(message: IncomingMessage, customerName?: string): Promise<void> {
    const phoneNumber = message.from;

    // Session bul veya oluştur
    let session = await this.getOrCreateSession(phoneNumber, customerName);

    this.logger.debug(`İşleniyor: ${phoneNumber} - State: ${session.state}`);

    try {
      // State'e göre işle
      switch (session.state) {
        case 'WELCOME':
          await this.handleWelcome(session, message);
          break;

        case 'SELECT_COMPANY':
          await this.handleSelectCompany(session, message);
          break;

        case 'ENTER_ORDER':
          await this.handleEnterOrder(session, message);
          break;

        case 'SHARE_LOCATION':
          await this.handleShareLocation(session, message);
          break;

        case 'SHARE_CONTACT':
          await this.handleShareContact(session, message);
          break;

        case 'CONFIRM_ORDER':
          await this.handleConfirmOrder(session, message);
          break;

        case 'WAITING_APPROVAL':
          await this.handleWaitingApproval(session, message);
          break;

        case 'CONFIRM_PRICE':
          await this.handleConfirmPrice(session, message);
          break;

        case 'ORDER_CONFIRMED':
        case 'TRACKING':
          await this.handleTracking(session, message);
          break;

        default:
          await this.handleWelcome(session, message);
      }

      // Session'ı güncelle
      await this.updateSessionActivity(session.id);
    } catch (error) {
      this.logger.error(`Flow işleme hatası: ${error.message}`);
      await this.sendErrorMessage(phoneNumber);
    }
  }

  // ==================== State Handlers ====================

  /**
   * Hoş geldin mesajı gönder
   */
  private async handleWelcome(session: any, message: IncomingMessage): Promise<void> {
    // Config'den hoş geldin mesajını al
    const config = await this.prisma.whatsAppConfig.findFirst();
    const welcomeMessage = config?.welcomeMessage || 'Hoş geldiniz! Size nasıl yardımcı olabilirim?';

    // Butonlu mesaj gönder
    await this.whatsAppApi.sendButtonMessage({
      to: session.phoneNumber,
      bodyText: `${welcomeMessage}\n\nSipariş vermek için lütfen bir seçenek seçin:`,
      buttons: [
        { id: 'nearby', title: 'Yakınımdaki Firmalar' },
        { id: 'list', title: 'Tüm Firmalar' },
        { id: 'track', title: 'Sipariş Takip' },
      ],
    });

    // State'i güncelle
    await this.updateSessionState(session.id, 'SELECT_COMPANY');
  }

  /**
   * Firma seçimi
   */
  private async handleSelectCompany(session: any, message: IncomingMessage): Promise<void> {
    // Button reply kontrolü
    if (message.type === 'interactive' && message.interactive?.button_reply) {
      const buttonId = message.interactive.button_reply.id;

      if (buttonId === 'nearby') {
        // Konum isteği gönder
        await this.whatsAppApi.sendLocationRequest({
          to: session.phoneNumber,
          bodyText: 'Yakınındaki firmaları bulmak için konumunuzu paylaşır mısınız?',
        });
        return;
      }

      if (buttonId === 'list') {
        // Tüm firmaları listele
        await this.sendCompanyList(session.phoneNumber, null);
        return;
      }

      if (buttonId === 'track') {
        // Sipariş takip
        await this.handleTrackingRequest(session);
        return;
      }
    }

    // Konum mesajı kontrolü
    if (message.type === 'location' && message.location) {
      // Konuma göre firmaları listele
      await this.updateSessionData(session.id, {
        customerLocation: {
          lat: message.location.latitude,
          lng: message.location.longitude,
          address: message.location.address,
        },
      });

      await this.sendCompanyList(session.phoneNumber, message.location);
      return;
    }

    // Liste seçimi kontrolü
    if (message.type === 'interactive' && message.interactive?.list_reply) {
      const companyId = message.interactive.list_reply.id;

      // Firma seçildi
      await this.selectCompany(session, companyId);
      return;
    }

    // Anlaşılamayan mesaj
    await this.sendButtonMessage(session.phoneNumber, {
      bodyText: 'Lütfen aşağıdaki seçeneklerden birini seçin:',
      buttons: [
        { id: 'nearby', title: 'Yakınımdaki Firmalar' },
        { id: 'list', title: 'Tüm Firmalar' },
      ],
    });
  }

  /**
   * Firma listesi gönder
   */
  private async sendCompanyList(phoneNumber: string, location?: { latitude: number; longitude: number } | null): Promise<void> {
    // Aktif firmaları al
    const companies = await this.prisma.company.findMany({
      where: { status: 'ACTIVE' },
      take: 10,
      orderBy: { name: 'asc' },
    });

    if (companies.length === 0) {
      await this.whatsAppApi.sendTextMessage({
        to: phoneNumber,
        text: 'Üzgünüz, şu an aktif firma bulunmuyor. Lütfen daha sonra tekrar deneyin.',
      });
      return;
    }

    // TODO: Konum bazlı sıralama ekle

    await this.whatsAppApi.sendListMessage({
      to: phoneNumber,
      bodyText: 'Sipariş vermek istediğiniz firmayı seçin:',
      buttonText: 'Firmaları Gör',
      sections: [
        {
          title: 'Firmalar',
          rows: companies.map((c) => ({
            id: c.id,
            title: c.name.substring(0, 24),
            description: this.getCompanyAddress(c.address),
          })),
        },
      ],
    });
  }

  /**
   * Firma seçildi
   */
  private async selectCompany(session: any, companyId: string): Promise<void> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      await this.whatsAppApi.sendTextMessage({
        to: session.phoneNumber,
        text: 'Firma bulunamadı. Lütfen tekrar seçim yapın.',
      });
      return;
    }

    // Session'ı güncelle
    await this.prisma.whatsAppSession.update({
      where: { id: session.id },
      data: {
        companyId: company.id,
        state: 'ENTER_ORDER',
        stateData: {
          ...(session.stateData as object || {}),
          selectedCompany: {
            id: company.id,
            name: company.name,
          },
        },
      },
    });

    // Sipariş girişi için mesaj gönder
    await this.whatsAppApi.sendTextMessage({
      to: session.phoneNumber,
      text: `${company.name} firmasından ne sipariş vermek istersiniz?\n\nSiparişinizi yazın (örn: "2 lahmacun, 1 ayran"):`,
    });
  }

  /**
   * Sipariş içeriği alma
   */
  private async handleEnterOrder(session: any, message: IncomingMessage): Promise<void> {
    if (message.type !== 'text' || !message.text?.body) {
      await this.whatsAppApi.sendTextMessage({
        to: session.phoneNumber,
        text: 'Lütfen siparişinizi metin olarak yazın:',
      });
      return;
    }

    const orderContent = message.text.body;

    // Session'ı güncelle
    await this.updateSessionData(session.id, {
      orderContent,
    });

    // Konum bilgisi var mı kontrol et
    const stateData = session.stateData as any || {};
    if (stateData.customerLocation) {
      // Konum varsa, iletişim bilgisi iste
      await this.updateSessionState(session.id, 'SHARE_CONTACT');
      await this.requestContactInfo(session.phoneNumber);
    } else {
      // Konum yoksa, konum iste
      await this.updateSessionState(session.id, 'SHARE_LOCATION');
      await this.whatsAppApi.sendLocationRequest({
        to: session.phoneNumber,
        bodyText: 'Teslimat adresinizi paylaşır mısınız?',
      });
    }
  }

  /**
   * Konum alma
   */
  private async handleShareLocation(session: any, message: IncomingMessage): Promise<void> {
    if (message.type === 'location' && message.location) {
      await this.updateSessionData(session.id, {
        customerLocation: {
          lat: message.location.latitude,
          lng: message.location.longitude,
          address: message.location.address || message.location.name,
        },
      });

      await this.updateSessionState(session.id, 'SHARE_CONTACT');
      await this.requestContactInfo(session.phoneNumber);
      return;
    }

    // Text olarak adres kabul et
    if (message.type === 'text' && message.text?.body) {
      await this.updateSessionData(session.id, {
        customerLocation: {
          address: message.text.body,
        },
      });

      await this.updateSessionState(session.id, 'SHARE_CONTACT');
      await this.requestContactInfo(session.phoneNumber);
      return;
    }

    // Tekrar iste
    await this.whatsAppApi.sendButtonMessage({
      to: session.phoneNumber,
      bodyText: 'Teslimat adresinizi paylaşır mısınız?',
      buttons: [
        { id: 'share_location', title: 'Konum Gönder' },
      ],
    });
  }

  /**
   * İletişim bilgisi isteği
   */
  private async requestContactInfo(phoneNumber: string): Promise<void> {
    await this.whatsAppApi.sendTextMessage({
      to: phoneNumber,
      text: 'Adınızı yazın veya kişi kartınızı paylaşın:',
    });
  }

  /**
   * İletişim bilgisi alma
   */
  private async handleShareContact(session: any, message: IncomingMessage): Promise<void> {
    let customerName = session.customerName;

    if (message.type === 'contacts' && message.contacts?.[0]) {
      customerName = message.contacts[0].name.formatted_name;
    } else if (message.type === 'text' && message.text?.body) {
      customerName = message.text.body;
    }

    if (!customerName) {
      await this.whatsAppApi.sendTextMessage({
        to: session.phoneNumber,
        text: 'Lütfen adınızı yazın:',
      });
      return;
    }

    // Session'ı güncelle
    await this.prisma.whatsAppSession.update({
      where: { id: session.id },
      data: {
        customerName,
        state: 'CONFIRM_ORDER',
      },
    });

    // Sipariş özeti gönder
    await this.sendOrderSummary(session);
  }

  /**
   * Sipariş özeti gönder
   */
  private async sendOrderSummary(session: any): Promise<void> {
    const updatedSession = await this.prisma.whatsAppSession.findUnique({
      where: { id: session.id },
      include: { company: true },
    });

    const stateData = updatedSession?.stateData as any || {};
    const location = stateData.customerLocation;

    const summary = `📋 *Sipariş Özeti*
─────────────────
🏪 *Firma:* ${updatedSession?.company?.name || 'Bilinmiyor'}
📝 *Sipariş:* ${stateData.orderContent || 'Belirtilmemiş'}
📍 *Adres:* ${location?.address || 'Belirtilmemiş'}
👤 *Ad:* ${updatedSession?.customerName || 'Belirtilmemiş'}
─────────────────

Siparişinizi onaylıyor musunuz?`;

    await this.whatsAppApi.sendButtonMessage({
      to: session.phoneNumber,
      bodyText: summary,
      buttons: [
        { id: 'confirm', title: 'Gönder' },
        { id: 'cancel', title: 'İptal' },
        { id: 'edit', title: 'Düzenle' },
      ],
    });
  }

  /**
   * Sipariş onayı
   */
  private async handleConfirmOrder(session: any, message: IncomingMessage): Promise<void> {
    if (message.type !== 'interactive' || !message.interactive?.button_reply) {
      await this.sendOrderSummary(session);
      return;
    }

    const buttonId = message.interactive.button_reply.id;

    if (buttonId === 'cancel') {
      // İptal
      await this.resetSession(session.id);
      await this.whatsAppApi.sendTextMessage({
        to: session.phoneNumber,
        text: 'Siparişiniz iptal edildi. Yeni sipariş için "Merhaba" yazabilirsiniz.',
      });
      return;
    }

    if (buttonId === 'edit') {
      // Düzenle
      await this.updateSessionState(session.id, 'ENTER_ORDER');
      await this.whatsAppApi.sendTextMessage({
        to: session.phoneNumber,
        text: 'Siparişinizi tekrar yazın:',
      });
      return;
    }

    if (buttonId === 'confirm') {
      // Siparişi oluştur
      await this.createOrder(session);
    }
  }

  /**
   * Sipariş oluştur
   */
  private async createOrder(session: any): Promise<void> {
    const fullSession = await this.prisma.whatsAppSession.findUnique({
      where: { id: session.id },
      include: { company: true },
    });

    if (!fullSession || !fullSession.companyId) {
      await this.whatsAppApi.sendTextMessage({
        to: session.phoneNumber,
        text: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
      return;
    }

    const stateData = fullSession.stateData as any || {};
    const location = stateData.customerLocation || {};

    // Order oluştur
    const order = await this.prisma.order.create({
      data: {
        orderNumber: await this.generateOrderNumber(),
        companyId: fullSession.companyId,
        recipientName: fullSession.customerName || 'WhatsApp Müşterisi',
        recipientPhone: fullSession.phoneNumber,
        pickupAddress: fullSession.company?.address || {},
        deliveryAddress: {
          lat: location.lat,
          lng: location.lng,
          address: location.address || 'WhatsApp konumu',
        },
        packageType: 'FOOD',
        packageSize: 'MEDIUM',
        price: 0, // Firma belirleyecek
        status: 'PENDING_APPROVAL',
        source: 'WHATSAPP',
        orderContent: stateData.orderContent,
        customerWhatsApp: fullSession.phoneNumber,
        isDispatchedToCouriers: false,
      },
    });

    // Session'ı güncelle
    await this.prisma.whatsAppSession.update({
      where: { id: session.id },
      data: {
        orderId: order.id,
        state: 'WAITING_APPROVAL',
      },
    });

    // Müşteriye bilgi ver
    await this.whatsAppApi.sendTextMessage({
      to: session.phoneNumber,
      text: `✅ Siparişiniz alındı!

Sipariş No: #${order.orderNumber}

${fullSession.company?.name} siparişinizi inceliyor ve fiyat bilgisi gönderecek. Lütfen bekleyin...`,
    });

    // TODO: Firmaya bildirim gönder (WebSocket veya push notification)
    this.logger.log(`WhatsApp siparişi oluşturuldu: ${order.orderNumber}`);
  }

  /**
   * Firma onayı bekleniyor
   */
  private async handleWaitingApproval(session: any, message: IncomingMessage): Promise<void> {
    await this.whatsAppApi.sendTextMessage({
      to: session.phoneNumber,
      text: 'Siparişiniz henüz onay bekliyor. Firma fiyat bilgisi gönderdiğinde size haber vereceğiz.',
    });
  }

  /**
   * Fiyat onayı
   */
  private async handleConfirmPrice(session: any, message: IncomingMessage): Promise<void> {
    if (message.type !== 'interactive' || !message.interactive?.button_reply) {
      return;
    }

    const buttonId = message.interactive.button_reply.id;
    const fullSession = await this.prisma.whatsAppSession.findUnique({
      where: { id: session.id },
      include: { order: true },
    });

    if (!fullSession?.order) return;

    if (buttonId === 'accept') {
      // Siparişi onayla
      await this.prisma.order.update({
        where: { id: fullSession.order.id },
        data: {
          status: 'PENDING',
          price: fullSession.order.approvedPrice || 0,
          isDispatchedToCouriers: true,
        },
      });

      await this.updateSessionState(session.id, 'ORDER_CONFIRMED');

      await this.whatsAppApi.sendTextMessage({
        to: session.phoneNumber,
        text: `🎉 Siparişiniz onaylandı!

Takip No: #${fullSession.order.orderNumber}

Kurye atandığında size bilgi vereceğiz.`,
      });

      // TODO: Kuryelere bildirim gönder
    } else if (buttonId === 'reject') {
      // Siparişi iptal et
      await this.prisma.order.update({
        where: { id: fullSession.order.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'Müşteri fiyatı kabul etmedi',
          cancelledAt: new Date(),
        },
      });

      await this.resetSession(session.id);

      await this.whatsAppApi.sendTextMessage({
        to: session.phoneNumber,
        text: 'Siparişiniz iptal edildi. Yeni sipariş için "Merhaba" yazabilirsiniz.',
      });
    }
  }

  /**
   * Sipariş takibi
   */
  private async handleTracking(session: any, message: IncomingMessage): Promise<void> {
    const fullSession = await this.prisma.whatsAppSession.findUnique({
      where: { id: session.id },
      include: {
        order: {
          include: { courier: true },
        },
      },
    });

    if (!fullSession?.order) {
      await this.whatsAppApi.sendTextMessage({
        to: session.phoneNumber,
        text: 'Takip edilecek sipariş bulunamadı.',
      });
      return;
    }

    const order = fullSession.order;
    let statusText = '';

    switch (order.status) {
      case 'PENDING_APPROVAL':
        statusText = '⏳ Firma onayı bekleniyor';
        break;
      case 'PENDING':
        statusText = '🔍 Kurye aranıyor';
        break;
      case 'ACCEPTED':
        statusText = `✅ Kurye atandı: ${order.courier?.fullName || 'Bilinmiyor'}`;
        break;
      case 'IN_PROGRESS':
        statusText = '🛵 Siparişiniz yolda!';
        break;
      case 'DELIVERED':
        statusText = '✅ Teslim edildi. Afiyet olsun!';
        break;
      case 'CANCELLED':
        statusText = '❌ Sipariş iptal edildi';
        break;
      default:
        statusText = order.status;
    }

    await this.whatsAppApi.sendTextMessage({
      to: session.phoneNumber,
      text: `📦 Sipariş Durumu: #${order.orderNumber}

${statusText}`,
    });
  }

  /**
   * Sipariş takip isteği
   */
  private async handleTrackingRequest(session: any): Promise<void> {
    // Son aktif siparişi bul
    const lastOrder = await this.prisma.order.findFirst({
      where: {
        customerWhatsApp: session.phoneNumber,
        status: {
          in: ['PENDING_APPROVAL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastOrder) {
      await this.whatsAppApi.sendTextMessage({
        to: session.phoneNumber,
        text: 'Aktif siparişiniz bulunmuyor.',
      });
      return;
    }

    // Session'ı bu siparişe bağla
    await this.prisma.whatsAppSession.update({
      where: { id: session.id },
      data: {
        orderId: lastOrder.id,
        state: 'TRACKING',
      },
    });

    await this.handleTracking(session, {} as IncomingMessage);
  }

  // ==================== Dış Çağrılar (Orders Service'den) ====================

  /**
   * Firma siparişi onayladığında çağrılır
   */
  async notifyPriceApproval(orderId: string, price: number, estimatedTime?: number): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { company: true },
    });

    if (!order || !order.customerWhatsApp) return;

    // Config'i al ve API'yi başlat
    await this.initializeApiFromConfig();

    const message = `🎉 *${order.company?.name}* siparişinizi onayladı!

📝 *Sipariş:* ${order.orderContent}
💰 *Toplam:* ${price.toFixed(2)} ₺
${estimatedTime ? `⏱️ *Tahmini Teslimat:* ${estimatedTime} dk` : ''}

Onaylıyor musunuz?`;

    await this.whatsAppApi.sendButtonMessage({
      to: order.customerWhatsApp,
      bodyText: message,
      buttons: [
        { id: 'accept', title: 'Onayla' },
        { id: 'reject', title: 'Vazgeç' },
      ],
    });

    // Session state'i güncelle
    const session = await this.prisma.whatsAppSession.findFirst({
      where: { orderId },
    });

    if (session) {
      await this.updateSessionState(session.id, 'CONFIRM_PRICE');
    }
  }

  /**
   * Kurye atandığında çağrılır
   */
  async notifyCourierAssigned(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { courier: true },
    });

    if (!order || !order.customerWhatsApp || !order.courier) return;

    // Config'i al ve API'yi başlat
    await this.initializeApiFromConfig();

    const message = `🚚 Kuryeniz atandı!

👤 *Kurye:* ${order.courier.fullName}
📞 *Telefon:* ${order.courier.phone}

Siparişiniz en kısa sürede teslim edilecek.`;

    await this.whatsAppApi.sendTextMessage({
      to: order.customerWhatsApp,
      text: message,
    });
  }

  /**
   * Sipariş yola çıktığında çağrılır
   */
  async notifyOrderInProgress(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.customerWhatsApp) return;

    await this.initializeApiFromConfig();

    await this.whatsAppApi.sendTextMessage({
      to: order.customerWhatsApp,
      text: `🛵 Siparişiniz yolda!

Tahmini varış: ${order.estimatedTime || 15}-${(order.estimatedTime || 15) + 10} dakika`,
    });
  }

  /**
   * Sipariş teslim edildiğinde çağrılır
   */
  async notifyOrderDelivered(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.customerWhatsApp) return;

    await this.initializeApiFromConfig();

    await this.whatsAppApi.sendButtonMessage({
      to: order.customerWhatsApp,
      bodyText: `✅ Siparişiniz teslim edildi!

Afiyet olsun! 🍽️

Bizi değerlendirmek ister misiniz?`,
      buttons: [
        { id: 'rate_5', title: '⭐⭐⭐⭐⭐' },
        { id: 'rate_4', title: '⭐⭐⭐⭐' },
        { id: 'rate_3', title: '⭐⭐⭐' },
      ],
    });

    // Session'ı temizle
    const session = await this.prisma.whatsAppSession.findFirst({
      where: { orderId },
    });

    if (session) {
      await this.resetSession(session.id);
    }
  }

  // ==================== Yardımcı Metodlar ====================

  /**
   * Session al veya oluştur
   */
  private async getOrCreateSession(phoneNumber: string, customerName?: string) {
    // Mevcut aktif session'ı bul
    let session = await this.prisma.whatsAppSession.findFirst({
      where: {
        phoneNumber,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!session) {
      // Yeni session oluştur (24 saat geçerli)
      session = await this.prisma.whatsAppSession.create({
        data: {
          phoneNumber,
          customerName,
          state: 'WELCOME',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    return session;
  }

  /**
   * Session state'i güncelle
   */
  private async updateSessionState(sessionId: string, state: WhatsAppFlowState | string): Promise<void> {
    await this.prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { state: state as WhatsAppFlowState },
    });
  }

  /**
   * Session data'yı güncelle
   */
  private async updateSessionData(sessionId: string, data: any): Promise<void> {
    const session = await this.prisma.whatsAppSession.findUnique({
      where: { id: sessionId },
    });

    await this.prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: {
        stateData: {
          ...(session?.stateData as object || {}),
          ...data,
        },
      },
    });
  }

  /**
   * Session aktivitesini güncelle
   */
  private async updateSessionActivity(sessionId: string): Promise<void> {
    await this.prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: {
        lastMessageAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  /**
   * Session'ı sıfırla
   */
  private async resetSession(sessionId: string): Promise<void> {
    await this.prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: {
        state: 'WELCOME',
        stateData: Prisma.JsonNull,
        companyId: null,
        orderId: null,
      },
    });
  }

  /**
   * Sipariş numarası oluştur
   */
  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const count = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    });

    return `WA-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Firma adresini formatla
   */
  private getCompanyAddress(address: any): string {
    if (!address) return '';
    if (typeof address === 'string') return address.substring(0, 72);

    const parts = [address.district, address.city].filter(Boolean);
    return parts.join(', ').substring(0, 72);
  }

  /**
   * Config'den API'yi başlat
   */
  private async initializeApiFromConfig(): Promise<void> {
    const config = await this.prisma.whatsAppConfig.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      throw new Error('WhatsApp config bulunamadı');
    }

    // Token'ı çöz (basit implementasyon)
    const key = process.env.JWT_SECRET || 'default-secret';
    const crypto = require('crypto');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      crypto.scryptSync(key, 'salt', 32),
      Buffer.alloc(16, 0),
    );
    let decrypted = decipher.update(config.accessToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    this.whatsAppApi.initializeClient(config.phoneNumberId, decrypted);
  }

  /**
   * Hata mesajı gönder
   */
  private async sendErrorMessage(phoneNumber: string): Promise<void> {
    try {
      await this.initializeApiFromConfig();
      await this.whatsAppApi.sendTextMessage({
        to: phoneNumber,
        text: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin veya "Merhaba" yazarak yeniden başlayın.',
      });
    } catch (error) {
      this.logger.error(`Hata mesajı gönderilemedi: ${error.message}`);
    }
  }

  /**
   * Button mesajı gönder (yardımcı)
   */
  private async sendButtonMessage(to: string, dto: Omit<SendButtonMessageDto, 'to'>): Promise<void> {
    await this.whatsAppApi.sendButtonMessage({ to, ...dto });
  }
}
