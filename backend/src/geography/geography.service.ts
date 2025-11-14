import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeographyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tüm illeri listele
   */
  async getAllProvinces() {
    return this.prisma.province.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        plateCode: true,
      },
    });
  }

  /**
   * Belirli bir ile ait ilçeleri listele
   */
  async getDistrictsByProvinceId(provinceId: string) {
    return this.prisma.district.findMany({
      where: {
        provinceId,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        provinceId: true,
      },
    });
  }

  /**
   * Plaka koduna göre il bilgisi getir
   */
  async getProvinceByPlateCode(plateCode: string) {
    return this.prisma.province.findUnique({
      where: {
        plateCode,
      },
      include: {
        districts: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });
  }

  /**
   * İl adına göre il ve ilçeleri getir
   */
  async getProvinceByName(name: string) {
    return this.prisma.province.findUnique({
      where: {
        name: name.toUpperCase(),
      },
      include: {
        districts: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });
  }
}
