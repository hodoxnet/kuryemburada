import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty({ description: 'Ayar anahtarı (benzersiz olmalı)' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Ayar değeri (JSON formatında)' })
  @IsNotEmpty()
  value: any;

  @ApiProperty({ description: 'Ayar açıklaması', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}