import { IsString, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReconciliationStatus } from '@prisma/client';

export class CreateReconciliationDto {
  @ApiProperty({ description: 'Firma ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Mutabakat tarihi' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Toplam sipariş sayısı' })
  @IsNumber()
  totalOrders: number;

  @ApiProperty({ description: 'Teslim edilen sipariş sayısı' })
  @IsNumber()
  deliveredOrders: number;

  @ApiProperty({ description: 'İptal edilen sipariş sayısı' })
  @IsNumber()
  cancelledOrders: number;

  @ApiProperty({ description: 'Toplam tutar' })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ description: 'Kurye maliyeti' })
  @IsNumber()
  courierCost: number;

  @ApiProperty({ description: 'Platform komisyonu' })
  @IsNumber()
  platformCommission: number;

  @ApiProperty({ description: 'Net borç' })
  @IsNumber()
  netAmount: number;

  @ApiPropertyOptional({ description: 'Notlar' })
  @IsOptional()
  @IsString()
  notes?: string;
}