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
exports.CouriersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const couriers_service_1 = require("./couriers.service");
const update_courier_status_dto_1 = require("./dto/update-courier-status.dto");
let CouriersController = class CouriersController {
    couriersService;
    constructor(couriersService) {
        this.couriersService = couriersService;
    }
    async findAll(status, page = 1, limit = 10) {
        return this.couriersService.findAll({ status, page, limit });
    }
    async findPending() {
        return this.couriersService.findPending();
    }
    async findOne(id) {
        return this.couriersService.findOne(id);
    }
    async approve(id) {
        return this.couriersService.approve(id);
    }
    async reject(id, dto) {
        return this.couriersService.reject(id, dto.rejectionReason);
    }
    async updateStatus(id, dto) {
        return this.couriersService.updateStatus(id, dto);
    }
};
exports.CouriersController = CouriersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tüm kuryeleri listele' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kuryeler başarıyla listelendi' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CouriersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Onay bekleyen kuryeleri listele' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Onay bekleyen kuryeler listelendi',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CouriersController.prototype, "findPending", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Kurye detaylarını getir' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kurye detayları getirildi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kurye bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CouriersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Kurye başvurusunu onayla' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kurye başarıyla onaylandı' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kurye bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CouriersController.prototype, "approve", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Kurye başvurusunu reddet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kurye başarıyla reddedildi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kurye bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CouriersController.prototype, "reject", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Kurye durumunu güncelle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kurye durumu güncellendi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kurye bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_courier_status_dto_1.UpdateCourierStatusDto]),
    __metadata("design:returntype", Promise)
], CouriersController.prototype, "updateStatus", null);
exports.CouriersController = CouriersController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Couriers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/couriers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    __metadata("design:paramtypes", [couriers_service_1.CouriersService])
], CouriersController);
//# sourceMappingURL=couriers.controller.js.map