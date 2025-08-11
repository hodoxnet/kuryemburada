import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  detail: string;
}

class LicenseInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  class: string;

  @ApiProperty()
  @IsDateString()
  issueDate: string;

  @ApiProperty()
  @IsDateString()
  expiryDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number: string;
}

class VehicleInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  plate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  year?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  registrationNo?: string;
}

class BankInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  iban: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountHolder: string;
}

class EmergencyContactDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  relationship?: string;
}

export class RegisterCourierDto {
  @ApiProperty({ description: 'Email address for login' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'TC Identity Number (11 digits)' })
  @IsString()
  @IsNotEmpty()
  tcNumber: string;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'Birth date' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({ description: 'Address information', type: AddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({ description: 'Driver license information', type: LicenseInfoDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => LicenseInfoDto)
  licenseInfo?: LicenseInfoDto;

  @ApiPropertyOptional({ description: 'Vehicle information', type: VehicleInfoDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleInfoDto)
  vehicleInfo?: VehicleInfoDto;

  @ApiPropertyOptional({ description: 'Bank account information', type: BankInfoDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BankInfoDto)
  bankInfo?: BankInfoDto;

  @ApiPropertyOptional({ description: 'Emergency contact', type: EmergencyContactDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @ApiProperty({ description: 'Has own vehicle', default: false })
  @IsBoolean()
  @IsOptional()
  hasVehicle?: boolean;
}