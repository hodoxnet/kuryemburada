import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import { CompanyStatus, Prisma } from '@prisma/client';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.CompanyWhereInput;
    orderBy?: Prisma.CompanyOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 10, where, orderBy } = params || {};

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
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
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      total,
      skip,
      take,
    };
  }

  async findPendingApplications() {
    return this.findAll({
      where: { status: CompanyStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
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

    if (!company) {
      throw new NotFoundException(`Firma bulunamadı: ${id}`);
    }

    return company;
  }

  async updateStatus(id: string, updateStatusDto: UpdateCompanyStatusDto) {
    const company = await this.findOne(id);

    if (company.status !== CompanyStatus.PENDING) {
      throw new ForbiddenException('Sadece bekleyen başvurular güncellenebilir');
    }

    const { status, rejectionReason } = updateStatusDto;

    const updatedCompany = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.company.update({
        where: { id },
        data: {
          status,
          ...(status === CompanyStatus.REJECTED && rejectionReason
            ? { rejectionReason }
            : {}),
        },
        include: {
          user: true,
        },
      });

      if (status === CompanyStatus.APPROVED) {
        await tx.user.update({
          where: { id: updated.userId },
          data: { status: 'ACTIVE' },
        });
      }

      await tx.notification.create({
        data: {
          userId: updated.userId,
          title: status === CompanyStatus.APPROVED 
            ? 'Başvurunuz Onaylandı' 
            : 'Başvurunuz Reddedildi',
          message: status === CompanyStatus.APPROVED
            ? 'Firma başvurunuz onaylandı. Artık sistemi kullanabilirsiniz.'
            : `Firma başvurunuz reddedildi. ${rejectionReason || 'Detaylı bilgi için bizimle iletişime geçebilirsiniz.'}`,
        },
      });

      return updated;
    });

    this.logger.info('Firma durumu güncellendi', {
      companyId: id,
      oldStatus: company.status,
      newStatus: status,
      rejectionReason,
    });

    return updatedCompany;
  }

  async getStatistics() {
    const [total, pending, approved, rejected, inactive] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({ where: { status: CompanyStatus.PENDING } }),
      this.prisma.company.count({ where: { status: CompanyStatus.APPROVED } }),
      this.prisma.company.count({ where: { status: CompanyStatus.REJECTED } }),
      this.prisma.company.count({ where: { status: CompanyStatus.INACTIVE } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      inactive,
    };
  }

  async getDocuments(companyId: string) {
    const company = await this.findOne(companyId);
    
    return this.prisma.document.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    const company = await this.findOne(id);

    // Transaction ile firma ve ilişkili verileri sil
    await this.prisma.$transaction(async (tx) => {
      // Önce ilişkili belgeleri sil
      await tx.document.deleteMany({
        where: { companyId: id },
      });

      // Önce ilişkili siparişleri kontrol et
      const activeOrders = await tx.order.count({
        where: { 
          companyId: id,
          status: {
            in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS']
          }
        },
      });

      if (activeOrders > 0) {
        throw new ForbiddenException('Aktif siparişi olan firma silinemez');
      }

      // Bildirimleri sil
      await tx.notification.deleteMany({
        where: { userId: company.userId },
      });

      // Refresh tokenları sil
      await tx.refreshToken.deleteMany({
        where: { userId: company.userId },
      });

      // Firmayı sil
      await tx.company.delete({
        where: { id },
      });

      // Kullanıcıyı sil
      await tx.user.delete({
        where: { id: company.userId },
      });
    });

    this.logger.info('Firma silindi', {
      companyId: id,
      userId: company.userId,
      name: company.name,
    });

    return { message: 'Firma başarıyla silindi' };
  }
}