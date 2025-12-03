import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WhatsAppWebhookGuard implements CanActivate {
  private readonly logger = new Logger(WhatsAppWebhookGuard.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // GET request - Webhook doğrulama (hub.challenge)
    if (request.method === 'GET') {
      return this.verifyWebhook(request);
    }

    // POST request - Gelen mesaj/status webhook
    if (request.method === 'POST') {
      return this.verifySignature(request);
    }

    return false;
  }

  /**
   * Webhook doğrulama (Meta tarafından yapılır)
   * GET /whatsapp/webhook?hub.mode=subscribe&hub.challenge=xxx&hub.verify_token=xxx
   */
  private async verifyWebhook(request: any): Promise<boolean> {
    const mode = request.query['hub.mode'];
    const token = request.query['hub.verify_token'];
    const challenge = request.query['hub.challenge'];

    this.logger.debug(`Webhook doğrulama: mode=${mode}, token=${token ? '***' : 'yok'}`);

    if (mode !== 'subscribe') {
      this.logger.warn('Geçersiz hub.mode');
      throw new UnauthorizedException('Geçersiz mode');
    }

    // Veritabanından WhatsApp config'i al
    const config = await this.prisma.whatsAppConfig.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      // Config yoksa env'den kontrol et
      const envToken = this.configService.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN');
      if (token === envToken) {
        // Challenge'ı response'a ekle
        request.whatsappChallenge = challenge;
        return true;
      }

      this.logger.warn('WhatsApp config bulunamadı ve env token eşleşmedi');
      throw new UnauthorizedException('Geçersiz verify token');
    }

    if (token !== config.webhookVerifyToken) {
      this.logger.warn('Verify token eşleşmedi');
      throw new UnauthorizedException('Geçersiz verify token');
    }

    // Challenge'ı response'a ekle
    request.whatsappChallenge = challenge;
    return true;
  }

  /**
   * POST request signature doğrulama (HMAC SHA-256)
   */
  private async verifySignature(request: any): Promise<boolean> {
    const signature = request.headers['x-hub-signature-256'];

    if (!signature) {
      this.logger.warn('X-Hub-Signature-256 header bulunamadı');
      // Development modda signature kontrolünü atla
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.warn('Development modda signature kontrolü atlanıyor');
        return true;
      }
      throw new UnauthorizedException('Signature header eksik');
    }

    // App Secret'ı al
    const appSecret = this.configService.get<string>('META_APP_SECRET');
    if (!appSecret) {
      this.logger.error('META_APP_SECRET tanımlı değil');
      throw new UnauthorizedException('Server configuration error');
    }

    // Request body'yi al
    const rawBody = request.rawBody || JSON.stringify(request.body);

    // HMAC hesapla
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');

    // Signature karşılaştır (timing-safe)
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      this.logger.warn('Signature uzunluğu eşleşmedi');
      throw new UnauthorizedException('Geçersiz signature');
    }

    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      this.logger.warn('Signature eşleşmedi');
      throw new UnauthorizedException('Geçersiz signature');
    }

    this.logger.debug('Webhook signature doğrulandı');
    return true;
  }
}
