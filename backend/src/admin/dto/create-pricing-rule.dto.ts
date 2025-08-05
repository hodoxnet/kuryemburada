import {
  IsEnum,
  IsNumber,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PricingRuleType {
  DISTANCE = 'DISTANCE',
  ZONE = 'ZONE',
  PACKAGE_TYPE = 'PACKAGE_TYPE',
  TIME_SLOT = 'TIME_SLOT',
  URGENCY = 'URGENCY',
  BASE_FEE = 'BASE_FEE',
  MINIMUM_ORDER = 'MINIMUM_ORDER',
}

export class CreatePricingRuleDto {
  @ApiProperty({
    description: 'Fiyatlama kuralı adı',
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: PricingRuleType,
    description: 'Kural tipi',
  })
  @IsEnum(PricingRuleType)
  type: PricingRuleType;

  @ApiProperty({
    description: 'Kural parametreleri',
    example: {
      pricePerKm: 5.5,
      minimumDistance: 0,
      maximumDistance: 100,
    },
  })
  @IsObject()
  parameters: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Öncelik sırası',
  })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({
    description: 'Kural aktif mi?',
    default: true,
  })
  @IsBoolean()
  isActive: boolean;
}

export class UpdatePricingRuleDto {
  @ApiPropertyOptional({
    description: 'Fiyatlama kuralı adı',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Kural parametreleri',
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Öncelik sırası',
  })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({
    description: 'Kural aktif mi?',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
