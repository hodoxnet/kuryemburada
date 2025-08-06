"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filter, page, limit) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filter.status)
            where.status = filter.status;
        if (filter.method)
            where.paymentMethod = filter.method;
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
                status: client_1.PaymentStatus.PENDING,
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }
    async create(dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${dto.orderId} not found`);
        }
        const payment = await this.prisma.payment.create({
            data: {
                orderId: dto.orderId,
                amount: dto.amount,
                paymentMethod: dto.method,
                status: client_1.PaymentStatus.PENDING,
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
    async approve(id, transactionReference) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        const updatedPayment = await this.prisma.payment.update({
            where: { id },
            data: {
                status: client_1.PaymentStatus.COMPLETED,
                processedAt: new Date(),
                transactionId: transactionReference,
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
        await this.prisma.order.update({
            where: { id: payment.orderId },
            data: {
                paymentStatus: 'PAID',
            },
        });
        return {
            message: 'Ödeme başarıyla onaylandı',
            payment: updatedPayment,
        };
    }
    async reject(id, reason) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        const updatedPayment = await this.prisma.payment.update({
            where: { id },
            data: {
                status: client_1.PaymentStatus.FAILED,
                processedAt: new Date(),
            },
            include: {
                order: true,
            },
        });
        await this.prisma.order.update({
            where: { id: payment.orderId },
            data: {
                paymentStatus: 'FAILED',
            },
        });
        return {
            message: 'Ödeme reddedildi',
            payment: updatedPayment,
        };
    }
    async updateStatus(id, dto) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        const updatedPayment = await this.prisma.payment.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.transactionReference && { transactionId: dto.transactionReference }),
                ...(dto.status === client_1.PaymentStatus.COMPLETED || dto.status === client_1.PaymentStatus.FAILED) && {
                    processedAt: new Date(),
                },
            },
            include: {
                order: true,
            },
        });
        let orderPaymentStatus = 'PENDING';
        if (dto.status === client_1.PaymentStatus.COMPLETED) {
            orderPaymentStatus = 'PAID';
        }
        else if (dto.status === client_1.PaymentStatus.FAILED) {
            orderPaymentStatus = 'FAILED';
        }
        else if (dto.status === client_1.PaymentStatus.REFUNDED) {
            orderPaymentStatus = 'REFUNDED';
        }
        await this.prisma.order.update({
            where: { id: payment.orderId },
            data: {
                paymentStatus: orderPaymentStatus,
            },
        });
        return {
            message: 'Ödeme durumu güncellendi',
            payment: updatedPayment,
        };
    }
    async refund(id, reason, amount) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        if (payment.status !== client_1.PaymentStatus.COMPLETED) {
            throw new Error('Only completed payments can be refunded');
        }
        const refundAmount = amount || payment.amount;
        if (refundAmount > payment.amount) {
            throw new Error('Refund amount cannot exceed payment amount');
        }
        const refundPayment = await this.prisma.payment.create({
            data: {
                orderId: payment.orderId,
                amount: -refundAmount,
                paymentMethod: payment.paymentMethod,
                status: client_1.PaymentStatus.COMPLETED,
                processedAt: new Date(),
            },
        });
        await this.prisma.payment.update({
            where: { id },
            data: {
                status: refundAmount === payment.amount ? client_1.PaymentStatus.REFUNDED : client_1.PaymentStatus.PARTIALLY_REFUNDED,
                refundAmount: refundAmount,
                refundedAt: new Date(),
            },
        });
        await this.prisma.order.update({
            where: { id: payment.orderId },
            data: {
                paymentStatus: 'REFUNDED',
            },
        });
        return {
            message: 'Ödeme iade edildi',
            refund: refundPayment,
            refundAmount,
        };
    }
    async getStatistics(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }
        const [totalPayments, pendingPayments, completedPayments, failedPayments, totalAmount, pendingAmount, completedAmount, refundedAmount, paymentsByMethod, paymentsByStatus, recentPayments,] = await Promise.all([
            this.prisma.payment.count({ where }),
            this.prisma.payment.count({ where: { ...where, status: client_1.PaymentStatus.PENDING } }),
            this.prisma.payment.count({ where: { ...where, status: client_1.PaymentStatus.COMPLETED } }),
            this.prisma.payment.count({ where: { ...where, status: client_1.PaymentStatus.FAILED } }),
            this.prisma.payment.aggregate({
                where,
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { ...where, status: client_1.PaymentStatus.PENDING },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { ...where, status: client_1.PaymentStatus.COMPLETED },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { ...where, status: client_1.PaymentStatus.REFUNDED },
                _sum: { amount: true },
            }),
            this.prisma.payment.groupBy({
                by: ['paymentMethod'],
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
        const commissionRate = 0.15;
        const completedAmountValue = completedAmount._sum.amount || 0;
        const totalCommission = Number(completedAmountValue) * commissionRate;
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
                method: item.paymentMethod,
                count: item._count,
                amount: item._sum?.amount || 0,
            })),
            byStatus: paymentsByStatus.map(item => ({
                status: item.status,
                count: item._count,
                amount: item._sum.amount || 0,
            })),
            recentPayments,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map