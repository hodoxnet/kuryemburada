import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CompanyStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyStatusDto {
  @ApiProperty({ enum: CompanyStatus, description: 'Yeni firma durumu' })
  @IsEnum(CompanyStatus)
  @IsNotEmpty()
  status: CompanyStatus;

  @ApiProperty({ description: 'Red nedeni (opsiyonel)', required: false })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}