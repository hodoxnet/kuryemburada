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
exports.PricingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const pricing_service_1 = require("./pricing.service");
const create_pricing_rule_dto_1 = require("./dto/create-pricing-rule.dto");
let PricingController = class PricingController {
    pricingService;
    constructor(pricingService) {
        this.pricingService = pricingService;
    }
    async findAllRules(type, isActive) {
        return this.pricingService.findAllRules({ type, isActive });
    }
    async findOneRule(id) {
        return this.pricingService.findOneRule(id);
    }
    async createRule(dto) {
        return this.pricingService.createRule(dto);
    }
    async updateRule(id, dto) {
        return this.pricingService.updateRule(id, dto);
    }
    async deleteRule(id) {
        return this.pricingService.deleteRule(id);
    }
    async calculatePrice(dto) {
        return this.pricingService.calculatePrice(dto);
    }
};
exports.PricingController = PricingController;
__decorate([
    (0, common_1.Get)('rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Tüm fiyatlandırma kurallarını listele' }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        enum: [
            'DISTANCE',
            'ZONE',
            'PACKAGE_TYPE',
            'TIME_SLOT',
            'URGENCY',
            'BASE_FEE',
            'MINIMUM_ORDER',
        ],
    }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Fiyatlandırma kuralları listelendi',
    }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "findAllRules", null);
__decorate([
    (0, common_1.Get)('rules/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Fiyatlandırma kuralı detayını getir' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fiyatlandırma kuralı getirildi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kural bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "findOneRule", null);
__decorate([
    (0, common_1.Post)('rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Yeni fiyatlandırma kuralı oluştur' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Fiyatlandırma kuralı oluşturuldu' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pricing_rule_dto_1.CreatePricingRuleDto]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "createRule", null);
__decorate([
    (0, common_1.Put)('rules/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Fiyatlandırma kuralını güncelle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fiyatlandırma kuralı güncellendi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kural bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_pricing_rule_dto_1.UpdatePricingRuleDto]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Delete)('rules/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Fiyatlandırma kuralını sil' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fiyatlandırma kuralı silindi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kural bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "deleteRule", null);
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Fiyat hesapla' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fiyat hesaplandı' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "calculatePrice", null);
exports.PricingController = PricingController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Pricing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/pricing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    __metadata("design:paramtypes", [pricing_service_1.PricingService])
], PricingController);
//# sourceMappingURL=pricing.controller.js.map