import { 
  IsString, 
  IsOptional, 
  IsObject,
  ValidateNested,
  IsEmail,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PackageType } from '@prisma/client';

class AddressDto {
  @ApiProperty({ description: 'Şehir' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'İlçe' })
  @IsString()
  district: string;

  @ApiProperty({ description: 'Mahalle' })
  @IsString()
  neighborhood: string;

  @ApiProperty({ description: 'Sokak/Cadde' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'Detaylı adres' })
  @IsString()
  detail: string;
}

class BankInfoDto {
  @ApiProperty({ description: 'Banka adı' })
  @IsString()
  bankName: string;

  @ApiProperty({ description: 'IBAN' })
  @IsString()
  iban: string;

  @ApiProperty({ description: 'Hesap sahibi' })
  @IsString()
  accountHolder: string;
}

class ContactPersonDto {
  @ApiProperty({ description: 'İsim' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Telefon' })
  @Matches(/^[0-9]{10,11}$/, { message: 'Geçerli bir telefon numarası giriniz' })
  phone: string;

  @ApiProperty({ description: 'E-posta' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Ünvan' })
  @IsString()
  title: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({ description: 'Firma adı' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Telefon numarası' })
  @IsOptional()
  @Matches(/^[0-9]{10,11}$/, { message: 'Geçerli bir telefon numarası giriniz' })
  phone?: string;

  @ApiPropertyOptional({ description: 'KEP adresi' })
  @IsOptional()
  @IsString()
  kepAddress?: string;

  @ApiPropertyOptional({ description: 'Faaliyet alanı' })
  @IsOptional()
  @IsString()
  activityArea?: string;

  @ApiPropertyOptional({ description: 'Vergi dairesi' })
  @IsOptional()
  @IsString()
  taxOffice?: string;

  @ApiPropertyOptional({ description: 'Varsayılan paket tipi', enum: PackageType })
  @IsOptional()
  defaultPackageType?: PackageType;

  @ApiPropertyOptional({ description: 'Adres bilgileri', type: AddressDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'Banka bilgileri', type: BankInfoDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BankInfoDto)
  bankInfo?: BankInfoDto;

  @ApiPropertyOptional({ description: 'İletişim kişisi', type: ContactPersonDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ContactPersonDto)
  contactPerson?: ContactPersonDto;
}