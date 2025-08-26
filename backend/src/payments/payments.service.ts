import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentStatus, PaymentMethod, Prisma } from '@prisma/client';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.PaymentWhereInput;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 10, where, orderBy } = params || {};

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
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
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      total,
      skip,
      take,
    };
  }

  async findPendingPayments() {
    return this.findAll({
      where: { status: PaymentStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
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
      throw new NotFoundException(`Ödeme bulunamadı: ${id}`);
    }

    return payment;
  }

  async updateStatus(id: string, updateStatusDto: UpdatePaymentStatusDto) {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new ForbiddenException('Sadece bekleyen ödemeler güncellenebilir');
    }

    const { status, transactionId, refundReason } = updateStatusDto;

    const updatedPayment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id },
        data: {
          status,
          transactionId,
          ...(status === PaymentStatus.COMPLETED ? { paidAt: new Date() } : {}),
          ...(status === PaymentStatus.REFUNDED ? { 
            refundedAt: new Date(),
            refundReason,
          } : {}),
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

      // Ödeme tamamlandıysa
      if (status === PaymentStatus.COMPLETED) {
        // Firma cari durumunu güncelle
        const companyBalance = await tx.companyBalance.findUnique({
          where: { companyId: updated.order.companyId },
        });

        if (companyBalance) {
          await tx.companyBalance.update({
            where: { companyId: updated.order.companyId },
            data: {
              currentBalance: companyBalance.currentBalance - updated.amount,
              totalCredits: companyBalance.totalCredits + updated.amount,
              lastPaymentDate: new Date(),
              lastPaymentAmount: updated.amount,
              updatedAt: new Date(),
            },
          });
        }

        // Günlük mutabakat kaydını güncelle
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reconciliation = await tx.dailyReconciliation.findFirst({
          where: {
            companyId: updated.order.companyId,
            date: today,
          },
        });

        if (reconciliation) {
          await tx.dailyReconciliation.update({
            where: { id: reconciliation.id },
            data: {
              paidAmount: reconciliation.paidAmount + updated.amount,
              status: reconciliation.netAmount <= reconciliation.paidAmount + updated.amount 
                ? 'PAID' 
                : 'PARTIALLY_PAID',
              updatedAt: new Date(),
            },
          });
        }

        // Kurye varsa kurye kazancını güncelle
        if (updated.order.courier) {
          const commission = updated.order.commission || 0;
          const courierEarning = updated.amount - commission;

          await tx.order.update({
            where: { id: updated.orderId },
            data: {
              commission,
              courierEarning,
            },
          });

          await tx.notification.create({
            data: {
              userId: updated.order.courier.userId,
              title: 'Ödeme Onaylandı',
              message: `${updated.order.orderNumber} numaralı sipariş için ${courierEarning} TL kazancınız onaylandı.`,
            },
          });
        }
      }

      await tx.notification.create({
        data: {
          userId: updated.order.company.userId,
          title: status === PaymentStatus.COMPLETED 
            ? 'Ödeme Onaylandı' 
            : status === PaymentStatus.REFUNDED
            ? 'Ödeme İade Edildi'
            : 'Ödeme Başarısız',
          message: status === PaymentStatus.COMPLETED
            ? `${updated.order.orderNumber} numaralı siparişin ödemesi onaylandı.`
            : status === PaymentStatus.REFUNDED
            ? `${updated.order.orderNumber} numaralı siparişin ödemesi iade edildi. ${refundReason || ''}`
            : `${updated.order.orderNumber} numaralı siparişin ödemesi başarısız oldu.`,
        },
      });

      return updated;
    });

    this.logger.info('Ödeme durumu güncellendi', {
      paymentId: id,
      oldStatus: payment.status,
      newStatus: status,
      orderId: payment.orderId,
    });

    return updatedPayment;
  }

  async approvePayment(id: string, transactionId?: string) {
    return this.updateStatus(id, {
      status: PaymentStatus.COMPLETED,
      transactionId,
    });
  }

  async rejectPayment(id: string) {
    return this.updateStatus(id, {
      status: PaymentStatus.FAILED,
    });
  }

  async refundPayment(id: string, refundReason: string) {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new ForbiddenException('Sadece tamamlanmış ödemeler iade edilebilir');
    }

    const refundedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
        refundReason,
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

    this.logger.info('Ödeme iade edildi', {
      paymentId: id,
      orderId: payment.orderId,
      refundReason,
    });

    return refundedPayment;
  }

  async getStatistics() {
    const [
      total,
      pending,
      completed,
      failed,
      refunded,
      totalAmount,
      completedAmount,
      refundedAmount,
    ] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.COMPLETED } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.REFUNDED } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.COMPLETED },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.REFUNDED },
      }),
    ]);

    const methodBreakdown = await this.prisma.payment.groupBy({
      by: ['paymentMethod'],
      _count: true,
      _sum: {
        amount: true,
      },
    });

    return {
      count: {
        total,
        pending,
        completed,
        failed,
        refunded,
      },
      amount: {
        total: totalAmount._sum.amount || 0,
        completed: completedAmount._sum.amount || 0,
        refunded: refundedAmount._sum.amount || 0,
      },
      methodBreakdown,
    };
  }

  async bulkApprove(paymentIds: string[]) {
    const results = await Promise.allSettled(
      paymentIds.map((id) => this.approvePayment(id))
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    this.logger.info('Toplu ödeme onayı', {
      total: paymentIds.length,
      succeeded,
      failed,
    });

    return {
      total: paymentIds.length,
      succeeded,
      failed,
      results,
    };
  }
}