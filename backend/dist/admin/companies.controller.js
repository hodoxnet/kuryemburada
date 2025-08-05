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
exports.CompaniesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const companies_service_1 = require("./companies.service");
const update_company_status_dto_1 = require("./dto/update-company-status.dto");
let CompaniesController = class CompaniesController {
    companiesService;
    constructor(companiesService) {
        this.companiesService = companiesService;
    }
    async findAll(status, page = 1, limit = 10) {
        return this.companiesService.findAll({ status, page, limit });
    }
    async findPending() {
        return this.companiesService.findPending();
    }
    async findOne(id) {
        return this.companiesService.findOne(id);
    }
    async approve(id) {
        return this.companiesService.approve(id);
    }
    async reject(id, dto) {
        return this.companiesService.reject(id, dto.rejectionReason);
    }
    async updateStatus(id, dto) {
        return this.companiesService.updateStatus(id, dto);
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tüm firmaları listele' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Firmalar başarıyla listelendi' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Onay bekleyen firmaları listele' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Onay bekleyen firmalar listelendi',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "findPending", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Firma detaylarını getir' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Firma detayları getirildi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Firma bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Firma başvurusunu onayla' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Firma başarıyla onaylandı' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Firma bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "approve", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Firma başvurusunu reddet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Firma başarıyla reddedildi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Firma bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "reject", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Firma durumunu güncelle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Firma durumu güncellendi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Firma bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_company_status_dto_1.UpdateCompanyStatusDto]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "updateStatus", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Companies'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/companies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService])
], CompaniesController);
//# sourceMappingURL=companies.controller.js.map