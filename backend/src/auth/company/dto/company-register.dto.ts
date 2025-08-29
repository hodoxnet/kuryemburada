import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsPhoneNumber, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class AddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'District' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiPropertyOptional({ description: 'Country', default: 'Turkey' })
  @IsString()
  @IsOptional()
  country?: string;
}

class ContactPersonDto {
  @ApiProperty({ description: 'Contact person full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Contact person phone' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'Contact person email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Contact person title/position' })
  @IsString()
  @IsOptional()
  title?: string;
}

export class CompanyRegisterDto {
  @ApiProperty({
    description: 'Company email address',
    example: 'info@company.com',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email address cannot be empty' })
  email: string;

  @ApiProperty({
    description: 'Company password',
    example: 'securePassword123',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiProperty({
    description: 'Company name',
    example: 'ABC Logistics Ltd.',
  })
  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty({ message: 'Company name cannot be empty' })
  companyName: string;

  @ApiProperty({
    description: 'Company phone number',
    example: '+905551234567',
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  phone: string;

  @ApiPropertyOptional({
    description: 'Tax number',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  taxNumber?: string;

  @ApiPropertyOptional({
    description: 'Tax office',
    example: 'Kadıköy Vergi Dairesi',
  })
  @IsString()
  @IsOptional()
  taxOffice?: string;

  @ApiPropertyOptional({
    description: 'Trade registry number',
    example: '123456',
  })
  @IsString()
  @IsOptional()
  tradeRegistryNumber?: string;

  @ApiProperty({
    description: 'Company address',
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address: AddressDto;

  @ApiProperty({
    description: 'Contact person information',
    type: ContactPersonDto,
  })
  @ValidateNested()
  @Type(() => ContactPersonDto)
  @IsObject()
  contactPerson: ContactPersonDto;

  @ApiPropertyOptional({
    description: 'Company website',
    example: 'https://www.company.com',
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading logistics company in Turkey',
  })
  @IsString()
  @IsOptional()
  description?: string;
}