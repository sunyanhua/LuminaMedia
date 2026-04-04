"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedMarketingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const marketing_campaign_entity_1 = require("../data-analytics/entities/marketing-campaign.entity");
const marketing_strategy_entity_1 = require("../data-analytics/entities/marketing-strategy.entity");
const marketing_campaign_repository_1 = require("../../shared/repositories/marketing-campaign.repository");
const marketing_strategy_repository_1 = require("../../shared/repositories/marketing-strategy.repository");
let SharedMarketingModule = class SharedMarketingModule {
};
exports.SharedMarketingModule = SharedMarketingModule;
exports.SharedMarketingModule = SharedMarketingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                marketing_campaign_entity_1.MarketingCampaign,
                marketing_strategy_entity_1.MarketingStrategy,
                marketing_campaign_repository_1.MarketingCampaignRepository,
                marketing_strategy_repository_1.MarketingStrategyRepository,
            ])
        ],
        providers: [
            marketing_campaign_repository_1.MarketingCampaignRepository,
            marketing_strategy_repository_1.MarketingStrategyRepository,
        ],
        exports: [
            typeorm_1.TypeOrmModule.forFeature([
                marketing_campaign_entity_1.MarketingCampaign,
                marketing_strategy_entity_1.MarketingStrategy,
                marketing_campaign_repository_1.MarketingCampaignRepository,
                marketing_strategy_repository_1.MarketingStrategyRepository,
            ]),
            marketing_campaign_repository_1.MarketingCampaignRepository,
            marketing_strategy_repository_1.MarketingStrategyRepository,
        ],
    })
], SharedMarketingModule);
//# sourceMappingURL=shared-marketing.module.js.map