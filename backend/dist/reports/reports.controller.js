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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const reports_service_1 = require("./reports.service");
const report_filter_dto_1 = require("./dto/report-filter.dto");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getAdminOverview(filter) {
        return this.reportsService.getAdminOverview(filter);
    }
    async getAdminOrderReport(filter) {
        return this.reportsService.getAdminOrderReport(filter);
    }
    async getAdminRevenueReport(filter) {
        return this.reportsService.getAdminRevenueReport(filter);
    }
    async getAdminPerformanceReport(filter) {
        return this.reportsService.getAdminPerformanceReport(filter);
    }
    async getAdminRegionalReport(filter) {
        return this.reportsService.getAdminRegionalReport(filter);
    }
    async getCompanyOrderReport(req, filter) {
        const companyId = await this.reportsService.getCompanyIdFromUser(req.user.id);
        return this.reportsService.getCompanyOrderReport(companyId, filter);
    }
    async getCompanyExpenseReport(req, filter) {
        const companyId = await this.reportsService.getCompanyIdFromUser(req.user.id);
        return this.reportsService.getCompanyExpenseReport(companyId, filter);
    }
    async getCompanyPerformanceReport(req, filter) {
        const companyId = await this.reportsService.getCompanyIdFromUser(req.user.id);
        return this.reportsService.getCompanyPerformanceReport(companyId, filter);
    }
    async getCompanyRoutesReport(req, filter) {
        const companyId = await this.reportsService.getCompanyIdFromUser(req.user.id);
        return this.reportsService.getCompanyRoutesReport(companyId, filter);
    }
    async getCourierEarningsReport(req, filter) {
        const courierId = await this.reportsService.getCourierIdFromUser(req.user.id);
        return this.reportsService.getCourierEarningsReport(courierId, filter);
    }
    async getCourierDeliveriesReport(req, filter) {
        const courierId = await this.reportsService.getCourierIdFromUser(req.user.id);
        return this.reportsService.getCourierDeliveriesReport(courierId, filter);
    }
    async getCourierWorkingHoursReport(req, filter) {
        const courierId = await this.reportsService.getCourierIdFromUser(req.user.id);
        return this.reportsService.getCourierWorkingHoursReport(courierId, filter);
    }
    async getCourierCollectionsReport(req, filter) {
        const courierId = await this.reportsService.getCourierIdFromUser(req.user.id);
        return this.reportsService.getCourierCollectionsReport(courierId, filter);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('admin/overview'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin genel özet raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rapor başarıyla oluşturuldu' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAdminOverview", null);
__decorate([
    (0, common_1.Get)('admin/orders'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin sipariş raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'companyId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'courierId', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sipariş raporu oluşturuldu' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAdminOrderReport", null);
__decorate([
    (0, common_1.Get)('admin/revenue'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin gelir raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Gelir raporu oluşturuldu' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAdminRevenueReport", null);
__decorate([
    (0, common_1.Get)('admin/performance'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin performans raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'companyId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'courierId', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performans raporu oluşturuldu' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAdminPerformanceReport", null);
__decorate([
    (0, common_1.Get)('admin/regional'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin bölgesel analiz raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'region', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bölgesel analiz raporu oluşturuldu' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAdminRegionalReport", null);
__decorate([
    (0, common_1.Get)('company/orders'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COMPANY),
    (0, swagger_1.ApiOperation)({ summary: 'Firma sipariş raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sipariş raporu oluşturuldu' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCompanyOrderReport", null);
__decorate([
    (0, common_1.Get)('company/expenses'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COMPANY),
    (0, swagger_1.ApiOperation)({ summary: 'Firma harcama raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Harcama raporu oluşturuldu' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCompanyExpenseReport", null);
__decorate([
    (0, common_1.Get)('company/performance'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COMPANY),
    (0, swagger_1.ApiOperation)({ summary: 'Firma teslimat performans raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performans raporu oluşturuldu' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCompanyPerformanceReport", null);
__decorate([
    (0, common_1.Get)('company/routes'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COMPANY),
    (0, swagger_1.ApiOperation)({ summary: 'Firma en çok kullanılan güzergahlar raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Güzergah raporu oluşturuldu' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCompanyRoutesReport", null);
__decorate([
    (0, common_1.Get)('courier/earnings'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COURIER),
    (0, swagger_1.ApiOperation)({ summary: 'Kurye kazanç raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kazanç raporu oluşturuldu' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCourierEarningsReport", null);
__decorate([
    (0, common_1.Get)('courier/deliveries'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COURIER),
    (0, swagger_1.ApiOperation)({ summary: 'Kurye teslimat raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Teslimat raporu oluşturuldu' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCourierDeliveriesReport", null);
__decorate([
    (0, common_1.Get)('courier/working-hours'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COURIER),
    (0, swagger_1.ApiOperation)({ summary: 'Kurye çalışma saatleri raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Çalışma saatleri raporu oluşturuldu' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCourierWorkingHoursReport", null);
__decorate([
    (0, common_1.Get)('courier/collections'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COURIER),
    (0, swagger_1.ApiOperation)({ summary: 'Kurye tahsilat raporu' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tahsilat raporu oluşturuldu' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, report_filter_dto_1.ReportFilterDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getCourierCollectionsReport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map