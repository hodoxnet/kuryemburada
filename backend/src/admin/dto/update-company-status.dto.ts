import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CompanyStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanyStatusDto {
  @ApiProperty({
    enum: CompanyStatus,
    description: 'Firma durumu',
  })
  @IsEnum(CompanyStatus)
  status: CompanyStatus;

  @ApiPropertyOptional({
    description: 'Red nedeni (eğer reddediliyorsa)',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
