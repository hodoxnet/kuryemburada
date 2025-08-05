import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
} from './dto/user-management.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: UserFilterDto, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filter.role) where.role = filter.role;
    if (filter.status) where.status = filter.status;
    if (filter.email) {
      where.email = {
        contains: filter.email,
        mode: 'insensitive',
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              id: true,
              name: true,
              taxNumber: true,
            },
          },
          courier: {
            select: {
              id: true,
              fullName: true,
              tcNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        company: true,
        courier: true,
        refreshTokens: {
          select: {
            id: true,
            token: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        status: dto.status || 'PENDING',
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      message: 'Kullanıcı başarıyla oluşturuldu',
      user,
    };
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being changed and if it's already taken
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Hash password if provided
    let hashedPassword;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.email && { email: dto.email }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(dto.role && { role: dto.role }),
        ...(dto.status && { status: dto.status }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Kullanıcı başarıyla güncellendi',
      user: updatedUser,
    };
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if user has related data
    const hasCompany = await this.prisma.company.findUnique({
      where: { userId: id },
    });

    const hasCourier = await this.prisma.courier.findUnique({
      where: { userId: id },
    });

    if (hasCompany || hasCourier) {
      throw new BadRequestException(
        'User has related data (company or courier). Cannot delete.',
      );
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'Kullanıcı başarıyla silindi',
    };
  }

  async resetPassword(id: number, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    // Invalidate all refresh tokens
    await this.prisma.refreshToken.deleteMany({
      where: { userId: id },
    });

    return {
      message: 'Şifre başarıyla sıfırlandı. Kullanıcı yeniden giriş yapmalı.',
    };
  }

  async getStatistics() {
    const [totalUsers, byRole, byStatus, recentUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    const [totalCompanies, totalCouriers, pendingCompanies, pendingCouriers] =
      await Promise.all([
        this.prisma.company.count(),
        this.prisma.courier.count(),
        this.prisma.company.count({
          where: { status: 'PENDING' },
        }),
        this.prisma.courier.count({
          where: { status: 'PENDING' },
        }),
      ]);

    return {
      totalUsers,
      recentUsers,
      byRole: byRole.reduce(
        (acc, item) => {
          acc[item.role] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      companies: {
        total: totalCompanies,
        pending: pendingCompanies,
      },
      couriers: {
        total: totalCouriers,
        pending: pendingCouriers,
      },
    };
  }
}
