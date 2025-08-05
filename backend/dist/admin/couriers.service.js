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
exports.CouriersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CouriersService = class CouriersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const { status, page, limit } = params;
        const skip = (page - 1) * limit;
        const where = status ? { status: status } : {};
        const [couriers, total] = await Promise.all([
            this.prisma.courier.findMany({
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
                    vehicle: true,
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
            this.prisma.courier.count({ where }),
        ]);
        return {
            data: couriers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findPending() {
        return this.prisma.courier.findMany({
            where: {
                status: client_1.CourierStatus.PENDING,
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
                vehicle: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async findOne(id) {
        const courier = await this.prisma.courier.findUnique({
            where: { id },
            include: {
                user: true,
                documents: true,
                vehicle: true,
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
        if (!courier) {
            throw new common_1.NotFoundException(`Courier with ID ${id} not found`);
        }
        return courier;
    }
    async approve(id) {
        const courier = await this.prisma.courier.findUnique({
            where: { id },
        });
        if (!courier) {
            throw new common_1.NotFoundException(`Courier with ID ${id} not found`);
        }
        const updatedCourier = await this.prisma.courier.update({
            where: { id },
            data: {
                status: client_1.CourierStatus.ACTIVE,
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
        return {
            message: 'Kurye başarıyla onaylandı',
            courier: updatedCourier,
        };
    }
    async reject(id, rejectionReason) {
        const courier = await this.prisma.courier.findUnique({
            where: { id },
        });
        if (!courier) {
            throw new common_1.NotFoundException(`Courier with ID ${id} not found`);
        }
        const updatedCourier = await this.prisma.courier.update({
            where: { id },
            data: {
                status: client_1.CourierStatus.REJECTED,
                rejectionReason,
                rejectedAt: new Date(),
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
        return {
            message: 'Kurye başvurusu reddedildi',
            courier: updatedCourier,
        };
    }
    async updateStatus(id, dto) {
        const courier = await this.prisma.courier.findUnique({
            where: { id },
        });
        if (!courier) {
            throw new common_1.NotFoundException(`Courier with ID ${id} not found`);
        }
        const updatedCourier = await this.prisma.courier.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.rejectionReason && { rejectionReason: dto.rejectionReason }),
                ...(dto.status === client_1.CourierStatus.ACTIVE && { approvedAt: new Date() }),
                ...(dto.status === client_1.CourierStatus.REJECTED && {
                    rejectedAt: new Date(),
                }),
            },
            include: {
                user: true,
            },
        });
        let userStatus = 'ACTIVE';
        if (dto.status === client_1.CourierStatus.SUSPENDED ||
            dto.status === client_1.CourierStatus.REJECTED) {
            userStatus = 'SUSPENDED';
        }
        else if (dto.status === client_1.CourierStatus.INACTIVE) {
            userStatus = 'INACTIVE';
        }
        await this.prisma.user.update({
            where: { id: courier.userId },
            data: { status: userStatus },
        });
        return {
            message: 'Kurye durumu güncellendi',
            courier: updatedCourier,
        };
    }
};
exports.CouriersService = CouriersService;
exports.CouriersService = CouriersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CouriersService);
//# sourceMappingURL=couriers.service.js.map