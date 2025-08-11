import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderDto {
  @ApiPropertyOptional({ 
    description: 'Sipariş durumu',
    enum: OrderStatus 
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Teslimat kanıtı (fotoğraf URL veya imza)' })
  @IsString()
  @IsOptional()
  deliveryProof?: string;

  @ApiPropertyOptional({ description: 'İptal sebebi' })
  @IsString()
  @IsOptional()
  cancellationReason?: string;
}

export class UpdateOrderStatusDto {
  @ApiPropertyOptional({ 
    description: 'Sipariş durumu',
    enum: OrderStatus 
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ description: 'Teslimat kanıtı (fotoğraf URL veya imza)' })
  @IsString()
  @IsOptional()
  deliveryProof?: string;

  @ApiPropertyOptional({ description: 'İptal sebebi' })
  @IsString()
  @IsOptional()
  cancellationReason?: string;
}