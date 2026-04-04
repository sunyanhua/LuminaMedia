"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../entities/user.entity");
const customer_profile_entity_1 = require("../../entities/customer-profile.entity");
const data_import_job_entity_1 = require("../../entities/data-import-job.entity");
const customer_segment_entity_1 = require("../../entities/customer-segment.entity");
const user_behavior_entity_1 = require("../data-analytics/entities/user-behavior.entity");
const marketing_campaign_entity_1 = require("../data-analytics/entities/marketing-campaign.entity");
const marketing_strategy_entity_1 = require("../data-analytics/entities/marketing-strategy.entity");
const dashboard_controller_1 = require("./controllers/dashboard.controller");
const dashboard_service_1 = require("./services/dashboard.service");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                customer_profile_entity_1.CustomerProfile,
                data_import_job_entity_1.DataImportJob,
                customer_segment_entity_1.CustomerSegment,
                user_behavior_entity_1.UserBehavior,
                marketing_campaign_entity_1.MarketingCampaign,
                marketing_strategy_entity_1.MarketingStrategy,
            ]),
        ],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService],
        exports: [dashboard_service_1.DashboardService],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map