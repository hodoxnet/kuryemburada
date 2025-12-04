import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { TrendyolGoService } from './trendyolgo.service';
import { TrendyolGoPollingService } from './trendyolgo-polling.service';
import { TrendyolGoHttpService } from './trendyolgo-http.service';

@ApiTags('Trendyol Go')
@Controller('trendyolgo')
export class TrendyolGoController {
  constructor(
    private readonly trendyolGoService: TrendyolGoService,
    private readonly pollingService: TrendyolGoPollingService,
    private readonly httpService: TrendyolGoHttpService,
  ) {}

  @Post('sync/:vendorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manuel senkronizasyon tetikle' })
  @ApiResponse({ status: 200, description: 'Senkronizasyon başarılı' })
  @ApiResponse({ status: 403, description: 'Bu entegrasyona erişim yetkiniz yok' })
  async manualSync(
    @Request() req,
    @Param('vendorId') vendorId: string,
  ) {
    // Vendor sahiplik kontrolü
    await this.trendyolGoService.validateVendorOwnership(
      vendorId,
      req.user.id,
      req.user.role,
    );
    return this.trendyolGoService.manualSync(vendorId);
  }

  @Post('poll/:vendorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manuel polling tetikle' })
  @ApiResponse({ status: 200, description: 'Polling başarılı' })
  @ApiResponse({ status: 403, description: 'Bu entegrasyona erişim yetkiniz yok' })
  async triggerPoll(
    @Request() req,
    @Param('vendorId') vendorId: string,
  ) {
    // Vendor sahiplik kontrolü
    await this.trendyolGoService.validateVendorOwnership(
      vendorId,
      req.user.id,
      req.user.role,
    );
    return this.pollingService.triggerPollForVendor(vendorId);
  }

  @Get('packages/:vendorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trendyol Go paketlerini listele (debug)' })
  @ApiResponse({ status: 200, description: 'Paket listesi' })
  @ApiResponse({ status: 403, description: 'Bu entegrasyona erişim yetkiniz yok' })
  async getPackages(
    @Request() req,
    @Param('vendorId') vendorId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    // Vendor sahiplik kontrolü
    await this.trendyolGoService.validateVendorOwnership(
      vendorId,
      req.user.id,
      req.user.role,
    );

    const statusArray = status ? status.split(',') : undefined;

    return this.httpService.getPackages(vendorId, {
      status: statusArray,
      page: page ? parseInt(page) : undefined,
      size: size ? parseInt(size) : 20,
      sortDirection: 'DESC',
    });
  }

  @Get('invoice-amount/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invoice amount aralığını getir' })
  @ApiResponse({ status: 200, description: 'Min/max invoice amount' })
  @ApiResponse({ status: 403, description: 'Bu siparişe erişim yetkiniz yok' })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  async getInvoiceAmountRange(
    @Request() req,
    @Param('orderId') orderId: string,
  ) {
    return this.trendyolGoService.getInvoiceAmountRange(
      orderId,
      req.user.id,
      req.user.role,
    );
  }

  @Put('invoiced/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sipariş hazırlandı (Invoiced) bildirimi gönder' })
  @ApiResponse({ status: 200, description: 'Invoiced bildirimi gönderildi' })
  @ApiResponse({ status: 403, description: 'Bu siparişe erişim yetkiniz yok' })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  async sendInvoicedStatus(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body()
    body: {
      invoiceAmount: number;
      bagCount?: number;
      receiptLink?: string;
      invoiceTaxAmount?: number;
    },
  ) {
    await this.trendyolGoService.sendInvoicedStatus(
      orderId,
      body,
      req.user.id,
      req.user.role,
    );
    return { success: true, message: 'Invoiced bildirimi gönderildi' };
  }

  @Get('test-connection/:vendorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trendyol Go bağlantısını test et' })
  @ApiResponse({ status: 200, description: 'Bağlantı test sonucu' })
  @ApiResponse({ status: 403, description: 'Bu entegrasyona erişim yetkiniz yok' })
  async testConnection(
    @Request() req,
    @Param('vendorId') vendorId: string,
  ) {
    // Vendor sahiplik kontrolü
    await this.trendyolGoService.validateVendorOwnership(
      vendorId,
      req.user.id,
      req.user.role,
    );
    return this.httpService.testConnection(vendorId);
  }
}
