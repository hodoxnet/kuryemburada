import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyPaymentDto } from './dto/create-company-payment.dto';
import { Prisma, ReconciliationStatus } from '@prisma/client';
import { Logger } from 'winston';

@Injectable()
export class CompanyPaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async create(createDto: CreateCompanyPaymentDto, processedBy: string) {
    const { companyId, amount, reconciliationId, ...paymentData } = createDto;

    // Firma kontrolü
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Firma bulunamadı');
    }

    // CompanyBalance'ı ayrı sorgula
    const companyBalance = await this.prisma.companyBalance.findUnique({
      where: { companyId },
    });

    // Transaction ile ödeme işlemi
    const result = await this.prisma.$transaction(async (tx) => {
      // CompanyPayment kaydı oluştur
      const payment = await tx.companyPayment.create({
        data: {
          companyId,
          reconciliationId,
          amount,
          processedBy,
          processedAt: new Date(),
          ...paymentData,
        },
      });

      // CompanyBalance güncelle
      const currentBalance = companyBalance;
      if (currentBalance) {
        await tx.companyBalance.update({
          where: { companyId },
          data: {
            currentBalance: Math.max(0, currentBalance.currentBalance - amount),
            totalCredits: currentBalance.totalCredits + amount,
            lastPaymentDate: new Date(),
            lastPaymentAmount: amount,
            updatedAt: new Date(),
          },
        });
      } else {
        // Balance kaydı yoksa oluştur
        await tx.companyBalance.create({
          data: {
            companyId,
            currentBalance: Math.max(0, -amount), // Negatif olmaması için
            totalDebts: 0,
            totalCredits: amount,
            lastPaymentDate: new Date(),
            lastPaymentAmount: amount,
          },
        });
      }

      // Eğer mutabakat ID'si varsa, mutabakat kaydını güncelle
      if (reconciliationId) {
        const reconciliation = await tx.dailyReconciliation.findUnique({
          where: { id: reconciliationId },
        });

        if (reconciliation) {
          const newPaidAmount = reconciliation.paidAmount + amount;
          const newStatus = newPaidAmount >= reconciliation.netAmount 
            ? ReconciliationStatus.PAID 
            : ReconciliationStatus.PARTIALLY_PAID;

          await tx.dailyReconciliation.update({
            where: { id: reconciliationId },
            data: {
              paidAmount: newPaidAmount,
              status: newStatus,
              updatedAt: new Date(),
            },
          });
        }
      }

      // Bildirim oluştur
      await tx.notification.create({
        data: {
          userId: company.userId,
          title: 'Ödemeniz Alındı',
          message: `${amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} tutarında ödemeniz alınmıştır. ${paymentData.description || ''}`,
        },
      });

      return payment;
    });

    this.logger.info('Firma ödemesi kaydedildi', {
      paymentId: result.id,
      companyId,
      amount,
      processedBy,
    });

    return result;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.CompanyPaymentWhereInput;
    orderBy?: Prisma.CompanyPaymentOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 10, where, orderBy } = params || {};

    const [payments, total] = await Promise.all([
      this.prisma.companyPayment.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.companyPayment.count({ where }),
    ]);

    return {
      data: payments,
      total,
      skip,
      take,
    };
  }

  async findByCompany(companyId: string, params?: {
    skip?: number;
    take?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { skip = 0, take = 10, startDate, endDate } = params || {};

    const where: Prisma.CompanyPaymentWhereInput = {
      companyId,
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        },
      } : {}),
    };

    return this.findAll({ skip, take, where });
  }

  async getCompanyPaymentSummary(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Firma bulunamadı');
    }

    const companyBalance = await this.prisma.companyBalance.findUnique({
      where: { companyId },
    });

    const [totalPayments, recentPayments, unpaidReconciliations] = await Promise.all([
      // Toplam ödemeler
      this.prisma.companyPayment.aggregate({
        where: { companyId },
        _sum: { amount: true },
        _count: true,
      }),
      // Son 5 ödeme
      this.prisma.companyPayment.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Ödenmemiş mutabakatlar
      this.prisma.dailyReconciliation.findMany({
        where: {
          companyId,
          status: { in: [ReconciliationStatus.PENDING, ReconciliationStatus.PARTIALLY_PAID] },
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    const totalUnpaid = unpaidReconciliations.reduce(
      (sum, r) => sum + (r.netAmount - r.paidAmount),
      0
    );

    return {
      company: {
        id: company.id,
        name: company.name,
      },
      balance: {
        currentDebt: companyBalance?.currentBalance || 0,
        totalDebts: companyBalance?.totalDebts || 0,
        totalPayments: totalPayments._sum.amount || 0,
        paymentCount: totalPayments._count,
      },
      unpaidReconciliations: {
        count: unpaidReconciliations.length,
        totalAmount: totalUnpaid,
        items: unpaidReconciliations,
      },
      recentPayments,
    };
  }

  async getReconciliationDetails(reconciliationId: string) {
    const reconciliation = await this.prisma.dailyReconciliation.findUnique({
      where: { id: reconciliationId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!reconciliation) {
      throw new NotFoundException('Mutabakat kaydı bulunamadı');
    }

    // Bu mutabakat için yapılan ödemeleri getir
    const payments = await this.prisma.companyPayment.findMany({
      where: { reconciliationId },
      orderBy: { createdAt: 'desc' },
    });

    // O güne ait siparişleri getir
    const startOfDay = new Date(reconciliation.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reconciliation.date);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        companyId: reconciliation.companyId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        courier: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return {
      reconciliation,
      payments,
      orders,
      remainingDebt: reconciliation.netAmount - reconciliation.paidAmount,
    };
  }

  async getMyPayments(userId: string, params?: {
    skip?: number;
    take?: number;
  }) {
    // Kullanıcının firma ID'sini bul
    const company = await this.prisma.company.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Firma kaydı bulunamadı');
    }

    return this.findByCompany(company.id, params);
  }
}