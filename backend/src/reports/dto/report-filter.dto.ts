import { IsOptional, IsDateString, IsNumber, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export class ReportFilterDto {
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

  @ApiPropertyOptional({ 
    enum: ReportPeriod,
    description: 'Rapor periyodu' 
  })
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @ApiPropertyOptional({ 
    description: 'Firma ID (admin için)' 
  })
  @IsOptional()
  @IsNumber()
  companyId?: number;

  @ApiPropertyOptional({ 
    description: 'Kurye ID (admin için)' 
  })
  @IsOptional()
  @IsNumber()
  courierId?: number;

  @ApiPropertyOptional({ 
    description: 'Bölge/Şehir filtresi' 
  })
  @IsOptional()
  @IsString()
  region?: string;
}