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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const payments_service_1 = require("./payments.service");
const payment_management_dto_1 = require("./dto/payment-management.dto");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async findAll(filter, page = 1, limit = 10) {
        return this.paymentsService.findAll(filter, page, limit);
    }
    async findPending() {
        return this.paymentsService.findPending();
    }
    async getStatistics(startDate, endDate) {
        return this.paymentsService.getStatistics(startDate, endDate);
    }
    async findOne(id) {
        return this.paymentsService.findOne(id);
    }
    async create(dto) {
        return this.paymentsService.create(dto);
    }
    async approve(id, dto) {
        return this.paymentsService.approve(id, dto.transactionReference);
    }
    async reject(id, dto) {
        return this.paymentsService.reject(id, dto.reason);
    }
    async updateStatus(id, dto) {
        return this.paymentsService.updateStatus(id, dto);
    }
    async refund(id, dto) {
        return this.paymentsService.refund(id, dto.reason, dto.amount);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tüm ödemeleri listele' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'] }),
    (0, swagger_1.ApiQuery)({ name: 'method', required: false, enum: ['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'WALLET'] }),
    (0, swagger_1.ApiQuery)({ name: 'companyId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'courierId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ödemeler listelendi' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_management_dto_1.PaymentFilterDto, Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Onay bekleyen ödemeleri listele' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Onay bekleyen ödemeler listelendi' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findPending", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Ödeme istatistiklerini getir' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'İstatistikler getirildi' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Ödeme detaylarını getir' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ödeme detayları getirildi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ödeme bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Yeni ödeme oluştur' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ödeme oluşturuldu' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_management_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Ödemeyi onayla' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ödeme onaylandı' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ödeme bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "approve", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Ödemeyi reddet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ödeme reddedildi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ödeme bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "reject", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Ödeme durumunu güncelle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ödeme durumu güncellendi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ödeme bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, payment_management_dto_1.UpdatePaymentStatusDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Ödemeyi iade et' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ödeme iade edildi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ödeme bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refund", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map