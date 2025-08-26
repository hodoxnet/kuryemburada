import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyPaymentType, PaymentMethod } from '@prisma/client';

export class CreateCompanyPaymentDto {
  @ApiProperty({ description: 'Firma ID' })
  @IsUUID()
  companyId: string;

  @ApiPropertyOptional({ description: 'Mutabakat ID (opsiyonel)' })
  @IsOptional()
  @IsUUID()
  reconciliationId?: string;

  @ApiProperty({ 
    description: 'Ödeme tipi',
    enum: CompanyPaymentType,
  })
  @IsEnum(CompanyPaymentType)
  paymentType: CompanyPaymentType;

  @ApiProperty({ description: 'Ödeme tutarı', minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ 
    description: 'Ödeme yöntemi',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'İşlem referansı (dekont no, havale no vb.)' })
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional({ description: 'Açıklama' })
  @IsOptional()
  @IsString()
  description?: string;
}