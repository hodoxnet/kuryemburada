import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';
import { UserRole, UserStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Kullanıcı email adresi',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Kullanıcı şifresi',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: UserRole,
    description: 'Kullanıcı rolü',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    enum: UserStatus,
    description: 'Kullanıcı durumu',
    default: UserStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Kullanıcı email adresi',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Kullanıcı şifresi',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Kullanıcı rolü',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    enum: UserStatus,
    description: 'Kullanıcı durumu',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UserFilterDto {
  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Role göre filtrele',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    enum: UserStatus,
    description: 'Duruma göre filtrele',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Email ile ara',
  })
  @IsOptional()
  @IsString()
  email?: string;
}
