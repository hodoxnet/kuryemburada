import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, ValidateNested, IsObject, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class VehicleInfoDto {
  @ApiProperty({ description: 'Vehicle type (motorcycle, bicycle, car, etc.)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Vehicle brand' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ description: 'Vehicle model' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ description: 'Vehicle year' })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiProperty({ description: 'License plate number' })
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @ApiPropertyOptional({ description: 'Vehicle color' })
  @IsString()
  @IsOptional()
  color?: string;
}

class LicenseInfoDto {
  @ApiProperty({ description: 'Driver license number' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({ description: 'License type (A, B, C, etc.)' })
  @IsString()
  @IsNotEmpty()
  licenseType: string;

  @ApiProperty({ description: 'License expiry date (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  expiryDate: string;
}

export class CourierRegisterDto {
  @ApiProperty({
    description: 'Courier email address',
    example: 'courier@example.com',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email address cannot be empty' })
  email: string;

  @ApiProperty({
    description: 'Courier password',
    example: 'securePassword123',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name cannot be empty' })
  fullName: string;

  @ApiProperty({
    description: 'Turkish citizenship number',
    example: '12345678901',
  })
  @IsString({ message: 'TC number must be a string' })
  @Length(11, 11, { message: 'TC number must be exactly 11 digits' })
  @IsNotEmpty({ message: 'TC number cannot be empty' })
  tcNumber: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+905551234567',
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  phone: string;

  @ApiPropertyOptional({
    description: 'Date of birth (YYYY-MM-DD)',
    example: '1990-01-01',
  })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Address',
    example: 'Kadıköy, Istanbul',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Vehicle information',
    type: VehicleInfoDto,
  })
  @ValidateNested()
  @Type(() => VehicleInfoDto)
  @IsObject()
  vehicleInfo: VehicleInfoDto;

  @ApiProperty({
    description: 'License information',
    type: LicenseInfoDto,
  })
  @ValidateNested()
  @Type(() => LicenseInfoDto)
  @IsObject()
  licenseInfo: LicenseInfoDto;

  @ApiPropertyOptional({
    description: 'Emergency contact name',
    example: 'Jane Doe',
  })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact phone',
    example: '+905559876543',
  })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;
}