import { IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePricingRuleDto {
  @ApiProperty({ description: 'Fiyatlandırma kuralı adı' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Açıklama', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Taban fiyat (TL)' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  basePrice: number;

  @ApiProperty({ description: 'Km başı fiyat (TL)' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  pricePerKm: number;

  @ApiProperty({ description: 'Dakika başı fiyat (TL)' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  pricePerMinute: number;

  @ApiProperty({ description: 'Minimum fiyat (TL)' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  minimumPrice: number;

  @ApiProperty({ description: 'Yoğun saat çarpanı', required: false })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rushHourMultiplier?: number;

  @ApiProperty({ description: 'Hava durumu çarpanı', required: false })
  @IsNumber()
  @Min(1)
  @Max(3)
  @IsOptional()
  weatherMultiplier?: number;

  @ApiProperty({ description: 'Aktif durumu', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}