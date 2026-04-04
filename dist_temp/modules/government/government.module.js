"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernmentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const government_content_entity_1 = require("../../entities/government-content.entity");
const social_interaction_entity_1 = require("../../entities/social-interaction.entity");
const customer_profile_entity_1 = require("../../entities/customer-profile.entity");
const marketing_campaign_entity_1 = require("../data-analytics/entities/marketing-campaign.entity");
const marketing_strategy_entity_1 = require("../data-analytics/entities/marketing-strategy.entity");
const content_draft_entity_1 = require("../../entities/content-draft.entity");
const marketing_campaign_repository_1 = require("../../shared/repositories/marketing-campaign.repository");
const marketing_strategy_repository_1 = require("../../shared/repositories/marketing-strategy.repository");
const government_demo_service_1 = require("./services/government-demo.service");
const auth_module_1 = require("../auth/auth.module");
const shared_marketing_module_1 = require("../shared-marketing/shared-marketing.module");
let GovernmentModule = class GovernmentModule {
};
exports.GovernmentModule = GovernmentModule;
exports.GovernmentModule = GovernmentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                government_content_entity_1.GovernmentContent,
                social_interaction_entity_1.SocialInteraction,
                customer_profile_entity_1.CustomerProfile,
                marketing_campaign_entity_1.MarketingCampaign,
                marketing_strategy_entity_1.MarketingStrategy,
                content_draft_entity_1.ContentDraft,
                marketing_campaign_repository_1.MarketingCampaignRepository,
                marketing_strategy_repository_1.MarketingStrategyRepository,
            ]),
            auth_module_1.AuthModule,
            shared_marketing_module_1.SharedMarketingModule,
        ],
        providers: [
            government_demo_service_1.GovernmentDemoService,
            marketing_campaign_repository_1.MarketingCampaignRepository,
            marketing_strategy_repository_1.MarketingStrategyRepository,
        ],
        exports: [
            government_demo_service_1.GovernmentDemoService,
        ],
    })
], GovernmentModule);
//# sourceMappingURL=government.module.js.map