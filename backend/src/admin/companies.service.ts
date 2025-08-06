import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyStatus } from '@prisma/client';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { status?: string; page: number; limit: number }) {
    const { status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where = status ? { status: status as CompanyStatus } : {};

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
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
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPending() {
    return this.prisma.company.findMany({
      where: {
        status: CompanyStatus.PENDING,
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
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        user: true,
        documents: true,
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

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async approve(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        status: CompanyStatus.ACTIVE,
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

    // TODO: Send approval email notification

    return {
      message: 'Firma başarıyla onaylandı',
      company: updatedCompany,
    };
  }

  async reject(id: number, rejectionReason: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        status: CompanyStatus.REJECTED,
        rejectionReason,
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

    // TODO: Send rejection email notification with reason

    return {
      message: 'Firma başvurusu reddedildi',
      company: updatedCompany,
    };
  }

  async updateStatus(id: number, dto: UpdateCompanyStatusDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.rejectionReason && { rejectionReason: dto.rejectionReason }),
        ...(dto.status === CompanyStatus.ACTIVE && { approvedAt: new Date() }),
        ...(dto.status === CompanyStatus.REJECTED && {
          rejectionReason: dto.rejectionReason,
        }),
      },
      include: {
        user: true,
      },
    });

    // Update user status based on company status
    let userStatus = 'ACTIVE';
    if (
      dto.status === CompanyStatus.SUSPENDED ||
      dto.status === CompanyStatus.REJECTED
    ) {
      userStatus = 'SUSPENDED';
    } else if (dto.status === CompanyStatus.INACTIVE) {
      userStatus = 'INACTIVE';
    }

    await this.prisma.user.update({
      where: { id: company.userId },
      data: { status: userStatus as any },
    });

    return {
      message: 'Firma durumu güncellendi',
      company: updatedCompany,
    };
  }
}
