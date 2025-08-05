import { IsEnum, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentStatusDto {
  @ApiProperty({ 
    enum: PaymentStatus,
    description: 'Ödeme durumu' 
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiPropertyOptional({ 
    description: 'İşlem notu' 
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ 
    description: 'İşlem referans numarası' 
  })
  @IsOptional()
  @IsString()
  transactionReference?: string;
}

export class PaymentFilterDto {
  @ApiPropertyOptional({ 
    enum: PaymentStatus,
    description: 'Ödeme durumu' 
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ 
    enum: PaymentMethod,
    description: 'Ödeme yöntemi' 
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ 
    description: 'Firma ID' 
  })
  @IsOptional()
  @IsNumber()
  companyId?: number;

  @ApiPropertyOptional({ 
    description: 'Kurye ID' 
  })
  @IsOptional()
  @IsNumber()
  courierId?: number;

  @ApiPropertyOptional({ 
    description: 'Başlangıç tarihi' 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    description: 'Bitiş tarihi' 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreatePaymentDto {
  @ApiProperty({ 
    description: 'Sipariş ID' 
  })
  @IsNumber()
  orderId: number;

  @ApiProperty({ 
    description: 'Ödeme tutarı' 
  })
  @IsNumber()
  amount: number;

  @ApiProperty({ 
    enum: PaymentMethod,
    description: 'Ödeme yöntemi' 
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ 
    description: 'Ödeme açıklaması' 
  })
  @IsOptional()
  @IsString()
  description?: string;
}