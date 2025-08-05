"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const companies_controller_1 = require("./companies.controller");
const companies_service_1 = require("./companies.service");
const couriers_controller_1 = require("./couriers.controller");
const couriers_service_1 = require("./couriers.service");
const pricing_controller_1 = require("./pricing.controller");
const pricing_service_1 = require("./pricing.service");
const system_settings_controller_1 = require("./system-settings.controller");
const system_settings_service_1 = require("./system-settings.service");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
const users_controller_1 = require("./users.controller");
const users_service_1 = require("./users.service");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            admin_controller_1.AdminController,
            companies_controller_1.CompaniesController,
            couriers_controller_1.CouriersController,
            pricing_controller_1.PricingController,
            system_settings_controller_1.SystemSettingsController,
            payments_controller_1.PaymentsController,
            users_controller_1.UsersController,
        ],
        providers: [
            admin_service_1.AdminService,
            companies_service_1.CompaniesService,
            couriers_service_1.CouriersService,
            pricing_service_1.PricingService,
            system_settings_service_1.SystemSettingsService,
            payments_service_1.PaymentsService,
            users_service_1.UsersService,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map