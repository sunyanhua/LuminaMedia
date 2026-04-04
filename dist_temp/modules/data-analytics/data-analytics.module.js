"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_behavior_entity_1 = require("./entities/user-behavior.entity");
const marketing_campaign_entity_1 = require("./entities/marketing-campaign.entity");
const marketing_strategy_entity_1 = require("./entities/marketing-strategy.entity");
const customer_profile_entity_1 = require("../../entities/customer-profile.entity");
const customer_segment_entity_1 = require("../../entities/customer-segment.entity");
const data_import_job_entity_1 = require("../../entities/data-import-job.entity");
const content_draft_entity_1 = require("../../entities/content-draft.entity");
const government_content_entity_1 = require("../../entities/government-content.entity");
const social_interaction_entity_1 = require("../../entities/social-interaction.entity");
const tenant_entity_1 = require("../../entities/tenant.entity");
const user_behavior_repository_1 = require("../../shared/repositories/user-behavior.repository");
const marketing_campaign_repository_1 = require("../../shared/repositories/marketing-campaign.repository");
const marketing_strategy_repository_1 = require("../../shared/repositories/marketing-strategy.repository");
const customer_profile_repository_1 = require("../../shared/repositories/customer-profile.repository");
const customer_segment_repository_1 = require("../../shared/repositories/customer-segment.repository");
const data_import_job_repository_1 = require("../../shared/repositories/data-import-job.repository");
const content_draft_repository_1 = require("../../shared/repositories/content-draft.repository");
const tenant_context_service_1 = require("../../shared/services/tenant-context.service");
const analytics_service_1 = require("./services/analytics.service");
const marketing_strategy_service_1 = require("./services/marketing-strategy.service");
const mock_data_service_1 = require("./services/mock-data.service");
const report_service_1 = require("./services/report.service");
const gemini_service_1 = require("./services/gemini.service");
const qwen_service_1 = require("./services/qwen.service");
const content_generation_service_1 = require("./services/content-generation.service");
const demo_service_1 = require("./services/demo.service");
const demo_reset_service_1 = require("./services/demo-reset.service");
const user_behavior_controller_1 = require("./controllers/user-behavior.controller");
const marketing_campaign_controller_1 = require("./controllers/marketing-campaign.controller");
const marketing_strategy_controller_1 = require("./controllers/marketing-strategy.controller");
const mock_data_controller_1 = require("./controllers/mock-data.controller");
const report_controller_1 = require("./controllers/report.controller");
const content_generation_controller_1 = require("./controllers/content-generation.controller");
const demo_controller_1 = require("./controllers/demo.controller");
const customer_data_module_1 = require("../customer-data/customer-data.module");
const auth_module_1 = require("../auth/auth.module");
const shared_marketing_module_1 = require("../shared-marketing/shared-marketing.module");
let DataAnalyticsModule = class DataAnalyticsModule {
};
exports.DataAnalyticsModule = DataAnalyticsModule;
exports.DataAnalyticsModule = DataAnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_behavior_entity_1.UserBehavior,
                marketing_campaign_entity_1.MarketingCampaign,
                marketing_strategy_entity_1.MarketingStrategy,
                customer_profile_entity_1.CustomerProfile,
                customer_segment_entity_1.CustomerSegment,
                data_import_job_entity_1.DataImportJob,
                content_draft_entity_1.ContentDraft,
                government_content_entity_1.GovernmentContent,
                social_interaction_entity_1.SocialInteraction,
                tenant_entity_1.Tenant,
                user_behavior_repository_1.UserBehaviorRepository,
                marketing_campaign_repository_1.MarketingCampaignRepository,
                marketing_strategy_repository_1.MarketingStrategyRepository,
                customer_profile_repository_1.CustomerProfileRepository,
                customer_segment_repository_1.CustomerSegmentRepository,
                data_import_job_repository_1.DataImportJobRepository,
                content_draft_repository_1.ContentDraftRepository,
            ]),
            customer_data_module_1.CustomerDataModule,
            auth_module_1.AuthModule,
            shared_marketing_module_1.SharedMarketingModule,
        ],
        controllers: [
            user_behavior_controller_1.UserBehaviorController,
            marketing_campaign_controller_1.MarketingCampaignController,
            marketing_strategy_controller_1.MarketingStrategyController,
            mock_data_controller_1.MockDataController,
            report_controller_1.ReportController,
            content_generation_controller_1.ContentGenerationController,
            demo_controller_1.DemoController,
        ],
        providers: [
            analytics_service_1.AnalyticsService,
            marketing_strategy_service_1.MarketingStrategyService,
            mock_data_service_1.MockDataService,
            report_service_1.ReportService,
            gemini_service_1.GeminiService,
            qwen_service_1.QwenService,
            content_generation_service_1.ContentGenerationService,
            demo_service_1.DemoService,
            demo_reset_service_1.DemoResetService,
            tenant_context_service_1.TenantContextService,
        ],
        exports: [
            analytics_service_1.AnalyticsService,
            marketing_strategy_service_1.MarketingStrategyService,
            mock_data_service_1.MockDataService,
            report_service_1.ReportService,
            gemini_service_1.GeminiService,
            qwen_service_1.QwenService,
            content_generation_service_1.ContentGenerationService,
            demo_service_1.DemoService,
            demo_reset_service_1.DemoResetService,
            typeorm_1.TypeOrmModule.forFeature([
                user_behavior_entity_1.UserBehavior,
                marketing_campaign_entity_1.MarketingCampaign,
                marketing_strategy_entity_1.MarketingStrategy,
                customer_profile_entity_1.CustomerProfile,
                customer_segment_entity_1.CustomerSegment,
                data_import_job_entity_1.DataImportJob,
                content_draft_entity_1.ContentDraft,
                government_content_entity_1.GovernmentContent,
                social_interaction_entity_1.SocialInteraction,
                tenant_entity_1.Tenant,
                user_behavior_repository_1.UserBehaviorRepository,
                marketing_campaign_repository_1.MarketingCampaignRepository,
                marketing_strategy_repository_1.MarketingStrategyRepository,
                customer_profile_repository_1.CustomerProfileRepository,
                customer_segment_repository_1.CustomerSegmentRepository,
                data_import_job_repository_1.DataImportJobRepository,
                content_draft_repository_1.ContentDraftRepository,
            ]),
        ],
    })
], DataAnalyticsModule);
//# sourceMappingURL=data-analytics.module.js.map