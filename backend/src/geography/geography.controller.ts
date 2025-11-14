import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GeographyService } from './geography.service';

@ApiTags('Geography')
@Controller('geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @Get('provinces')
  @ApiOperation({ summary: 'Tüm illeri listele' })
  @ApiResponse({ status: 200, description: 'İller başarıyla getirildi' })
  async getAllProvinces() {
    return this.geographyService.getAllProvinces();
  }

  @Get('provinces/:provinceId/districts')
  @ApiOperation({ summary: 'İle ait ilçeleri listele' })
  @ApiParam({ name: 'provinceId', description: 'İl ID' })
  @ApiResponse({ status: 200, description: 'İlçeler başarıyla getirildi' })
  async getDistrictsByProvinceId(@Param('provinceId') provinceId: string) {
    return this.geographyService.getDistrictsByProvinceId(provinceId);
  }

  @Get('provinces/plate/:plateCode')
  @ApiOperation({ summary: 'Plaka koduna göre il bilgisi getir' })
  @ApiParam({ name: 'plateCode', description: 'Plaka Kodu (örn: 34)' })
  @ApiResponse({ status: 200, description: 'İl bilgisi başarıyla getirildi' })
  async getProvinceByPlateCode(@Param('plateCode') plateCode: string) {
    return this.geographyService.getProvinceByPlateCode(plateCode);
  }

  @Get('provinces/name/:name')
  @ApiOperation({ summary: 'İl adına göre il ve ilçeleri getir' })
  @ApiParam({ name: 'name', description: 'İl Adı (örn: İSTANBUL)' })
  @ApiResponse({ status: 200, description: 'İl bilgisi başarıyla getirildi' })
  async getProvinceByName(@Param('name') name: string) {
    return this.geographyService.getProvinceByName(name);
  }
}
