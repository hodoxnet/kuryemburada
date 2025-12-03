import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  SendTextMessageDto,
  SendButtonMessageDto,
  SendListMessageDto,
  SendLocationRequestDto,
  SendLocationMessageDto,
  SendTemplateMessageDto,
  WhatsAppApiTextMessage,
  WhatsAppApiInteractiveMessage,
  WhatsAppApiLocationMessage,
  WhatsAppApiTemplateMessage,
  WhatsAppApiResponse,
  WhatsAppApiError,
} from './dto';

@Injectable()
export class WhatsAppApiService {
  private readonly logger = new Logger(WhatsAppApiService.name);
  private axiosInstance: AxiosInstance;
  private apiVersion: string;

  constructor(private configService: ConfigService) {
    this.apiVersion = this.configService.get<string>('WHATSAPP_API_VERSION', 'v18.0');
  }

  /**
   * API client'ı belirli bir config ile başlat
   */
  initializeClient(phoneNumberId: string, accessToken: string): void {
    this.axiosInstance = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}/${phoneNumberId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Text mesajı gönder
   */
  async sendTextMessage(dto: SendTextMessageDto): Promise<WhatsAppApiResponse> {
    const payload: WhatsAppApiTextMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: dto.to,
      type: 'text',
      text: {
        preview_url: dto.previewUrl || false,
        body: dto.text,
      },
    };

    return this.sendMessage(payload);
  }

