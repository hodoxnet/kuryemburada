import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsDateString, IsObject, ValidateNested, IsPhoneNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PackageType, PackageSize, DeliveryType, Urgency } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AddressDto {
  @ApiProperty({ description: 'Enlem koordinatı' })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Boylam koordinatı' })
  @IsNumber()
  lng: number;

  @ApiProperty({ description: 'Adres metni' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ description: 'Adres detayı (kapı no, kat vb.)' })
  @IsString()
  @IsOptional()
  detail?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Alıcı adı soyadı' })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({ description: 'Alıcı telefon numarası' })
  @IsString()
  @IsNotEmpty()
  recipientPhone: string;

  @ApiProperty({ description: 'Alım adresi', type: AddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  pickupAddress: AddressDto;

  @ApiProperty({ description: 'Teslimat adresi', type: AddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  deliveryAddress: AddressDto;

  @ApiProperty({ 
    description: 'Paket tipi',
    enum: PackageType,
    example: PackageType.PACKAGE 
  })
  @IsEnum(PackageType)
  packageType: PackageType;

  @ApiProperty({ 
    description: 'Paket boyutu',
    enum: PackageSize,
    example: PackageSize.MEDIUM 
  })
  @IsEnum(PackageSize)
  packageSize: PackageSize;

  @ApiProperty({ 
    description: 'Teslimat tipi',
    enum: DeliveryType,
    example: DeliveryType.STANDARD,
    default: DeliveryType.STANDARD
  })
  @IsEnum(DeliveryType)
  @IsOptional()
  deliveryType: DeliveryType = DeliveryType.STANDARD;

  @ApiPropertyOptional({ 
    description: 'Aciliyet durumu',
    enum: Urgency,
    example: Urgency.NORMAL,
    default: Urgency.NORMAL
  })
  @IsEnum(Urgency)
  @IsOptional()
  urgency?: Urgency;

  @ApiPropertyOptional({ 
    description: 'Planlı teslimat zamanı',
    example: '2025-08-12T10:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  scheduledPickupTime?: string;

  @ApiPropertyOptional({ description: 'Ek notlar' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Mesafe (km) - Google Maps API entegrasyonu sonrası otomatik hesaplanacak',
    minimum: 0.1
  })
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  distance?: number;

  @ApiPropertyOptional({ 
    description: 'Tahmini teslimat süresi (dakika) - Google Maps API tarafından hesaplanacak',
    minimum: 1
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  estimatedTime?: number;
}