import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: PaymentStatus, description: 'Yeni ödeme durumu' })
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @ApiProperty({ description: 'İşlem ID (opsiyonel)', required: false })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ description: 'Red/iptal nedeni (opsiyonel)', required: false })
  @IsString()
  @IsOptional()
  refundReason?: string;
}