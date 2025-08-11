import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCourierStatusDto } from './dto/update-courier-status.dto';
import { CourierStatus, Prisma } from '@prisma/client';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class CourierService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.CourierWhereInput;
    orderBy?: Prisma.CourierOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 10, where, orderBy } = params || {};

    const [couriers, total] = await Promise.all([
      this.prisma.courier.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              createdAt: true,
            },
          },
          documents: {
            select: {
              id: true,
              type: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.courier.count({ where }),
    ]);

    return {
      data: couriers,
      total,
      skip,
      take,
    };
  }

  async findPendingApplications() {
    return this.findAll({
      where: { status: CourierStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const courier = await this.prisma.courier.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
            status: true,
          },
        },
        documents: true,
      },
    });

    if (!courier) {
      throw new NotFoundException(`Kurye bulunamadı: ${id}`);
    }

    return courier;
  }

  async updateStatus(id: string, updateStatusDto: UpdateCourierStatusDto) {
    const courier = await this.findOne(id);

    if (courier.status !== CourierStatus.PENDING) {
      throw new ForbiddenException('Sadece bekleyen başvurular güncellenebilir');
    }

    const { status, rejectionReason } = updateStatusDto;

    const updatedCourier = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.courier.update({
        where: { id },
        data: {
          status,
          ...(status === CourierStatus.REJECTED && rejectionReason
            ? { rejectionReason }
            : {}),
        },
        include: {
          user: true,
          documents: true,
        },
      });

      if (status === CourierStatus.APPROVED) {
        await tx.user.update({
          where: { id: updated.userId },
          data: { status: 'ACTIVE' },
        });

        await tx.document.updateMany({
          where: { courierId: id },
          data: { status: 'APPROVED' },
        });
      }

      await tx.notification.create({
        data: {
          userId: updated.userId,
          title: status === CourierStatus.APPROVED 
            ? 'Başvurunuz Onaylandı' 
            : 'Başvurunuz Reddedildi',
          message: status === CourierStatus.APPROVED
            ? 'Kurye başvurunuz onaylandı. Artık sipariş alabilirsiniz.'
            : `Kurye başvurunuz reddedildi. ${rejectionReason || 'Detaylı bilgi için bizimle iletişime geçebilirsiniz.'}`,
        },
      });

      return updated;
    });

    this.logger.info('Kurye durumu güncellendi', {
      courierId: id,
      oldStatus: courier.status,
      newStatus: status,
      rejectionReason,
    });

    return updatedCourier;
  }

  async getStatistics() {
    const [total, pending, approved, rejected, active, busy] = await Promise.all([
      this.prisma.courier.count(),
      this.prisma.courier.count({ where: { status: CourierStatus.PENDING } }),
      this.prisma.courier.count({ where: { status: CourierStatus.APPROVED } }),
      this.prisma.courier.count({ where: { status: CourierStatus.REJECTED } }),
      this.prisma.courier.count({ where: { status: CourierStatus.ACTIVE } }),
      this.prisma.courier.count({ where: { status: CourierStatus.BUSY } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      active,
      busy,
    };
  }

  async getDocuments(courierId: string) {
    const courier = await this.findOne(courierId);
    
    return this.prisma.document.findMany({
      where: { courierId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    const courier = await this.findOne(id);

    // Transaction ile kurye ve ilişkili verileri sil
    await this.prisma.$transaction(async (tx) => {
      // Önce ilişkili belgeleri sil
      await tx.document.deleteMany({
        where: { courierId: id },
      });

      // Önce ilişkili siparişleri kontrol et
      const activeOrders = await tx.order.count({
        where: { 
          courierId: id,
          status: {
            in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS']
          }
        },
      });

      if (activeOrders > 0) {
        throw new ForbiddenException('Aktif siparişi olan kurye silinemez');
      }

      // Bildirimleri sil
      await tx.notification.deleteMany({
        where: { userId: courier.userId },
      });

      // Refresh tokenları sil
      await tx.refreshToken.deleteMany({
        where: { userId: courier.userId },
      });

      // Kuryeyi sil
      await tx.courier.delete({
        where: { id },
      });

      // Kullanıcıyı sil
      await tx.user.delete({
        where: { id: courier.userId },
      });
    });

    this.logger.info('Kurye silindi', {
      courierId: id,
      userId: courier.userId,
      fullName: courier.fullName,
    });

    return { message: 'Kurye başarıyla silindi' };
  }
}