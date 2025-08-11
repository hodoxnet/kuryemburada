import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Kullanıcı e-posta adresi' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Kullanıcı şifresi (minimum 8 karakter)' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: UserRole, description: 'Kullanıcı rolü' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ enum: UserStatus, description: 'Kullanıcı durumu', required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}