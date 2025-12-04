import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEmail,
  IsNumber,
  ValidateNested,
  Min,
  Max,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PickupAddressDto {
  @ApiProperty({ description: 'Enlem koordinatı' })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Boylam koordinatı' })
  @IsNumber()
  lng: number;

  @ApiPropertyOptional({ description: 'Adres metni' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Adres detayı' })
  @IsOptional()
  @IsString()
  detail?: string;
}

export class UpsertTrendyolGoVendorDto {
  @ApiProperty({ description: 'Trendyol Satıcı ID (supplierId)' })
  @IsString()
  supplierId: string;

  @ApiPropertyOptional({ description: 'Şube ID (storeId)' })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty({ description: 'API Key' })
  @IsString()
  apiKey: string;

  @ApiProperty({ description: 'API Secret Key' })
  @IsString()
  apiSecret: string;

  @ApiPropertyOptional({
    description: 'Entegratör adı (User-Agent header için)',
    default: 'SelfIntegration',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Agent adı sadece alfanumerik karakterler içerebilir',
  })
  agentName?: string;

  @ApiPropertyOptional({ description: 'İşlem yapan kullanıcı e-postası' })
  @IsOptional()
  @IsEmail()
  executorEmail?: string;

  @ApiProperty({ description: 'Entegrasyon aktif mi?' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Otomatik kurye ataması yapılsın mı?',
    default: true,
  })
  @IsBoolean()
  autoCourierDispatch: boolean;

  @ApiPropertyOptional({
    description: 'Polling aralığı (saniye)',
    default: 60,
    minimum: 30,
    maximum: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  pollingIntervalSec?: number;

  @ApiPropertyOptional({ description: 'Pickup (teslim başlangıç) adresi' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PickupAddressDto)
  pickupAddress?: PickupAddressDto;
}
