import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppWebhookGuard } from './guards/whatsapp-webhook.guard';
import {
  ManualSetupDto,
  OAuthCallbackDto,
  UpdateSettingsDto,
  ApproveOrderDto,
  RejectOrderDto,
  WebhookVerifyQuery,
} from './dto';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(private readonly whatsappService: WhatsAppService) {}

  // ==================== Webhook Endpoints ====================

  /**
   * Meta Webhook doğrulama endpoint'i (hub.challenge)
   * Meta bu endpoint'e GET isteği yaparak webhook'u doğrular
   */
  @Get('webhook')
  @UseGuards(WhatsAppWebhookGuard)
  @ApiOperation({ summary: 'WhatsApp webhook doğrulama (Meta tarafından çağrılır)' })
  @ApiResponse({ status: 200, description: 'Challenge string döndürülür' })
  @ApiResponse({ status: 401, description: 'Doğrulama başarısız' })
  verifyWebhook(@Req() request: Request, @Res() response: Response) {
    // Guard'da doğrulama yapıldı, challenge'ı döndür
    const challenge = (request as any).whatsappChallenge;
    this.logger.log(`Webhook doğrulama başarılı, challenge: ${challenge}`);
    return response.status(200).send(challenge);
  }

  /**
   * Meta Webhook mesaj endpoint'i
   * Gelen mesajlar ve status güncellemeleri bu endpoint'e POST edilir
   */
  @Post('webhook')
  @UseGuards(WhatsAppWebhookGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'WhatsApp webhook mesajları (Meta tarafından çağrılır)' })
  @ApiResponse({ status: 200, description: 'Webhook işlendi' })
  async handleWebhook(@Body() body: any) {
    this.logger.debug(`Webhook alındı: ${JSON.stringify(body)}`);

    // Meta webhook'u hemen 200 bekler, işlemi async yapıyoruz
    // Aksi halde timeout olabilir ve Meta tekrar gönderir
    setImmediate(async () => {
      try {
        await this.whatsappService.processWebhook(body);
      } catch (error) {
        this.logger.error(`Webhook işleme hatası: ${error.message}`, error.stack);
      }
    });

    return { status: 'ok' };
  }

  // ==================== Admin Endpoints ====================

  /**
   * Mevcut WhatsApp konfigürasyonunu getir
   */
  @Get('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'WhatsApp konfigürasyonunu getir' })
  @ApiResponse({ status: 200, description: 'Konfigürasyon bilgileri' })
  async getConfig() {
    return this.whatsappService.getConfig();
  }

  /**
   * Manuel kurulum - API bilgilerini kaydet
   */
  @Post('config/manual')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'WhatsApp manuel kurulum' })
  @ApiResponse({ status: 201, description: 'Kurulum başarılı' })
  @ApiResponse({ status: 400, description: 'Geçersiz bilgiler' })
  async manualSetup(@Body() dto: ManualSetupDto) {
    return this.whatsappService.manualSetup(dto);
  }

  /**
   * Embedded Signup OAuth callback
   */
  @Post('oauth/callback')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'WhatsApp Embedded Signup OAuth callback' })
  @ApiResponse({ status: 201, description: 'Bağlantı başarılı' })
  @ApiResponse({ status: 400, description: 'OAuth hatası' })
  async oauthCallback(@Body() dto: OAuthCallbackDto) {
    return this.whatsappService.handleOAuthCallback(dto);
  }

  /**
   * Bağlantıyı test et
   */
  @Post('config/test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'WhatsApp bağlantısını test et' })
  @ApiResponse({ status: 200, description: 'Test sonucu' })
  async testConnection() {
    return this.whatsappService.testConnection();
  }

  /**
   * Ayarları güncelle
   */
  @Put('config/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'WhatsApp ayarlarını güncelle' })
  @ApiResponse({ status: 200, description: 'Ayarlar güncellendi' })
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.whatsappService.updateSettings(dto);
  }

  /**
   * Bağlantıyı kes
   */
  @Delete('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'WhatsApp bağlantısını kes' })
  @ApiResponse({ status: 200, description: 'Bağlantı kesildi' })
  async disconnectConfig() {
    return this.whatsappService.disconnect();
  }

  /**
   * İstatistikleri getir
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'WhatsApp istatistiklerini getir' })
  @ApiResponse({ status: 200, description: 'İstatistikler' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month'] })
  async getStatistics(@Query('period') period?: 'today' | 'week' | 'month') {
    return this.whatsappService.getStatistics(period || 'today');
  }

  /**
   * Aktif oturumları listele
   */
  @Get('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktif WhatsApp oturumlarını listele' })
  @ApiResponse({ status: 200, description: 'Oturum listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSessions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.whatsappService.getSessions(page || 1, limit || 20);
  }

  /**
   * Belirli bir oturumu getir
   */
  @Get('sessions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'WhatsApp oturumu detayı' })
  @ApiResponse({ status: 200, description: 'Oturum detayı' })
  @ApiResponse({ status: 404, description: 'Oturum bulunamadı' })
  async getSession(@Param('id') id: string) {
    return this.whatsappService.getSession(id);
  }

  // ==================== Company Endpoints ====================

  /**
   * WhatsApp siparişlerini listele (Firma için)
   * PENDING_APPROVAL durumundaki siparişleri getirir
   */
  @Get('orders/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Onay bekleyen WhatsApp siparişlerini listele' })
  @ApiResponse({ status: 200, description: 'Sipariş listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPendingOrders(
    @Req() request: Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const user = (request as any).user;
    return this.whatsappService.getPendingApprovalOrders(
      user.companyId,
      page || 1,
      limit || 20,
    );
  }

  /**
   * Siparişi onayla (Fiyat belirle)
   */
  @Post('orders/:orderId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'WhatsApp siparişini onayla ve fiyat belirle' })
  @ApiResponse({ status: 200, description: 'Sipariş onaylandı' })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  @ApiResponse({ status: 400, description: 'Sipariş onaylanamaz durumda' })
  async approveOrder(
    @Param('orderId') orderId: string,
    @Body() dto: ApproveOrderDto,
    @Req() request: Request,
  ) {
    const user = (request as any).user;
    return this.whatsappService.approveOrder(orderId, user.companyId, dto);
  }

  /**
   * Siparişi reddet
   */
  @Post('orders/:orderId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'WhatsApp siparişini reddet' })
  @ApiResponse({ status: 200, description: 'Sipariş reddedildi' })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  @ApiResponse({ status: 400, description: 'Sipariş reddedilemez durumda' })
  async rejectOrder(
    @Param('orderId') orderId: string,
    @Body() dto: RejectOrderDto,
    @Req() request: Request,
  ) {
    const user = (request as any).user;
    return this.whatsappService.rejectOrder(orderId, user.companyId, dto);
  }

  // ==================== Test Endpoints (Development Only) ====================

  /**
   * Test mesajı gönder (Development mode)
   */
  @Post('test/send-message')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test mesajı gönder (Development)' })
  @ApiResponse({ status: 200, description: 'Mesaj gönderildi' })
  async sendTestMessage(
    @Body() body: { phoneNumber: string; message: string },
  ) {
    return this.whatsappService.sendTestMessage(body.phoneNumber, body.message);
  }
}
