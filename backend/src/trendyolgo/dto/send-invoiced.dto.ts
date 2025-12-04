import { IsNumber, IsOptional, IsString, IsUrl, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendInvoicedDto {
  @ApiProperty({
    description: 'Fiş tutarı (TL)',
    example: 305.81,
  })
  @IsNumber()
  @Min(0)
  invoiceAmount: number;

  @ApiPropertyOptional({
    description: 'Poşet adedi (maksimum 10)',
    example: 3,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  bagCount?: number;

  @ApiPropertyOptional({
    description: 'Fiş görseli URL',
    example: 'https://example.com/receipt.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  receiptLink?: string;

  @ApiPropertyOptional({
    description: 'Toplam KDV tutarı',
    example: 0.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  invoiceTaxAmount?: number;
}
