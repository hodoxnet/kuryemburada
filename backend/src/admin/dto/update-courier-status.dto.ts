import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CourierStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourierStatusDto {
  @ApiProperty({
    enum: CourierStatus,
    description: 'Kurye durumu',
  })
  @IsEnum(CourierStatus)
  status: CourierStatus;

  @ApiPropertyOptional({
    description: 'Red nedeni (eğer reddediliyorsa)',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
