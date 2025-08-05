import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SystemSettingDto {
  @ApiProperty({
    description: 'Ayar anahtarı',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Ayar değeri',
  })
  value: any;

  @ApiPropertyOptional({
    description: 'Ayar açıklaması',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Ayar kategorisi',
  })
  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateSystemSettingDto {
  @ApiProperty({
    description: 'Ayar değeri',
  })
  value: any;

  @ApiPropertyOptional({
    description: 'Ayar açıklaması',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class SystemSettingsDto {
  @ApiPropertyOptional({
    description: 'Komisyon oranı (%)',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @ApiPropertyOptional({
    description: 'Maksimum sipariş mesafesi (km)',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  maxOrderDistance?: number;

  @ApiPropertyOptional({
    description: 'Sipariş timeout süresi (dakika)',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  orderTimeout?: number;

  @ApiPropertyOptional({
    description: 'Kurye kabul süresi (dakika)',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  courierAcceptanceTime?: number;

  @ApiPropertyOptional({
    description: 'Otomatik atama aktif mi?',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  autoAssignment?: boolean;

  @ApiPropertyOptional({
    description: 'SMS bildirimleri aktif mi?',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional({
    description: 'Email bildirimleri aktif mi?',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({
    description: 'Push bildirimleri aktif mi?',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({
    description: 'Bakım modu aktif mi?',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiPropertyOptional({
    description: 'Bakım modu mesajı',
  })
  @IsOptional()
  @IsString()
  maintenanceMessage?: string;
}
