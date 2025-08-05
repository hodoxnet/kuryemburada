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
exports.SystemSettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const system_settings_service_1 = require("./system-settings.service");
const system_settings_dto_1 = require("./dto/system-settings.dto");
let SystemSettingsController = class SystemSettingsController {
    systemSettingsService;
    constructor(systemSettingsService) {
        this.systemSettingsService = systemSettingsService;
    }
    async findAll() {
        return this.systemSettingsService.findAll();
    }
    async findOne(key) {
        return this.systemSettingsService.findOne(key);
    }
    async create(dto) {
        return this.systemSettingsService.create(dto);
    }
    async update(key, dto) {
        return this.systemSettingsService.update(key, dto);
    }
    async updateBulk(dto) {
        return this.systemSettingsService.updateBulk(dto);
    }
    async initializeDefaults() {
        return this.systemSettingsService.initializeDefaults();
    }
};
exports.SystemSettingsController = SystemSettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tüm sistem ayarlarını getir' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sistem ayarları getirildi' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':key'),
    (0, swagger_1.ApiOperation)({ summary: 'Belirli bir sistem ayarını getir' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sistem ayarı getirildi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ayar bulunamadı' }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Yeni sistem ayarı oluştur' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sistem ayarı oluşturuldu' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_settings_dto_1.SystemSettingDto]),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':key'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Sistem ayarını güncelle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sistem ayarı güncellendi' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ayar bulunamadı' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, system_settings_dto_1.UpdateSystemSettingDto]),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Toplu sistem ayarlarını güncelle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sistem ayarları güncellendi' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_settings_dto_1.SystemSettingsDto]),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "updateBulk", null);
__decorate([
    (0, common_1.Post)('initialize'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Varsayılan sistem ayarlarını oluştur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Varsayılan ayarlar oluşturuldu' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemSettingsController.prototype, "initializeDefaults", null);
exports.SystemSettingsController = SystemSettingsController = __decorate([
    (0, swagger_1.ApiTags)('Admin - System Settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/system-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    __metadata("design:paramtypes", [system_settings_service_1.SystemSettingsService])
], SystemSettingsController);
//# sourceMappingURL=system-settings.controller.js.map