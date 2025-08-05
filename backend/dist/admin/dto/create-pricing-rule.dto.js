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
exports.UpdatePricingRuleDto = exports.CreatePricingRuleDto = exports.PricingRuleType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var PricingRuleType;
(function (PricingRuleType) {
    PricingRuleType["DISTANCE"] = "DISTANCE";
    PricingRuleType["ZONE"] = "ZONE";
    PricingRuleType["PACKAGE_TYPE"] = "PACKAGE_TYPE";
    PricingRuleType["TIME_SLOT"] = "TIME_SLOT";
    PricingRuleType["URGENCY"] = "URGENCY";
    PricingRuleType["BASE_FEE"] = "BASE_FEE";
    PricingRuleType["MINIMUM_ORDER"] = "MINIMUM_ORDER";
})(PricingRuleType || (exports.PricingRuleType = PricingRuleType = {}));
class CreatePricingRuleDto {
    name;
    type;
    parameters;
    priority;
    isActive;
}
exports.CreatePricingRuleDto = CreatePricingRuleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fiyatlama kuralı adı',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: PricingRuleType,
        description: 'Kural tipi',
    }),
    (0, class_validator_1.IsEnum)(PricingRuleType),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Kural parametreleri',
        example: {
            pricePerKm: 5.5,
            minimumDistance: 0,
            maximumDistance: 100,
        },
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreatePricingRuleDto.prototype, "parameters", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Öncelik sırası',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePricingRuleDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Kural aktif mi?',
        default: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePricingRuleDto.prototype, "isActive", void 0);
class UpdatePricingRuleDto {
    name;
    parameters;
    priority;
    isActive;
}
exports.UpdatePricingRuleDto = UpdatePricingRuleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fiyatlama kuralı adı',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePricingRuleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Kural parametreleri',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdatePricingRuleDto.prototype, "parameters", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Öncelik sırası',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePricingRuleDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Kural aktif mi?',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePricingRuleDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-pricing-rule.dto.js.map