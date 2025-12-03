import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConnectionMethod {
  MANUAL = 'MANUAL',
  EMBEDDED_SIGNUP = 'EMBEDDED_SIGNUP',
}

// Manuel kurulum için DTO
export class ManualSetupDto {
  @ApiProperty({ description: 'WhatsApp Business Phone Number ID' })
  @IsString()
  phoneNumberId: string;

  @ApiProperty({ description: 'WhatsApp Business Account ID' })
  @IsString()
  businessAccountId: string;

  @ApiProperty({ description: 'Permanent Access Token' })
  @IsString()
  accessToken: string;

  @ApiPropertyOptional({ description: 'Webhook Verify Token (opsiyonel - otomatik oluşturulur)' })
  @IsString()
  @IsOptional()
  webhookVerifyToken?: string;
}

// Embedded Signup OAuth callback için DTO
export class OAuthCallbackDto {
  @ApiProperty({ description: 'OAuth authorization code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'State parameter for CSRF protection' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'WhatsApp Business Account ID (Embedded Signup\'tan)' })
  @IsString()
  @IsOptional()
  waba_id?: string;

  @ApiPropertyOptional({ description: 'Phone Number ID (Embedded Signup\'tan)' })
  @IsString()
  @IsOptional()
  phone_number_id?: string;

  @ApiPropertyOptional({ description: 'Access Token (Embedded Signup\'tan)' })
  @IsString()
  @IsOptional()
  access_token?: string;
}

// WhatsApp ayarlarını güncelleme için DTO
export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: 'Hoş geldin mesajı' })
  @IsString()
  @IsOptional()
  welcomeMessage?: string;

  @ApiPropertyOptional({ description: 'Mesai dışı otomatik yanıt mesajı' })
  @IsString()
  @IsOptional()
  offHoursMessage?: string;

  @ApiPropertyOptional({ description: 'Sipariş onay bildirimi gönder' })
  @IsBoolean()
  @IsOptional()
  notifyOnOrderApproval?: boolean;

  @ApiPropertyOptional({ description: 'Kurye atama bildirimi gönder' })
  @IsBoolean()
  @IsOptional()
  notifyOnCourierAssign?: boolean;

  @ApiPropertyOptional({ description: 'Teslimat bildirimi gönder' })
  @IsBoolean()
  @IsOptional()
  notifyOnDelivery?: boolean;

  @ApiPropertyOptional({ description: 'WhatsApp entegrasyonu aktif mi' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// Config response DTO
export class WhatsAppConfigResponseDto {
  id: string;
  connectionMethod: ConnectionMethod;
  phoneNumberId: string;
  businessAccountId: string;
  isActive: boolean;
  isVerified: boolean;
  welcomeMessage: string;
  offHoursMessage: string | null;
  notifyOnOrderApproval: boolean;
  notifyOnCourierAssign: boolean;
  notifyOnDelivery: boolean;
  connectedAt: Date;
  lastTestedAt: Date | null;
  webhookUrl: string;
}

// Test bağlantı response DTO
export class TestConnectionResponseDto {
  success: boolean;
  message: string;
  phoneNumber?: string;
  businessName?: string;
  error?: string;
}

// WhatsApp istatistikleri DTO
export class WhatsAppStatisticsDto {
  // Bugün
  todayMessages: number;
  todayOrders: number;
  todayConversionRate: number;

  // Bu hafta
  weekMessages: number;
  weekOrders: number;
  weekConversionRate: number;

  // Bu ay
  monthMessages: number;
  monthOrders: number;
  monthConversionRate: number;

  // Aktif oturumlar
  activeSessions: number;

  // Son 30 gün grafik verisi
  dailyStats: {
    date: string;
    messages: number;
    orders: number;
  }[];
}

// Sipariş onaylama DTO
export class ApproveOrderDto {
  @ApiProperty({ description: 'Firma tarafından belirlenen fiyat' })
  price: number;

  @ApiPropertyOptional({ description: 'Tahmini teslimat süresi (dakika)' })
  @IsOptional()
  estimatedDeliveryTime?: number;

  @ApiPropertyOptional({ description: 'Firma notları' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// Sipariş reddetme DTO
export class RejectOrderDto {
  @ApiProperty({ description: 'Red sebebi' })
  @IsString()
  reason: string;
}

// Session listesi için response DTO
export class WhatsAppSessionDto {
  id: string;
  phoneNumber: string;
  customerName: string | null;
  state: string;
  companyName: string | null;
  orderNumber: string | null;
  lastMessageAt: Date;
  createdAt: Date;
  expiresAt: Date;
}
