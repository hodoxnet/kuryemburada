import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourierStatus } from '@prisma/client';
import { UpdateCourierStatusDto } from './dto/update-courier-status.dto';

@Injectable()
export class CouriersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { status?: string; page: number; limit: number }) {
    const { status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where = status ? { status: status as CourierStatus } : {};

    const [couriers, total] = await Promise.all([
      this.prisma.courier.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              emailVerified: true,
              phoneVerified: true,
              createdAt: true,
            },
          },
          documents: true,
          vehicle: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.courier.count({ where }),
    ]);

    return {
      data: couriers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPending() {
    return this.prisma.courier.findMany({
      where: {
        status: CourierStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
        documents: true,
        vehicle: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const courier = await this.prisma.courier.findUnique({
      where: { id },
      include: {
        user: true,
        documents: true,
        vehicle: true,
        orders: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!courier) {
      throw new NotFoundException(`Courier with ID ${id} not found`);
    }

    return courier;
  }

  async approve(id: number) {
    const courier = await this.prisma.courier.findUnique({
      where: { id },
    });

    if (!courier) {
      throw new NotFoundException(`Courier with ID ${id} not found`);
    }

    const updatedCourier = await this.prisma.courier.update({
      where: { id },
      data: {
        status: CourierStatus.ACTIVE,
        approvedAt: new Date(),
        user: {
          update: {
            status: 'ACTIVE',
          },
        },
      },
      include: {
        user: true,
      },
    });

    // TODO: Send approval SMS/email notification

    return {
      message: 'Kurye başarıyla onaylandı',
      courier: updatedCourier,
    };
  }

  async reject(id: number, rejectionReason: string) {
    const courier = await this.prisma.courier.findUnique({
      where: { id },
    });

    if (!courier) {
      throw new NotFoundException(`Courier with ID ${id} not found`);
    }

    const updatedCourier = await this.prisma.courier.update({
      where: { id },
      data: {
        status: CourierStatus.REJECTED,
        rejectionReason,
        rejectedAt: new Date(),
        user: {
          update: {
            status: 'SUSPENDED',
          },
        },
      },
      include: {
        user: true,
      },
    });

    // TODO: Send rejection SMS/email notification with reason

    return {
      message: 'Kurye başvurusu reddedildi',
      courier: updatedCourier,
    };
  }

  async updateStatus(id: number, dto: UpdateCourierStatusDto) {
    const courier = await this.prisma.courier.findUnique({
      where: { id },
    });

    if (!courier) {
      throw new NotFoundException(`Courier with ID ${id} not found`);
    }

    const updatedCourier = await this.prisma.courier.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.rejectionReason && { rejectionReason: dto.rejectionReason }),
        ...(dto.status === CourierStatus.ACTIVE && { approvedAt: new Date() }),
        ...(dto.status === CourierStatus.REJECTED && {
          rejectedAt: new Date(),
        }),
      },
      include: {
        user: true,
      },
    });

    // Update user status based on courier status
    let userStatus = 'ACTIVE';
    if (
      dto.status === CourierStatus.SUSPENDED ||
      dto.status === CourierStatus.REJECTED
    ) {
      userStatus = 'SUSPENDED';
    } else if (dto.status === CourierStatus.INACTIVE) {
      userStatus = 'INACTIVE';
    }

    await this.prisma.user.update({
      where: { id: courier.userId },
      data: { status: userStatus as any },
    });

    return {
      message: 'Kurye durumu güncellendi',
      courier: updatedCourier,
    };
  }
}
