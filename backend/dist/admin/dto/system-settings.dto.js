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
exports.SystemSettingsDto = exports.UpdateSystemSettingDto = exports.SystemSettingDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SystemSettingDto {
    key;
    value;
    description;
    category;
}
exports.SystemSettingDto = SystemSettingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ayar anahtarı',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SystemSettingDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ayar değeri',
    }),
    __metadata("design:type", Object)
], SystemSettingDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ayar açıklaması',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SystemSettingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ayar kategorisi',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SystemSettingDto.prototype, "category", void 0);
class UpdateSystemSettingDto {
    value;
    description;
}
exports.UpdateSystemSettingDto = UpdateSystemSettingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Ayar değeri',
    }),
    __metadata("design:type", Object)
], UpdateSystemSettingDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Ayar açıklaması',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSystemSettingDto.prototype, "description", void 0);
class SystemSettingsDto {
    commissionRate;
    maxOrderDistance;
    orderTimeout;
    courierAcceptanceTime;
    autoAssignment;
    smsNotifications;
    emailNotifications;
    pushNotifications;
    maintenanceMode;
    maintenanceMessage;
}
exports.SystemSettingsDto = SystemSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Komisyon oranı (%)',
        example: 15,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SystemSettingsDto.prototype, "commissionRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maksimum sipariş mesafesi (km)',
        example: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SystemSettingsDto.prototype, "maxOrderDistance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sipariş timeout süresi (dakika)',
        example: 30,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SystemSettingsDto.prototype, "orderTimeout", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Kurye kabul süresi (dakika)',
        example: 5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SystemSettingsDto.prototype, "courierAcceptanceTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Otomatik atama aktif mi?',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SystemSettingsDto.prototype, "autoAssignment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'SMS bildirimleri aktif mi?',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SystemSettingsDto.prototype, "smsNotifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Email bildirimleri aktif mi?',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SystemSettingsDto.prototype, "emailNotifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Push bildirimleri aktif mi?',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SystemSettingsDto.prototype, "pushNotifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Bakım modu aktif mi?',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SystemSettingsDto.prototype, "maintenanceMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Bakım modu mesajı',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SystemSettingsDto.prototype, "maintenanceMessage", void 0);
//# sourceMappingURL=system-settings.dto.js.map