import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { UpdatePaymentStatusDto, PaymentFilterDto, CreatePaymentDto } from './dto/payment-management.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: PaymentFilterDto, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.method) where.method = filter.method;
    if (filter.companyId) {
      where.order = {
        companyId: filter.companyId,
      };
    }
    if (filter.courierId) {
      where.order = {
        courierId: filter.courierId,
      };
    }
    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.createdAt.lte = new Date(filter.endDate);
      }
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
              courier: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPending() {
    return this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING,
      },
      include: {
        order: {
          include: {
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
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            company: true,
            courier: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async create(dto: CreatePaymentDto) {
    // Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        amount: dto.amount,
        method: dto.method,
        description: dto.description,
        status: PaymentStatus.PENDING,
      },
      include: {
        order: true,
      },
    });

    return {
      message: 'Ödeme başarıyla oluşturuldu',
      payment,
    };
  }

  async approve(id: number, transactionReference?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.COMPLETED,
        processedAt: new Date(),
        transactionReference,
      },
      include: {
        order: {
          include: {
            company: true,
            courier: true,
          },
        },
      },
    });

    // Update order payment status
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'PAID',
      },
    });

    // TODO: Send payment confirmation notification

    return {
      message: 'Ödeme başarıyla onaylandı',
      payment: updatedPayment,
    };
  }

  async reject(id: number, reason: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.FAILED,
        processedAt: new Date(),
        failureReason: reason,
      },
      include: {
        order: true,
      },
    });

    // Update order payment status
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'FAILED',
      },
    });

    // TODO: Send payment failure notification

    return {
      message: 'Ödeme reddedildi',
      payment: updatedPayment,
    };
  }

  async updateStatus(id: number, dto: UpdatePaymentStatusDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.note && { note: dto.note }),
        ...(dto.transactionReference && { transactionReference: dto.transactionReference }),
        ...(dto.status === PaymentStatus.COMPLETED || dto.status === PaymentStatus.FAILED) && {
          processedAt: new Date(),
        },
      },
      include: {
        order: true,
      },
    });

    // Update order payment status based on payment status
    let orderPaymentStatus = 'PENDING';
    if (dto.status === PaymentStatus.COMPLETED) {
      orderPaymentStatus = 'PAID';
    } else if (dto.status === PaymentStatus.FAILED) {
      orderPaymentStatus = 'FAILED';
    } else if (dto.status === PaymentStatus.REFUNDED) {
      orderPaymentStatus = 'REFUNDED';
    }

    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: orderPaymentStatus as any,
      },
    });

    return {
      message: 'Ödeme durumu güncellendi',
      payment: updatedPayment,
    };
  }

  async refund(id: number, reason: string, amount?: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error('Only completed payments can be refunded');
    }

    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    // Create refund record
    const refundPayment = await this.prisma.payment.create({
      data: {
        orderId: payment.orderId,
        amount: -refundAmount,
        method: payment.method,
        status: PaymentStatus.COMPLETED,
        description: `İade: ${reason}`,
        relatedPaymentId: payment.id,
        processedAt: new Date(),
      },
    });

    // Update original payment status
    await this.prisma.payment.update({
      where: { id },
      data: {
        status: refundAmount === payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
        refundedAmount: {
          increment: refundAmount,
        },
      },
    });

    // Update order payment status
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'REFUNDED',
      },
    });

    // TODO: Send refund notification

    return {
      message: 'Ödeme iade edildi',
      refund: refundPayment,
      refundAmount,
    };
  }

  async getStatistics(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [
      totalPayments,
      pendingPayments,
      completedPayments,
      failedPayments,
      totalAmount,
      pendingAmount,
      completedAmount,
      refundedAmount,
      paymentsByMethod,
      paymentsByStatus,
      recentPayments,
    ] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.COMPLETED } }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.FAILED } }),
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.PENDING },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.REFUNDED },
        _sum: { amount: true },
      }),
      this.prisma.payment.groupBy({
        by: ['method'],
        where,
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.payment.findMany({
        where,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              company: {
                select: { name: true },
              },
            },
          },
        },
      }),
    ]);

    // Calculate commission
    const commissionRate = 0.15; // %15 default commission
    const totalCommission = (completedAmount._sum.amount || 0) * commissionRate;

    return {
      summary: {
        totalPayments,
        pendingPayments,
        completedPayments,
        failedPayments,
        totalAmount: totalAmount._sum.amount || 0,
        pendingAmount: pendingAmount._sum.amount || 0,
        completedAmount: completedAmount._sum.amount || 0,
        refundedAmount: refundedAmount._sum.amount || 0,
        totalCommission,
      },
      byMethod: paymentsByMethod.map(item => ({
        method: item.method,
        count: item._count,
        amount: item._sum.amount || 0,
      })),
      byStatus: paymentsByStatus.map(item => ({
        status: item.status,
        count: item._count,
        amount: item._sum.amount || 0,
      })),
      recentPayments,
    };
  }
}
