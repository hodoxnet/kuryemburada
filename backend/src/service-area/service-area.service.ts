import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { Logger } from 'winston';

@Injectable()
export class ServiceAreaService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async create(createServiceAreaDto: CreateServiceAreaDto) {
    // İsim benzersizliği kontrolü
    const existing = await this.prisma.serviceArea.findUnique({
      where: { name: createServiceAreaDto.name },
    });

    if (existing) {
      throw new BadRequestException('Bu isimde bir bölge zaten mevcut');
    }

    const serviceArea = await this.prisma.serviceArea.create({
      data: {
        ...createServiceAreaDto,
        boundaries: createServiceAreaDto.boundaries as any, // JSON tipine dönüştür
      },
    });

    this.logger.info('Yeni hizmet bölgesi oluşturuldu', {
      serviceAreaId: serviceArea.id,
      name: serviceArea.name,
    });

    return serviceArea;
  }

  async findAll(filters?: {
    isActive?: boolean;
    city?: string;
    district?: string;
  }) {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters?.city) {
      where.city = filters.city;
    }
    if (filters?.district) {
      where.district = filters.district;
    }

    const serviceAreas = await this.prisma.serviceArea.findMany({
      where,
      include: {
        _count: {
          select: {
            orders: true,
            pricingRules: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' },
      ],
    });

    return serviceAreas;
  }

  async findActive() {
    return this.prisma.serviceArea.findMany({
      where: { isActive: true },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const serviceArea = await this.prisma.serviceArea.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            pricingRules: true,
          },
        },
      },
    });

    if (!serviceArea) {
      throw new NotFoundException('Hizmet bölgesi bulunamadı');
    }

    return serviceArea;
  }

  async update(id: string, updateServiceAreaDto: UpdateServiceAreaDto) {
    // Bölge var mı kontrol et
    await this.findOne(id);

    // İsim değişiyorsa benzersizlik kontrolü
    if (updateServiceAreaDto.name) {
      const existing = await this.prisma.serviceArea.findFirst({
        where: {
          name: updateServiceAreaDto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException('Bu isimde bir bölge zaten mevcut');
      }
    }

    const updateData: any = { ...updateServiceAreaDto };
    if (updateServiceAreaDto.boundaries) {
      updateData.boundaries = updateServiceAreaDto.boundaries as any;
    }

    const serviceArea = await this.prisma.serviceArea.update({
      where: { id },
      data: updateData,
    });

    this.logger.info('Hizmet bölgesi güncellendi', {
      serviceAreaId: id,
      updates: Object.keys(updateServiceAreaDto),
    });

    return serviceArea;
  }

  async toggleActive(id: string) {
    const serviceArea = await this.findOne(id);

    const updated = await this.prisma.serviceArea.update({
      where: { id },
      data: { isActive: !serviceArea.isActive },
    });

    this.logger.info('Hizmet bölgesi durumu değiştirildi', {
      serviceAreaId: id,
      isActive: updated.isActive,
    });

    return updated;
  }

  async remove(id: string) {
    // Bölge var mı kontrol et
    await this.findOne(id);

    // Aktif sipariş kontrolü
    const activeOrders = await this.prisma.order.count({
      where: {
        serviceAreaId: id,
        status: {
          in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'],
        },
      },
    });

    if (activeOrders > 0) {
      throw new BadRequestException(
        `Bu bölgede ${activeOrders} adet aktif sipariş bulunmaktadır. Önce siparişleri tamamlayın veya iptal edin.`,
      );
    }

    // Soft delete yapmak yerine gerçekten silelim
    // Ancak önce ilişkili verileri güncelleyelim
    await this.prisma.$transaction(async (tx) => {
      // Siparişlerdeki referansı kaldır
      await tx.order.updateMany({
        where: { serviceAreaId: id },
        data: { serviceAreaId: null },
      });

      // Fiyatlandırma kurallarındaki referansı kaldır
      await tx.pricingRule.updateMany({
        where: { serviceAreaId: id },
        data: { serviceAreaId: null },
      });

      // Bölgeyi sil
      await tx.serviceArea.delete({
        where: { id },
      });
    });

    this.logger.info('Hizmet bölgesi silindi', {
      serviceAreaId: id,
    });

    return { message: 'Hizmet bölgesi başarıyla silindi' };
  }

  async getStatistics(id: string) {
    // Bölge var mı kontrol et
    await this.findOne(id);

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      avgOrderPrice,
      pricingRules,
    ] = await Promise.all([
      // Toplam sipariş sayısı
      this.prisma.order.count({
        where: { serviceAreaId: id },
      }),
      // Bekleyen siparişler
      this.prisma.order.count({
        where: {
          serviceAreaId: id,
          status: 'PENDING',
        },
      }),
      // Tamamlanan siparişler
      this.prisma.order.count({
        where: {
          serviceAreaId: id,
          status: 'DELIVERED',
        },
      }),
      // İptal edilen siparişler
      this.prisma.order.count({
        where: {
          serviceAreaId: id,
          status: 'CANCELLED',
        },
      }),
      // Toplam gelir
      this.prisma.order.aggregate({
        where: {
          serviceAreaId: id,
          status: 'DELIVERED',
        },
        _sum: {
          price: true,
        },
      }),
      // Ortalama sipariş tutarı
      this.prisma.order.aggregate({
        where: {
          serviceAreaId: id,
          status: 'DELIVERED',
        },
        _avg: {
          price: true,
        },
      }),
      // Bölgeye özel fiyatlandırma kuralları
      this.prisma.pricingRule.count({
        where: { serviceAreaId: id },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: totalRevenue._sum.price || 0,
      avgOrderPrice: avgOrderPrice._avg.price || 0,
      pricingRules,
    };
  }
}