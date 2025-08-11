import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentStatus, CourierStatus, CompanyStatus } from '@prisma/client';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async getDashboardStats() {
    const [
      totalCompanies,
      activeCompanies,
      totalCouriers,
      activeCouriers,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({ where: { status: CompanyStatus.APPROVED } }),
      this.prisma.courier.count(),
      this.prisma.courier.count({ where: { status: CourierStatus.APPROVED } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.COMPLETED },
      }),
    ]);

    return {
      companies: {
        total: totalCompanies,
        active: activeCompanies,
      },
      couriers: {
        total: totalCouriers,
        active: activeCouriers,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        deliveryRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
      },
    };
  }

  async getOrderReports(params: {
    startDate?: Date;
    endDate?: Date;
    companyId?: string;
    courierId?: string;
    status?: OrderStatus;
  }) {
    const { startDate, endDate, companyId, courierId, status } = params;

    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    
    if (companyId) where.companyId = companyId;
    if (courierId) where.courierId = courierId;
    if (status) where.status = status;

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        company: {
          select: { name: true },
        },
        courier: {
          select: { fullName: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await this.prisma.order.aggregate({
      where,
      _count: true,
      _avg: {
        price: true,
        distance: true,
        estimatedTime: true,
        rating: true,
      },
      _sum: {
        price: true,
        commission: true,
        courierEarning: true,
      },
    });

    const statusCounts = await this.prisma.order.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    return {
      orders,
      stats: {
        totalOrders: stats._count,
        averagePrice: stats._avg.price || 0,
        averageDistance: stats._avg.distance || 0,
        averageTime: stats._avg.estimatedTime || 0,
        averageRating: stats._avg.rating || 0,
        totalRevenue: stats._sum.price || 0,
        totalCommission: stats._sum.commission || 0,
        totalCourierEarnings: stats._sum.courierEarning || 0,
        statusBreakdown: statusCounts,
      },
    };
  }

  async getPaymentReports(params: {
    startDate?: Date;
    endDate?: Date;
    status?: PaymentStatus;
  }) {
    const { startDate, endDate, status } = params;

    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    
    if (status) where.status = status;

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            company: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await this.prisma.payment.aggregate({
      where,
      _count: true,
      _sum: {
        amount: true,
      },
    });

    const methodCounts = await this.prisma.payment.groupBy({
      by: ['paymentMethod'],
      where,
      _count: true,
      _sum: {
        amount: true,
      },
    });

    const statusCounts = await this.prisma.payment.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: {
        amount: true,
      },
    });

    return {
      payments,
      stats: {
        totalPayments: stats._count,
        totalAmount: stats._sum.amount || 0,
        methodBreakdown: methodCounts,
        statusBreakdown: statusCounts,
      },
    };
  }

  async getCourierPerformance(params: {
    startDate?: Date;
    endDate?: Date;
    courierId?: string;
  }) {
    const { startDate, endDate, courierId } = params;

    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    
    if (courierId) {
      where.id = courierId;
    }

    const couriers = await this.prisma.courier.findMany({
      where,
      include: {
        orders: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            id: true,
            status: true,
            rating: true,
            deliveredAt: true,
            acceptedAt: true,
            price: true,
            courierEarning: true,
          },
        },
      },
    });

    const performance = couriers.map((courier) => {
      const deliveredOrders = courier.orders.filter(
        (o) => o.status === OrderStatus.DELIVERED
      );
      const totalEarnings = deliveredOrders.reduce(
        (sum, o) => sum + (o.courierEarning || 0),
        0
      );
      const ratings = deliveredOrders
        .filter((o) => o.rating)
        .map((o) => o.rating as number);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

      const avgDeliveryTime =
        deliveredOrders.length > 0
          ? deliveredOrders.reduce((sum, o) => {
              if (o.acceptedAt && o.deliveredAt) {
                const time =
                  new Date(o.deliveredAt).getTime() -
                  new Date(o.acceptedAt).getTime();
                return sum + time / 60000;
              }
              return sum;
            }, 0) / deliveredOrders.length
          : 0;

      return {
        courierId: courier.id,
        courierName: courier.fullName,
        totalOrders: courier.orders.length,
        deliveredOrders: deliveredOrders.length,
        completionRate:
          courier.orders.length > 0
            ? (deliveredOrders.length / courier.orders.length) * 100
            : 0,
        totalEarnings,
        averageRating: avgRating,
        averageDeliveryTime: avgDeliveryTime,
      };
    });

    return performance.sort((a, b) => b.totalEarnings - a.totalEarnings);
  }

  async getCompanyActivity(params: {
    startDate?: Date;
    endDate?: Date;
    companyId?: string;
  }) {
    const { startDate, endDate, companyId } = params;

    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    
    if (companyId) {
      where.id = companyId;
    }

    const companies = await this.prisma.company.findMany({
      where,
      include: {
        orders: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            payments: true,
          },
        },
      },
    });

    const activity = companies.map((company) => {
      const totalSpent = company.orders.reduce(
        (sum, o) => sum + o.price,
        0
      );
      const paidAmount = company.orders.reduce((sum, o) => {
        const paid = o.payments
          .filter((p) => p.status === PaymentStatus.COMPLETED)
          .reduce((pSum, p) => pSum + p.amount, 0);
        return sum + paid;
      }, 0);

      const statusCounts = company.orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        companyId: company.id,
        companyName: company.name,
        totalOrders: company.orders.length,
        totalSpent,
        paidAmount,
        outstandingAmount: totalSpent - paidAmount,
        orderStatusBreakdown: statusCounts,
      };
    });

    return activity.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  async getRevenueAnalysis(params: {
    startDate?: Date;
    endDate?: Date;
    groupBy: 'day' | 'week' | 'month';
  }) {
    const { startDate, endDate, groupBy } = params;

    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const groupedData: Record<string, { revenue: number; count: number }> = {};

    payments.forEach((payment) => {
      const date = new Date(payment.createdAt);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!groupedData[key]) {
        groupedData[key] = { revenue: 0, count: 0 };
      }

      groupedData[key].revenue += payment.amount;
      groupedData[key].count += 1;
    });

    return Object.entries(groupedData).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orderCount: data.count,
      averageOrderValue: data.count > 0 ? data.revenue / data.count : 0,
    }));
  }

  async exportReport(reportType: string, params: any) {
    let data: any;

    switch (reportType) {
      case 'orders':
        data = await this.getOrderReports(params);
        break;
      case 'payments':
        data = await this.getPaymentReports(params);
        break;
      case 'courier-performance':
        data = await this.getCourierPerformance(params);
        break;
      case 'company-activity':
        data = await this.getCompanyActivity(params);
        break;
      case 'revenue':
        data = await this.getRevenueAnalysis(params);
        break;
      default:
        throw new Error('Geçersiz rapor tipi');
    }

    this.logger.info('Rapor dışa aktarıldı', {
      reportType,
      params,
    });

    return data;
  }
}