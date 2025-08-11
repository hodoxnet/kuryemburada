import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsObject, ValidateNested } from 'class-validator';
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

class ContactPersonDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class RegisterCompanyDto {
  @ApiProperty({ description: 'Email address for login' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Tax number (10 or 11 digits)' })
  @IsString()
  @IsNotEmpty()
  taxNumber: string;

  @ApiProperty({ description: 'Tax office' })
  @IsString()
  @IsNotEmpty()
  taxOffice: string;

  @ApiProperty({ description: 'Company phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Company email' })
  @IsEmail()
  @IsNotEmpty()
  companyEmail: string;

  @ApiProperty({ description: 'Address information', type: AddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({ description: 'KEP address' })
  @IsEmail()
  @IsOptional()
  kepAddress?: string;

  @ApiPropertyOptional({ description: 'Trade registry number' })
  @IsString()
  @IsOptional()
  tradeLicenseNo?: string;

  @ApiPropertyOptional({ description: 'Activity area' })
  @IsString()
  @IsOptional()
  activityArea?: string;

  @ApiPropertyOptional({ description: 'Company website' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: 'Bank account information', type: BankInfoDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BankInfoDto)
  bankInfo?: BankInfoDto;

  @ApiProperty({ description: 'Contact person information', type: ContactPersonDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ContactPersonDto)
  contactPerson: ContactPersonDto;

  @ApiPropertyOptional({ description: 'Employee count range' })
  @IsString()
  @IsOptional()
  employeeCount?: string;

  @ApiPropertyOptional({ description: 'Monthly shipment volume' })
  @IsString()
  @IsOptional()
  monthlyShipmentVolume?: string;

  @ApiPropertyOptional({ description: 'Current logistics provider' })
  @IsString()
  @IsOptional()
  currentLogisticsProvider?: string;
}