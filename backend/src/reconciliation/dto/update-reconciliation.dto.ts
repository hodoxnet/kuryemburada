import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReconciliationStatus } from '@prisma/client';

export class UpdateReconciliationDto {
  @ApiPropertyOptional({ description: 'Mutabakat durumu', enum: ReconciliationStatus })
  @IsOptional()
  @IsEnum(ReconciliationStatus)
  status?: ReconciliationStatus;

  @ApiPropertyOptional({ description: 'Ödenen tutar' })
  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @ApiPropertyOptional({ description: 'Notlar' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ProcessPaymentDto {
  @ApiPropertyOptional({ description: 'Ödeme tutarı' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Ödeme yöntemi' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'İşlem referansı' })
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional({ description: 'Açıklama' })
  @IsOptional()
  @IsString()
  description?: string;
}