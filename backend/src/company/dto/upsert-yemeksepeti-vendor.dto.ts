import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PickupAddressDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  detail?: string;
}

export class UpsertYemeksepetiVendorDto {
  @IsString()
  @IsNotEmpty()
  remoteId: string;

  @IsString()
  @IsNotEmpty()
  posVendorId: string;

  @IsString()
  @IsNotEmpty()
  chainCode: string;

  @IsOptional()
  @IsString()
  brandCode?: string;

  @IsOptional()
  @IsString()
  platformRestaurantId?: string;

  @ValidateNested()
  @Type(() => PickupAddressDto)
  pickupAddress: PickupAddressDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientSecret?: string;

  @IsOptional()
  @IsString()
  inboundToken?: string;

  @IsOptional()
  @IsString()
  tokenUrl?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;
}
