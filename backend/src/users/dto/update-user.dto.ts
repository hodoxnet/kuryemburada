import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {
  @ApiProperty({ description: 'Yeni şifre (opsiyonel)', required: false })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}