import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReconciliationDto } from './dto/create-reconciliation.dto';
import { UpdateReconciliationDto, ProcessPaymentDto } from './dto/update-reconciliation.dto';
import { ReconciliationStatus, CompanyPaymentType, OrderStatus } from '@prisma/client';
const dayjs = require('dayjs');

@Injectable()
export class ReconciliationService {
  constructor(private readonly prisma: PrismaService) {}

  // Günlük mutabakat oluştur veya güncelle
  async createOrUpdateDailyReconciliation(companyId: string, date: Date) {
    const startOfDay = dayjs(date).startOf('day').toDate();
    const endOfDay = dayjs(date).endOf('day').toDate();

    // O güne ait siparişleri getir
    const orders = await this.prisma.order.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
    const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED);
    
    const totalAmount = deliveredOrders.reduce((sum, order) => sum + order.price, 0);
    const courierCost = deliveredOrders.reduce((sum, order) => sum + (order.courierEarning || 0), 0);
    const platformCommission = deliveredOrders.reduce((sum, order) => sum + (order.commission || 0), 0);
    const netAmount = totalAmount;

    // Mevcut mutabakat kaydını kontrol et
    const existing = await this.prisma.dailyReconciliation.findUnique({
      where: {
        companyId_date: {
          companyId,
          date: startOfDay,
        },
      },
    });