  /**
   * Butonlu interaktif mesaj gönder (max 3 buton)
   */
  async sendButtonMessage(dto: SendButtonMessageDto): Promise<WhatsAppApiResponse> {
    const payload: WhatsAppApiInteractiveMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: dto.to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: dto.bodyText,
        },
        action: {
          buttons: dto.buttons.slice(0, 3).map((btn) => ({
            type: 'reply' as const,
            reply: {
              id: btn.id,
              title: btn.title.substring(0, 20), // Max 20 karakter
            },
          })),
        },
      },
    };

    // Header ekle (opsiyonel)
    if (dto.headerText) {
      payload.interactive.header = {
        type: 'text',
        text: dto.headerText,
      };
    }

    // Footer ekle (opsiyonel)
    if (dto.footerText) {
      payload.interactive.footer = {
        text: dto.footerText,
      };
    }

    return this.sendMessage(payload);
  }

  /**
   * Liste mesajı gönder (max 10 section, her section max 10 row)
   */
  async sendListMessage(dto: SendListMessageDto): Promise<WhatsAppApiResponse> {
    const payload: WhatsAppApiInteractiveMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: dto.to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: {
          text: dto.bodyText,
        },
        action: {
          button: dto.buttonText.substring(0, 20), // Max 20 karakter
          sections: dto.sections.slice(0, 10).map((section) => ({
            title: section.title?.substring(0, 24), // Max 24 karakter
            rows: section.rows.slice(0, 10).map((row) => ({
              id: row.id,
              title: row.title.substring(0, 24), // Max 24 karakter
              description: row.description?.substring(0, 72), // Max 72 karakter
            })),
          })),
        },
      },
    };

    // Header ekle (opsiyonel)
    if (dto.headerText) {
      payload.interactive.header = {
        type: 'text',
        text: dto.headerText,
      };
    }

    // Footer ekle (opsiyonel)
    if (dto.footerText) {
      payload.interactive.footer = {
        text: dto.footerText,
      };
    }

    return this.sendMessage(payload);
  }

  /**
   * Konum isteği mesajı gönder
   */
  async sendLocationRequest(dto: SendLocationRequestDto): Promise<WhatsAppApiResponse> {
    const payload: WhatsAppApiInteractiveMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: dto.to,
      type: 'interactive',
      interactive: {
        type: 'location_request_message',
        body: {
          text: dto.bodyText,
        },
        action: {
          name: 'send_location',
        },
      },
    };

    return this.sendMessage(payload);
  }

  /**
   * Konum mesajı gönder
   */
  async sendLocationMessage(dto: SendLocationMessageDto): Promise<WhatsAppApiResponse> {
    const payload: WhatsAppApiLocationMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: dto.to,
      type: 'location',
      location: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        name: dto.name,
        address: dto.address,
      },
    };

    return this.sendMessage(payload);
  }

  /**
   * Template mesajı gönder
   */
  async sendTemplateMessage(dto: SendTemplateMessageDto): Promise<WhatsAppApiResponse> {
    const payload: WhatsAppApiTemplateMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: dto.to,
      type: 'template',
      template: {
        name: dto.templateName,
        language: {
          code: dto.languageCode,
        },
        components: dto.components,
      },
    };

    return this.sendMessage(payload);
  }

  /**
   * Genel mesaj gönderme metodu
   */
  private async sendMessage(payload: any): Promise<WhatsAppApiResponse> {
    try {
      if (!this.axiosInstance) {
        throw new Error('WhatsApp API client başlatılmamış. initializeClient() çağırın.');
      }

      this.logger.debug(`Mesaj gönderiliyor: ${payload.to}`);

      const response = await this.axiosInstance.post('/messages', payload);

      this.logger.debug(`Mesaj gönderildi: ${JSON.stringify(response.data)}`);

      return response.data as WhatsAppApiResponse;
    } catch (error) {
      this.logger.error(`Mesaj gönderme hatası: ${error.message}`);

      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as WhatsAppApiError;
        this.logger.error(`WhatsApp API hatası: ${JSON.stringify(errorData)}`);
        throw new Error(errorData.error?.message || 'WhatsApp API hatası');
      }

      throw error;
    }
  }

  /**
   * Mesaj durumunu "read" olarak işaretle
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      if (!this.axiosInstance) {
        throw new Error('WhatsApp API client başlatılmamış.');
      }

      await this.axiosInstance.post('/messages', {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      });

      this.logger.debug(`Mesaj okundu olarak işaretlendi: ${messageId}`);
    } catch (error) {
      this.logger.error(`Mesaj okundu işaretleme hatası: ${error.message}`);
      // Hata fırlatma - bu kritik değil
    }
  }

  /**
   * WhatsApp Business hesap bilgilerini al
   */
  async getBusinessProfile(accessToken: string, phoneNumberId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/${phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: 'verified_name,display_phone_number,quality_rating',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Business profil bilgisi alınamadı: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bağlantıyı test et
   */
  async testConnection(accessToken: string, phoneNumberId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const profile = await this.getBusinessProfile(accessToken, phoneNumberId);

      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * OAuth token exchange (Embedded Signup için)
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in?: number;
  }> {
    try {
      const appId = this.configService.get<string>('META_APP_ID');
      const appSecret = this.configService.get<string>('META_APP_SECRET');

      this.logger.log(`Token exchange başlatılıyor - App ID: ${appId}`);

      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/oauth/access_token`,
        {
          params: {
            client_id: appId,
            client_secret: appSecret,
            code: code,
          },
        },
      );

      this.logger.log(`Token exchange başarılı`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(`Token exchange hatası - Status: ${error.response.status}`);
        this.logger.error(`Token exchange hatası - Data: ${JSON.stringify(error.response.data)}`);
        throw new Error(`Token exchange başarısız: ${JSON.stringify(error.response.data)}`);
      }
      this.logger.error(`Token exchange hatası: ${error.message}`);
      throw new Error('Token exchange başarısız');
    }
  }

  /**
   * WhatsApp Business Account bilgilerini al (Embedded Signup sonrası)
   */
  async getWhatsAppBusinessAccounts(accessToken: string): Promise<any> {
    try {
      // Debug token ile token bilgilerini al
      const appId = this.configService.get<string>('META_APP_ID');
      const appSecret = this.configService.get<string>('META_APP_SECRET');

      this.logger.log('Debug token ile bilgi alınıyor...');

      const debugResponse = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/debug_token`,
        {
          params: {
            input_token: accessToken,
            access_token: `${appId}|${appSecret}`,
          },
        },
      );

      this.logger.log(`Debug token response: ${JSON.stringify(debugResponse.data)}`);

      // Shared WABA bilgilerini al
      const wabaResponse = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: 'id,name',
          },
        },
      );

      this.logger.log(`Me response: ${JSON.stringify(wabaResponse.data)}`);

      // Granular scopes'tan WABA ID'yi bul
      const granularScopes = debugResponse.data?.data?.granular_scopes || [];
      const wabaScope = granularScopes.find((s: any) => s.scope === 'whatsapp_business_management');

      if (wabaScope && wabaScope.target_ids && wabaScope.target_ids.length > 0) {
        return {
          data: wabaScope.target_ids.map((id: string) => ({ id })),
        };
      }

      // Alternatif: Shared WhatsApp Business Accounts
      try {
        const sharedWabaResponse = await axios.get(
          `https://graph.facebook.com/${this.apiVersion}/me/whatsapp_business_accounts`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        this.logger.log(`Shared WABA response: ${JSON.stringify(sharedWabaResponse.data)}`);
        return sharedWabaResponse.data;
      } catch (sharedError) {
        this.logger.warn(`Shared WABA endpoint hatası: ${sharedError.message}`);
      }

      return { data: [] };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(`Business accounts hatası - Status: ${error.response.status}`);
        this.logger.error(`Business accounts hatası - Data: ${JSON.stringify(error.response.data)}`);
      }
      this.logger.error(`Business accounts alınamadı: ${error.message}`);
      throw error;
    }
  }

  /**
   * WhatsApp Phone Numbers listesini al
   */
  async getPhoneNumbers(accessToken: string, businessAccountId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/${this.apiVersion}/${businessAccountId}/phone_numbers`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Phone numbers alınamadı: ${error.message}`);
      throw error;
    }
  }

  /**
   * Webhook'u kaydet (Embedded Signup sonrası)
   */
  async subscribeToWebhook(accessToken: string, businessAccountId: string): Promise<void> {
    try {
      await axios.post(
        `https://graph.facebook.com/${this.apiVersion}/${businessAccountId}/subscribed_apps`,
        null,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      this.logger.log(`Webhook subscription başarılı: ${businessAccountId}`);
    } catch (error) {
      this.logger.error(`Webhook subscription hatası: ${error.message}`);
      throw error;
    }
  }
}
