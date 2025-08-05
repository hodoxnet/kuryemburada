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
exports.ReportFilterDto = exports.ReportPeriod = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ReportPeriod;
(function (ReportPeriod) {
    ReportPeriod["DAILY"] = "DAILY";
    ReportPeriod["WEEKLY"] = "WEEKLY";
    ReportPeriod["MONTHLY"] = "MONTHLY";
    ReportPeriod["YEARLY"] = "YEARLY";
    ReportPeriod["CUSTOM"] = "CUSTOM";
})(ReportPeriod || (exports.ReportPeriod = ReportPeriod = {}));
class ReportFilterDto {
    startDate;
    endDate;
    period;
    companyId;
    courierId;
    region;
}
exports.ReportFilterDto = ReportFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Başlangıç tarihi'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReportFilterDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Bitiş tarihi'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReportFilterDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ReportPeriod,
        description: 'Rapor periyodu'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ReportPeriod),
    __metadata("design:type", String)
], ReportFilterDto.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Firma ID (admin için)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReportFilterDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Kurye ID (admin için)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReportFilterDto.prototype, "courierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Bölge/Şehir filtresi'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportFilterDto.prototype, "region", void 0);
//# sourceMappingURL=report-filter.dto.js.map