    if (existing) {
      // Güncelle
      return await this.prisma.dailyReconciliation.update({
        where: { id: existing.id },
        data: {
          totalOrders: orders.length,
          deliveredOrders: deliveredOrders.length,
          cancelledOrders: cancelledOrders.length,
          totalAmount,
          courierCost,
          platformCommission,
          netAmount,
          remainingAmount: netAmount - existing.paidAmount,
        },
      });
    } else {
      // Yeni oluştur
      return await this.prisma.dailyReconciliation.create({
        data: {
          companyId,
          date: startOfDay,
          totalOrders: orders.length,
          deliveredOrders: deliveredOrders.length,
          cancelledOrders: cancelledOrders.length,
          totalAmount,
          courierCost,
          platformCommission,
          netAmount,
          remainingAmount: netAmount,
          status: ReconciliationStatus.PENDING,
        },
      });
    }
  }

  // Firma'nın tüm mutabakatlarını getir
  async findAllByCompany(companyId: string, startDate?: Date, endDate?: Date) {
    const where: any = { companyId };
    
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return await this.prisma.dailyReconciliation.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        company: {
          select: {
            name: true,
            taxNumber: true,
          },
        },
      },
    });
  }

  // Tek bir mutabakat kaydını getir
  async findOne(id: string) {
    const reconciliation = await this.prisma.dailyReconciliation.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            balance: true,
          },
        },
      },
    });

    if (!reconciliation) {
      throw new NotFoundException('Mutabakat kaydı bulunamadı');
    }

    return reconciliation;
  }

  // Mutabakat durumunu güncelle
  async update(id: string, updateDto: UpdateReconciliationDto) {
    const reconciliation = await this.findOne(id);

    const updated = await this.prisma.dailyReconciliation.update({
      where: { id },
      data: {
        ...updateDto,
        remainingAmount: reconciliation.netAmount - (updateDto.paidAmount || reconciliation.paidAmount),
      },
    });

    // Eğer tamamen ödendiyse durumu güncelle
    if (updated.remainingAmount <= 0) {
      await this.prisma.dailyReconciliation.update({
        where: { id },
        data: {
          status: ReconciliationStatus.PAID,
          remainingAmount: 0,
        },
      });
    }

    return updated;
  }

  // Ödeme işle
  async processPayment(reconciliationId: string, paymentDto: ProcessPaymentDto, adminUserId: string) {
    const reconciliation = await this.findOne(reconciliationId);
    
    if (reconciliation.status === ReconciliationStatus.PAID) {
      throw new BadRequestException('Bu mutabakat zaten ödenmiş');
    }

    if (paymentDto.amount > reconciliation.remainingAmount) {
      throw new BadRequestException('Ödeme tutarı kalan borçtan fazla olamaz');
    }

    // Ödeme kaydı oluştur
    const payment = await this.prisma.companyPayment.create({
      data: {
        companyId: reconciliation.companyId,
        reconciliationId,
        paymentType: CompanyPaymentType.DAILY_RECONCILIATION,
        amount: paymentDto.amount,
        paymentMethod: paymentDto.paymentMethod as any,
        transactionReference: paymentDto.transactionReference,
        description: paymentDto.description || `${dayjs(reconciliation.date).format('DD/MM/YYYY')} tarihli mutabakat ödemesi`,
        processedBy: adminUserId,
        processedAt: new Date(),
      },
    });

    // Mutabakat kaydını güncelle
    const newPaidAmount = reconciliation.paidAmount + paymentDto.amount;
    const newRemainingAmount = reconciliation.netAmount - newPaidAmount;

    await this.prisma.dailyReconciliation.update({
      where: { id: reconciliationId },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount <= 0 ? ReconciliationStatus.PAID : ReconciliationStatus.PARTIALLY_PAID,
      },
    });

    // Firma bakiyesini güncelle
    await this.updateCompanyBalance(reconciliation.companyId);

    return payment;
  }

  // Firma bakiyesini güncelle
  async updateCompanyBalance(companyId: string) {
    // Tüm mutabakat kayıtlarını getir
    const reconciliations = await this.prisma.dailyReconciliation.findMany({
      where: { companyId },
    });

    // Tüm ödemeleri getir
    const payments = await this.prisma.companyPayment.findMany({
      where: { companyId },
    });

    const totalDebts = reconciliations.reduce((sum, r) => sum + r.netAmount, 0);
    const totalCredits = payments.reduce((sum, p) => sum + p.amount, 0);
    const currentBalance = totalDebts - totalCredits;

    const lastPayment = payments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    // Bakiye kaydını güncelle veya oluştur
    await this.prisma.companyBalance.upsert({
      where: { companyId },
      create: {
        companyId,
        currentBalance,
        totalDebts,
        totalCredits,
        lastPaymentDate: lastPayment?.createdAt,
        lastPaymentAmount: lastPayment?.amount,
      },
      update: {
        currentBalance,
        totalDebts,
        totalCredits,
        lastPaymentDate: lastPayment?.createdAt,
        lastPaymentAmount: lastPayment?.amount,
      },
    });
  }

  // Günlük otomatik mutabakat oluşturma (Cron job için)
  async generateDailyReconciliations() {
    const yesterday = dayjs().subtract(1, 'day').startOf('day').toDate();
    
    // Aktif tüm firmaları getir
    const companies = await this.prisma.company.findMany({
      where: { status: 'ACTIVE' },
    });

    const results: any[] = [];
    for (const company of companies) {
      try {
        const reconciliation = await this.createOrUpdateDailyReconciliation(
          company.id,
          yesterday
        );
        results.push({ companyId: company.id, status: 'success', reconciliation });
      } catch (error: any) {
        results.push({ companyId: company.id, status: 'error', error: error.message });
      }
    }

    return results;
  }

  // Firma özet raporu - Direkt siparişlerden hesapla
  async getCompanySummary(companyId: string, startDate?: Date, endDate?: Date) {
    const where: any = { companyId };
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Siparişleri direkt getir
    const orders = await this.prisma.order.findMany({
      where,
    });

    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
    const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED);
    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
    const inProgressOrders = orders.filter(o => o.status === OrderStatus.IN_PROGRESS);
    
    const totalAmount = deliveredOrders.reduce((sum, order) => sum + order.price, 0);
    const courierCost = deliveredOrders.reduce((sum, order) => sum + (order.courierEarning || 0), 0);
    const platformCommission = deliveredOrders.reduce((sum, order) => sum + (order.commission || 0), 0);

    // Mevcut ödemeleri getir
    const payments = await this.prisma.companyPayment.findMany({
      where: { 
        companyId,
        ...(startDate && endDate ? {
          createdAt: {
            gte: startDate,
            lte: endDate,
          }
        } : {})
      },
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    // Bakiye bilgisi
    const balance = await this.prisma.companyBalance.findUnique({
      where: { companyId },
    });

    const summary = {
      totalOrders: orders.length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: cancelledOrders.length,
      pendingOrders: pendingOrders.length,
      inProgressOrders: inProgressOrders.length,
      totalAmount,
      courierCost,
      platformCommission,
      netAmount: totalAmount,
      totalPaid,
      totalRemaining: totalAmount - totalPaid,
      currentBalance: balance?.currentBalance || totalAmount - totalPaid,
    };

    return summary;
  }

  // Günlük sipariş raporu - Mutabakat oluşturmadan
  async getDailyOrdersReport(companyId: string, date: Date) {
    const startOfDay = dayjs(date).startOf('day').toDate();
    const endOfDay = dayjs(date).endOf('day').toDate();

    const orders = await this.prisma.order.findMany({
      where: {
        companyId,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);
    const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED);
    
    const totalAmount = deliveredOrders.reduce((sum, order) => sum + order.price, 0);
    const courierCost = deliveredOrders.reduce((sum, order) => sum + (order.courierEarning || 0), 0);
    const platformCommission = deliveredOrders.reduce((sum, order) => sum + (order.commission || 0), 0);

    return {
      date: startOfDay,
      orders,
      summary: {
        totalOrders: orders.length,
        deliveredOrders: deliveredOrders.length,
        cancelledOrders: cancelledOrders.length,
        totalAmount,
        courierCost,
        platformCommission,
        netAmount: totalAmount,
      },
    };
  }

  // Tarih aralığına göre sipariş raporu
  async getOrdersReport(companyId: string, startDate: Date, endDate: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        courier: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Günlere göre grupla
    const groupedByDate: { [key: string]: any } = {};
    
    orders.forEach(order => {
      const dateKey = dayjs(order.createdAt).format('YYYY-MM-DD');
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: dateKey,
          orders: [],
          totalOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0,
          totalAmount: 0,
          courierCost: 0,
          platformCommission: 0,
          netAmount: 0,
        };
      }
      
      groupedByDate[dateKey].orders.push(order);
      groupedByDate[dateKey].totalOrders++;
      
      if (order.status === OrderStatus.DELIVERED) {
        groupedByDate[dateKey].deliveredOrders++;
        groupedByDate[dateKey].totalAmount += order.price;
        groupedByDate[dateKey].courierCost += order.courierEarning || 0;
        groupedByDate[dateKey].platformCommission += order.commission || 0;
        groupedByDate[dateKey].netAmount += order.price;
      } else if (order.status === OrderStatus.CANCELLED) {
        groupedByDate[dateKey].cancelledOrders++;
      }
    });

    return Object.values(groupedByDate).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // Admin için tüm mutabakatları getir
  async findAll(filters?: {
    status?: ReconciliationStatus;
    companyId?: string;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }
    
    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.dailyReconciliation.findMany({
        where,
        skip: filters?.skip || 0,
        take: filters?.take || 10,
        orderBy: { date: 'desc' },
        include: {
          company: {
            select: {
              name: true,
              taxNumber: true,
            },
          },
        },
      }),
      this.prisma.dailyReconciliation.count({ where }),
    ]);

    return {
      data,
      total,
      skip: filters?.skip || 0,
      take: filters?.take || 10,
    };
  }
}
