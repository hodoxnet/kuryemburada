import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CourierStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourierStatusDto {
  @ApiProperty({ enum: CourierStatus, description: 'Yeni kurye durumu' })
  @IsEnum(CourierStatus)
  @IsNotEmpty()
  status: CourierStatus;

  @ApiProperty({ description: 'Red nedeni (opsiyonel)', required: false })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}