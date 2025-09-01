import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, UserStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        status: createUserDto.status || UserStatus.PENDING,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.info('Yeni kullanıcı oluşturuldu', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return user;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 10, where, orderBy } = params || {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          courier: {
            select: {
              id: true,
              fullName: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        company: true,
        courier: true,
        notifications: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Kullanıcı bulunamadı: ${id}`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Kullanıcı bulunamadı: ${email}`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          NOT: { id },
        },
      });

      if (existingUser) {
        throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
      }
    }

    const updateData: any = { ...updateUserDto };
    
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.info('Kullanıcı güncellendi', {
      userId: id,
      updates: Object.keys(updateUserDto),
    });

    return updatedUser;
  }

  async remove(id: string) {
    await this.findOne(id);

    const deletedUser = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    this.logger.info('Kullanıcı silindi', {
      userId: id,
      email: deletedUser.email,
    });

    return deletedUser;
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isPasswordValid) {
      throw new ConflictException('Eski şifre hatalı');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    this.logger.info('Kullanıcı şifresi değiştirildi', {
      userId: id,
    });

    return { message: 'Şifre başarıyla değiştirildi' };
  }

  async resetPassword(id: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    this.logger.info('Admin tarafından kullanıcı şifresi sıfırlandı', {
      userId: id,
      userEmail: user.email,
    });

    return { message: 'Şifre başarıyla sıfırlandı' };
  }

  async toggleStatus(id: string) {
    const user = await this.findOne(id);

    const newStatus = user.status === UserStatus.ACTIVE 
      ? UserStatus.INACTIVE 
      : UserStatus.ACTIVE;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    this.logger.info('Kullanıcı durumu değiştirildi', {
      userId: id,
      oldStatus: user.status,
      newStatus,
    });

    return updatedUser;
  }

  async blockUser(id: string) {
    await this.findOne(id);

    const blockedUser = await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.BLOCKED },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    this.logger.info('Kullanıcı engellendi', {
      userId: id,
      email: blockedUser.email,
    });

    return blockedUser;
  }

  async getStatistics() {
    const [total, byRole, byStatus] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      total,
      byRole: byRole.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}