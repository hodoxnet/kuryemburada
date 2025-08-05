import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportFilterDto, ReportPeriod } from './dto/report-filter.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper functions
  async getCompanyIdFromUser(userId: number): Promise<number> {
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });
    if (!company) {
      throw new NotFoundException('Company not found for this user');
    }
    return company.id;
  }

  async getCourierIdFromUser(userId: number): Promise<number> {
    const courier = await this.prisma.courier.findUnique({
      where: { userId },
    });
    if (!courier) {
      throw new NotFoundException('Courier not found for this user');
    }
    return courier.id;
  }

  private getDateRange(filter: ReportFilterDto) {
    const where: any = {};
    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.createdAt.lte = new Date(filter.endDate);
      }
    }
    return where;
  }

  // Admin Reports
  async getAdminOverview(filter: ReportFilterDto) {
    const dateRange = this.getDateRange(filter);

    const [
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      totalCommission,
      activeCompanies,
      activeCouriers,
      newCompanies,
      newCouriers,
      avgDeliveryTime,
      topCompanies,
      topCouriers,
    ] = await Promise.all([
      // Total orders
      this.prisma.order.count({ where: dateRange }),
      // Completed orders
      this.prisma.order.count({ 
        where: { ...dateRange, status: OrderStatus.DELIVERED } 
      }),
      // Cancelled orders
      this.prisma.order.count({ 
        where: { ...dateRange, status: OrderStatus.CANCELLED } 
      }),
      // Total revenue
      this.prisma.payment.aggregate({
        where: { ...dateRange, status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      // Total commission (15% default)
      this.prisma.payment.aggregate({
        where: { ...dateRange, status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      // Active companies count
      this.prisma.company.count({ where: { status: 'ACTIVE' } }),
      // Active couriers count
      this.prisma.courier.count({ where: { status: 'ACTIVE' } }),
      // New companies this period
      this.prisma.company.count({ where: dateRange }),
      // New couriers this period
      this.prisma.courier.count({ where: dateRange }),
      // Average delivery time
      this.prisma.order.aggregate({
        where: { ...dateRange, status: OrderStatus.DELIVERED },
        _avg: { deliveryTime: true },
      }),
      // Top 5 companies by order count
      this.prisma.company.findMany({
        take: 5,
        include: {
          _count: {
            select: { orders: true },
          },
        },
        orderBy: {
          orders: {
            _count: 'desc',
          },
        },
      }),
      // Top 5 couriers by delivery count
      this.prisma.courier.findMany({
        take: 5,
        include: {
          _count: {
            select: { orders: true },
          },
        },
        orderBy: {
          orders: {
            _count: 'desc',
          },
        },
      }),
    ]);

    const revenue = totalRevenue._sum.amount || 0;
    const commission = revenue * 0.15; // 15% commission

    return {
      overview: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
        totalRevenue: revenue,
        totalCommission: commission,
        netRevenue: revenue - commission,
        avgDeliveryTime: avgDeliveryTime._avg.deliveryTime || 0,
      },
      users: {
        activeCompanies,
        activeCouriers,
        newCompanies,
        newCouriers,
      },
      topPerformers: {
        companies: topCompanies.map(c => ({
          id: c.id,
          name: c.name,
          orderCount: c._count.orders,
        })),
        couriers: topCouriers.map(c => ({
          id: c.id,
          name: c.fullName,
          deliveryCount: c._count.orders,
        })),
      },
    };
  }

  async getAdminOrderReport(filter: ReportFilterDto) {
    const where: any = this.getDateRange(filter);
    if (filter.companyId) where.companyId = filter.companyId;
    if (filter.courierId) where.courierId = filter.courierId;

    const [orders, ordersByStatus, ordersByType, dailyOrders] = await Promise.all([
      // All orders with details
      this.prisma.order.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true },
          },
          courier: {
            select: { id: true, fullName: true },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to last 100 orders
      }),
      // Orders grouped by status
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      // Orders grouped by package type
      this.prisma.order.groupBy({
        by: ['packageType'],
        where,
        _count: true,
      }),
      // Daily order counts for chart
      this.prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          SUM(price) as revenue
        FROM orders
        WHERE created_at >= ${filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          AND created_at <= ${filter.endDate ? new Date(filter.endDate) : new Date()}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
    ]);

    return {
      orders,
      statistics: {
        byStatus: ordersByStatus.map(item => ({
          status: item.status,
          count: item._count,
        })),
        byType: ordersByType.map(item => ({
          type: item.packageType,
          count: item._count,
        })),
      },
      dailyTrend: dailyOrders,
    };
  }

  async getAdminRevenueReport(filter: ReportFilterDto) {
    const where: any = this.getDateRange(filter);
    where.status = PaymentStatus.COMPLETED;

    const [
      totalRevenue,
      revenueByMethod,
      revenueByCompany,
      monthlyRevenue,
      commissionData,
    ] = await Promise.all([
      // Total revenue
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      // Revenue by payment method
      this.prisma.payment.groupBy({
        by: ['method'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      // Top 10 companies by revenue
      this.prisma.$queryRaw`
        SELECT 
          c.id,
          c.name,
          COUNT(o.id) as order_count,
          SUM(p.amount) as total_revenue
        FROM companies c
        JOIN orders o ON o.company_id = c.id
        JOIN payments p ON p.order_id = o.id
        WHERE p.status = 'COMPLETED'
          ${filter.startDate ? `AND p.created_at >= '${filter.startDate}'` : ''}
          ${filter.endDate ? `AND p.created_at <= '${filter.endDate}'` : ''}
        GROUP BY c.id, c.name
        ORDER BY total_revenue DESC
        LIMIT 10
      `,
      // Monthly revenue trend
      this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as payment_count,
          SUM(amount) as revenue
        FROM payments
        WHERE status = 'COMPLETED'
          ${filter.startDate ? `AND created_at >= '${filter.startDate}'` : ''}
          ${filter.endDate ? `AND created_at <= '${filter.endDate}'` : ''}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      `,
      // Commission calculations
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    const revenue = totalRevenue._sum.amount || 0;
    const commissionRate = 0.15;
    const commission = revenue * commissionRate;

    return {
      summary: {
        totalRevenue: revenue,
        totalPayments: totalRevenue._count,
        avgPaymentAmount: totalRevenue._count > 0 ? revenue / totalRevenue._count : 0,
        totalCommission: commission,
        netRevenue: revenue - commission,
      },
      byPaymentMethod: revenueByMethod.map(item => ({
        method: item.method,
        count: item._count,
        amount: item._sum.amount || 0,
      })),
      topCompanies: revenueByCompany,
      monthlyTrend: monthlyRevenue,
    };
  }

  async getAdminPerformanceReport(filter: ReportFilterDto) {
    const where: any = this.getDateRange(filter);
    if (filter.companyId) where.companyId = filter.companyId;
    if (filter.courierId) where.courierId = filter.courierId;

    const [
      deliveryStats,
      courierPerformance,
      companyActivity,
      avgMetrics,
    ] = await Promise.all([
      // Delivery completion stats
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
        _avg: { deliveryTime: true },
      }),
      // Courier performance metrics
      this.prisma.$queryRaw`
        SELECT 
          c.id,
          c.full_name,
          COUNT(o.id) as total_orders,
          COUNT(CASE WHEN o.status = 'DELIVERED' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) as cancelled_orders,
          AVG(o.delivery_time) as avg_delivery_time,
          AVG(o.rating) as avg_rating
        FROM couriers c
        LEFT JOIN orders o ON o.courier_id = c.id
        WHERE o.created_at >= ${filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          AND o.created_at <= ${filter.endDate ? new Date(filter.endDate) : new Date()}
        GROUP BY c.id, c.full_name
        ORDER BY completed_orders DESC
        LIMIT 20
      `,
      // Company activity metrics
      this.prisma.$queryRaw`
        SELECT 
          c.id,
          c.name,
          COUNT(o.id) as total_orders,
          AVG(o.price) as avg_order_value,
          SUM(o.price) as total_spent
        FROM companies c
        LEFT JOIN orders o ON o.company_id = c.id
        WHERE o.created_at >= ${filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          AND o.created_at <= ${filter.endDate ? new Date(filter.endDate) : new Date()}
        GROUP BY c.id, c.name
        ORDER BY total_orders DESC
        LIMIT 20
      `,
      // Average metrics
      this.prisma.order.aggregate({
        where,
        _avg: {
          price: true,
          deliveryTime: true,
          distance: true,
        },
      }),
    ]);

    return {
      deliveryPerformance: deliveryStats.map(item => ({
        status: item.status,
        count: item._count,
        avgDeliveryTime: item._avg.deliveryTime || 0,
      })),
      courierPerformance,
      companyActivity,
      averageMetrics: {
        avgOrderValue: avgMetrics._avg.price || 0,
        avgDeliveryTime: avgMetrics._avg.deliveryTime || 0,
        avgDistance: avgMetrics._avg.distance || 0,
      },
    };
  }

  async getAdminRegionalReport(filter: ReportFilterDto) {
    const where: any = this.getDateRange(filter);

    // Simplified regional analysis based on delivery addresses
    const regionalData = await this.prisma.$queryRaw`
      SELECT 
        delivery_address->>'city' as city,
        delivery_address->>'district' as district,
        COUNT(*) as order_count,
        SUM(price) as total_revenue,
        AVG(delivery_time) as avg_delivery_time
      FROM orders
      WHERE created_at >= ${filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        AND created_at <= ${filter.endDate ? new Date(filter.endDate) : new Date()}
        ${filter.region ? `AND delivery_address->>'city' = '${filter.region}'` : ''}
      GROUP BY delivery_address->>'city', delivery_address->>'district'
      ORDER BY order_count DESC
      LIMIT 50
    `;

    return {
      regionalDistribution: regionalData,
    };
  }

  // Company Reports
  async getCompanyOrderReport(companyId: number, filter: ReportFilterDto) {
    const where: any = {
      ...this.getDateRange(filter),
      companyId,
    };

    const [orders, statistics, dailyTrend] = await Promise.all([
      // Recent orders
      this.prisma.order.findMany({
        where,
        include: {
          courier: {
            select: { id: true, fullName: true },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      // Order statistics
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: { price: true },
      }),
      // Daily trend
      this.prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          SUM(price) as spent
        FROM orders
        WHERE company_id = ${companyId}
          AND created_at >= ${filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          AND created_at <= ${filter.endDate ? new Date(filter.endDate) : new Date()}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
    ]);

    return {
      orders,
      statistics: statistics.map(item => ({
        status: item.status,
        count: item._count,
        totalAmount: item._sum.price || 0,
      })),
      dailyTrend,
    };
  }

  async getCompanyExpenseReport(companyId: number, filter: ReportFilterDto) {
    const where: any = {
      order: { companyId },
      status: PaymentStatus.COMPLETED,
      ...this.getDateRange(filter),
    };

    const [totalExpenses, expensesByMethod, monthlyExpenses] = await Promise.all([
      // Total expenses
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      // Expenses by payment method
      this.prisma.payment.groupBy({
        by: ['method'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      // Monthly expenses
      this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', p.created_at) as month,
          COUNT(*) as payment_count,
          SUM(p.amount) as total_expense
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE o.company_id = ${companyId}
          AND p.status = 'COMPLETED'
          ${filter.startDate ? `AND p.created_at >= '${filter.startDate}'` : ''}
          ${filter.endDate ? `AND p.created_at <= '${filter.endDate}'` : ''}
        GROUP BY DATE_TRUNC('month', p.created_at)
        ORDER BY month DESC
        LIMIT 12
      `,
    ]);

    return {
      summary: {
        totalExpenses: totalExpenses._sum.amount || 0,
        totalPayments: totalExpenses._count,
        avgPaymentAmount: totalExpenses._count > 0 
          ? (totalExpenses._sum.amount || 0) / totalExpenses._count 
          : 0,
      },
      byPaymentMethod: expensesByMethod.map(item => ({
        method: item.method,
        count: item._count,
        amount: item._sum.amount || 0,
      })),
      monthlyTrend: monthlyExpenses,
    };
  }

  async getCompanyPerformanceReport(companyId: number, filter: ReportFilterDto) {
    const where: any = {
      ...this.getDateRange(filter),
      companyId,
    };

    const [deliveryStats, avgMetrics, courierStats] = await Promise.all([
      // Delivery completion stats
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
        _avg: { deliveryTime: true },
      }),
      // Average metrics
      this.prisma.order.aggregate({
        where,
        _avg: {
          deliveryTime: true,
          price: true,
          distance: true,
        },
      }),
      // Top couriers used
      this.prisma.$queryRaw`
        SELECT 
          c.id,
          c.full_name,
          COUNT(o.id) as delivery_count,
          AVG(o.delivery_time) as avg_delivery_time,
          AVG(o.rating) as avg_rating
        FROM orders o
        JOIN couriers c ON o.courier_id = c.id
        WHERE o.company_id = ${companyId}
          AND o.created_at >= ${filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          AND o.created_at <= ${filter.endDate ? new Date(filter.endDate) : new Date()}
        GROUP BY c.id, c.full_name
        ORDER BY delivery_count DESC
        LIMIT 10
      `,
    ]);

    return {
      deliveryPerformance: deliveryStats.map(item => ({
        status: item.status,
        count: item._count,
        avgDeliveryTime: item._avg.deliveryTime || 0,
      })),
      averageMetrics: {
        avgDeliveryTime: avgMetrics._avg.deliveryTime || 0,
        avgOrderValue: avgMetrics._avg.price || 0,
        avgDistance: avgMetrics._avg.distance || 0,
      },
      topCouriers: courierStats,
    };
  }

  async getCompanyRoutesReport(companyId: number, filter: ReportFilterDto) {
    const routes = await this.prisma.$queryRaw`
      SELECT 
        pickup_address->>'district' as pickup_district,
        delivery_address->>'district' as delivery_district,
        COUNT(*) as usage_count,
        AVG(delivery_time) as avg_delivery_time,
        AVG(price) as avg_price
      FROM orders
      WHERE company_id = ${companyId}
        AND created_at >= ${filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        AND created_at <= ${filter.endDate ? new Date(filter.endDate) : new Date()}
      GROUP BY pickup_address->>'district', delivery_address->>'district'
      ORDER BY usage_count DESC
      LIMIT 20
    `;

    return {
      topRoutes: routes,
    };
  }

  // Courier Reports
  async getCourierEarningsReport(courierId: number, filter: ReportFilterDto) {
    const where: any = {
      ...this.getDateRange(filter),
      courierId,
      status: OrderStatus.DELIVERED,
    };

    const [totalEarnings, dailyEarnings, monthlyEarnings] = await Promise.all([
      // Total earnings
      this.prisma.order.aggregate({
        where,
        _sum: { courierEarning: true },
        _count: true,
      }),
      // Daily earnings
      this.prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as delivery_count,
          SUM(courier_earning) as earnings
        FROM orders
        WHERE courier_id = ${courierId}
          AND status = 'DELIVERED'
          AND created_at >= ${filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          AND created_at <= ${filter.endDate ? new Date(filter.endDate) : new Date()}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
      // Monthly earnings
      this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as delivery_count,
          SUM(courier_earning) as earnings
        FROM orders
        WHERE courier_id = ${courierId}
          AND status = 'DELIVERED'
          ${filter.startDate ? `AND created_at >= '${filter.startDate}'` : ''}
          ${filter.endDate ? `AND created_at <= '${filter.endDate}'` : ''}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      `,
    ]);

    return {
      summary: {
        totalEarnings: totalEarnings._sum.courierEarning || 0,
        totalDeliveries: totalEarnings._count,
        avgEarningPerDelivery: totalEarnings._count > 0 
          ? (totalEarnings._sum.courierEarning || 0) / totalEarnings._count 
          : 0,
      },
      dailyTrend: dailyEarnings,
      monthlyTrend: monthlyEarnings,
    };
  }

  async getCourierDeliveriesReport(courierId: number, filter: ReportFilterDto) {
    const where: any = {
      ...this.getDateRange(filter),
      courierId,
    };

    const [deliveries, statistics] = await Promise.all([
      // Recent deliveries
      this.prisma.order.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      // Delivery statistics
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: { courierEarning: true },
        _avg: { deliveryTime: true },
      }),
    ]);

    return {
      deliveries,
      statistics: statistics.map(item => ({
        status: item.status,
        count: item._count,
        totalEarnings: item._sum.courierEarning || 0,
        avgDeliveryTime: item._avg.deliveryTime || 0,
      })),
    };
  }

  async getCourierWorkingHoursReport(courierId: number, filter: ReportFilterDto) {
    const workingHours = await this.prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        MIN(created_at) as first_delivery,
        MAX(delivered_at) as last_delivery,
        COUNT(*) as delivery_count,
        EXTRACT(EPOCH FROM (MAX(delivered_at) - MIN(created_at)))/3600 as hours_worked
      FROM orders
      WHERE courier_id = ${courierId}
        AND status = 'DELIVERED'
        AND created_at >= ${filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        AND created_at <= ${filter.endDate ? new Date(filter.endDate) : new Date()}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    return {
      workingDays: workingHours,
    };
  }

  async getCourierCollectionsReport(courierId: number, filter: ReportFilterDto) {
    const collections = await this.prisma.$queryRaw`
      SELECT 
        p.method as payment_method,
        COUNT(*) as collection_count,
        SUM(p.amount) as total_collected
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE o.courier_id = ${courierId}
        AND p.status = 'COMPLETED'
        AND p.method = 'CASH'
        AND p.created_at >= ${filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        AND p.created_at <= ${filter.endDate ? new Date(filter.endDate) : new Date()}
      GROUP BY p.method
    `;

    return {
      cashCollections: collections,
    };
  }
}