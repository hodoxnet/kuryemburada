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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CompaniesService = class CompaniesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const { status, page, limit } = params;
        const skip = (page - 1) * limit;
        const where = status ? { status: status } : {};
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
                status: client_1.CompanyStatus.PENDING,
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Company with ID ${id} not found`);
        }
        return company;
    }
    async approve(id) {
        const company = await this.prisma.company.findUnique({
            where: { id },
        });
        if (!company) {
            throw new common_1.NotFoundException(`Company with ID ${id} not found`);
        }
        const updatedCompany = await this.prisma.company.update({
            where: { id },
            data: {
                status: client_1.CompanyStatus.ACTIVE,
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
            message: 'Firma başarıyla onaylandı',
            company: updatedCompany,
        };
    }
    async reject(id, rejectionReason) {
        const company = await this.prisma.company.findUnique({
            where: { id },
        });
        if (!company) {
            throw new common_1.NotFoundException(`Company with ID ${id} not found`);
        }
        const updatedCompany = await this.prisma.company.update({
            where: { id },
            data: {
                status: client_1.CompanyStatus.REJECTED,
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
        return {
            message: 'Firma başvurusu reddedildi',
            company: updatedCompany,
        };
    }
    async updateStatus(id, dto) {
        const company = await this.prisma.company.findUnique({
            where: { id },
        });
        if (!company) {
            throw new common_1.NotFoundException(`Company with ID ${id} not found`);
        }
        const updatedCompany = await this.prisma.company.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.rejectionReason && { rejectionReason: dto.rejectionReason }),
                ...(dto.status === client_1.CompanyStatus.ACTIVE && { approvedAt: new Date() }),
                ...(dto.status === client_1.CompanyStatus.REJECTED && {
                    rejectionReason: dto.rejectionReason,
                }),
            },
            include: {
                user: true,
            },
        });
        let userStatus = 'ACTIVE';
        if (dto.status === client_1.CompanyStatus.SUSPENDED ||
            dto.status === client_1.CompanyStatus.REJECTED) {
            userStatus = 'SUSPENDED';
        }
        else if (dto.status === client_1.CompanyStatus.INACTIVE) {
            userStatus = 'INACTIVE';
        }
        await this.prisma.user.update({
            where: { id: company.userId },
            data: { status: userStatus },
        });
        return {
            message: 'Firma durumu güncellendi',
            company: updatedCompany,
        };
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map