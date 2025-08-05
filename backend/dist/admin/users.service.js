"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filter, page, limit) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filter.role)
            where.role = filter.role;
        if (filter.status)
            where.status = filter.status;
        if (filter.email) {
            where.email = {
                contains: filter.email,
                mode: 'insensitive',
            };
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    emailVerified: true,
                    phoneVerified: true,
                    lastLogin: true,
                    createdAt: true,
                    updatedAt: true,
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
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                emailVerified: true,
                phoneVerified: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                company: true,
                courier: true,
                refreshTokens: {
                    select: {
                        id: true,
                        token: true,
                        expiresAt: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async create(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                role: dto.role,
                status: dto.status || 'PENDING',
            },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });
        return {
            message: 'Kullanıcı başarıyla oluşturuldu',
            user,
        };
    }
    async update(id, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (dto.email && dto.email !== user.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('Email already exists');
            }
        }
        let hashedPassword;
        if (dto.password) {
            hashedPassword = await bcrypt.hash(dto.password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                ...(dto.email && { email: dto.email }),
                ...(hashedPassword && { password: hashedPassword }),
                ...(dto.role && { role: dto.role }),
                ...(dto.status && { status: dto.status }),
            },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                updatedAt: true,
            },
        });
        return {
            message: 'Kullanıcı başarıyla güncellendi',
            user: updatedUser,
        };
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const hasCompany = await this.prisma.company.findUnique({
            where: { userId: id },
        });
        const hasCourier = await this.prisma.courier.findUnique({
            where: { userId: id },
        });
        if (hasCompany || hasCourier) {
            throw new common_1.BadRequestException('User has related data (company or courier). Cannot delete.');
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return {
            message: 'Kullanıcı başarıyla silindi',
        };
    }
    async resetPassword(id, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id },
            data: {
                password: hashedPassword,
            },
        });
        await this.prisma.refreshToken.deleteMany({
            where: { userId: id },
        });
        return {
            message: 'Şifre başarıyla sıfırlandı. Kullanıcı yeniden giriş yapmalı.',
        };
    }
    async getStatistics() {
        const [totalUsers, byRole, byStatus, recentUsers] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            this.prisma.user.groupBy({
                by: ['status'],
                _count: true,
            }),
            this.prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        const [totalCompanies, totalCouriers, pendingCompanies, pendingCouriers] = await Promise.all([
            this.prisma.company.count(),
            this.prisma.courier.count(),
            this.prisma.company.count({
                where: { status: 'PENDING' },
            }),
            this.prisma.courier.count({
                where: { status: 'PENDING' },
            }),
        ]);
        return {
            totalUsers,
            recentUsers,
            byRole: byRole.reduce((acc, item) => {
                acc[item.role] = item._count;
                return acc;
            }, {}),
            byStatus: byStatus.reduce((acc, item) => {
                acc[item.status] = item._count;
                return acc;
            }, {}),
            companies: {
                total: totalCompanies,
                pending: pendingCompanies,
            },
            couriers: {
                total: totalCouriers,
                pending: pendingCouriers,
            },
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map