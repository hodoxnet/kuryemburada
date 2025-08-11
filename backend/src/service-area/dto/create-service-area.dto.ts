import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BoundaryPoint {
  @ApiProperty({ description: 'Enlem değeri' })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Boylam değeri' })
  @IsNumber()
  lng: number;
}

export class CreateServiceAreaDto {
  @ApiProperty({ description: 'Bölge adı', example: 'Beylikdüzü' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Şehir', example: 'İstanbul' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'İlçe', example: 'Beylikdüzü' })
  @IsString()
  district: string;

  @ApiProperty({
    description: 'Bölge sınırları (polygon koordinatları)',
    type: [BoundaryPoint],
    example: [
      { lat: 40.9802, lng: 28.6434 },
      { lat: 41.0166, lng: 28.6434 },
      { lat: 41.0166, lng: 28.7090 },
      { lat: 40.9802, lng: 28.7090 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoundaryPoint)
  boundaries: BoundaryPoint[];

  @ApiProperty({ description: 'Taban fiyat', example: 15 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ description: 'Km başı fiyat', example: 3 })
  @IsNumber()
  @Min(0)
  pricePerKm: number;

  @ApiPropertyOptional({ description: 'Maksimum teslimat mesafesi (km)', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDistance?: number;

  @ApiPropertyOptional({ description: 'Aktif durumu', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Öncelik sırası', default: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}