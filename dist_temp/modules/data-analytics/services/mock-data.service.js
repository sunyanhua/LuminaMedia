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
exports.MockDataService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_behavior_repository_1 = require("../../../shared/repositories/user-behavior.repository");
const marketing_campaign_repository_1 = require("../../../shared/repositories/marketing-campaign.repository");
const marketing_strategy_repository_1 = require("../../../shared/repositories/marketing-strategy.repository");
const tenant_context_service_1 = require("../../../shared/services/tenant-context.service");
const user_behavior_event_enum_1 = require("../../../shared/enums/user-behavior-event.enum");
const campaign_type_enum_1 = require("../../../shared/enums/campaign-type.enum");
const campaign_status_enum_1 = require("../../../shared/enums/campaign-status.enum");
const strategy_type_enum_1 = require("../../../shared/enums/strategy-type.enum");
const generation_method_enum_1 = require("../../../shared/enums/generation-method.enum");
let MockDataService = class MockDataService {
    userBehaviorRepository;
    campaignRepository;
    strategyRepository;
    constructor(userBehaviorRepository, campaignRepository, strategyRepository) {
        this.userBehaviorRepository = userBehaviorRepository;
        this.campaignRepository = campaignRepository;
        this.strategyRepository = strategyRepository;
    }
    async generateMockData(userId) {
        const campaigns = await this.generateMockCampaigns(userId);
        const behaviors = await this.generateMockBehaviors(userId);
        const strategies = await this.generateMockStrategies(campaigns);
        return {
            behaviors,
            campaigns: campaigns.length,
            strategies,
        };
    }
    async generateMockCampaigns(userId) {
        const tenantId = tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
        const campaignTemplates = [
            {
                name: '小红书春季美妆推广',
                campaignType: campaign_type_enum_1.CampaignType.ONLINE,
                targetAudience: {
                    ageRange: [18, 35],
                    gender: 'female',
                    interests: ['美妆', '护肤', '时尚'],
                    platforms: ['小红书'],
                },
                budget: 50000,
                status: campaign_status_enum_1.CampaignStatus.ACTIVE,
                startDate: new Date('2024-03-01'),
                endDate: new Date('2024-06-30'),
            },
            {
                name: '微信公众号内容矩阵建设',
                campaignType: campaign_type_enum_1.CampaignType.ONLINE,
                targetAudience: {
                    ageRange: [25, 45],
                    gender: 'both',
                    interests: ['科技', '商业', '职场'],
                    platforms: ['微信公众号'],
                },
                budget: 30000,
                status: campaign_status_enum_1.CampaignStatus.ACTIVE,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
            },
            {
                name: '线上线下混合新品发布会',
                campaignType: campaign_type_enum_1.CampaignType.HYBRID,
                targetAudience: {
                    ageRange: [20, 40],
                    gender: 'both',
                    interests: ['数码', '科技'],
                    platforms: ['小红书', '微信公众号', '线下'],
                },
                budget: 100000,
                status: campaign_status_enum_1.CampaignStatus.DRAFT,
                startDate: new Date('2024-04-01'),
                endDate: new Date('2024-04-15'),
            },
            {
                name: '品牌形象提升活动',
                campaignType: campaign_type_enum_1.CampaignType.OFFLINE,
                targetAudience: {
                    ageRange: [30, 50],
                    gender: 'both',
                    interests: ['商务', '高端消费'],
                    platforms: ['线下活动'],
                },
                budget: 80000,
                status: campaign_status_enum_1.CampaignStatus.COMPLETED,
                startDate: new Date('2024-01-15'),
                endDate: new Date('2024-02-28'),
            },
        ];
        const campaigns = [];
        for (const template of campaignTemplates) {
            const campaign = this.campaignRepository.create({
                userId,
                tenantId,
                ...template,
            });
            const savedCampaign = await this.campaignRepository.save(campaign);
            campaigns.push(savedCampaign);
        }
        return campaigns;
    }
    async generateMockBehaviors(userId) {
        const tenantId = tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
        const events = Object.values(user_behavior_event_enum_1.UserBehaviorEvent);
        const sessionCount = 8;
        const days = 30;
        let totalEvents = 0;
        for (let day = days; day >= 0; day--) {
            const date = new Date();
            date.setDate(date.getDate() - day);
            const dailySessions = Math.floor(Math.random() * 3) + 1;
            for (let session = 0; session < dailySessions; session++) {
                const sessionId = `session_${userId}_${date.toISOString().split('T')[0]}_${session}`;
                const sessionEvents = Math.floor(Math.random() * 8) + 3;
                for (let i = 0; i < sessionEvents; i++) {
                    const eventType = events[Math.floor(Math.random() * events.length)];
                    const hour = Math.floor(Math.random() * 12) + 8;
                    const minute = Math.floor(Math.random() * 60);
                    const timestamp = new Date(date);
                    timestamp.setHours(hour, minute, Math.floor(Math.random() * 60));
                    const eventData = {};
                    if (eventType === user_behavior_event_enum_1.UserBehaviorEvent.PAGE_VIEW) {
                        eventData.page = ['/dashboard', '/analytics', '/campaigns'][Math.floor(Math.random() * 3)];
                        eventData.duration = Math.floor(Math.random() * 120) + 30;
                    }
                    else if (eventType === user_behavior_event_enum_1.UserBehaviorEvent.CONTENT_CREATE) {
                        eventData.contentType = ['article', 'video', 'image'][Math.floor(Math.random() * 3)];
                        eventData.length = Math.floor(Math.random() * 1000) + 500;
                    }
                    const behavior = this.userBehaviorRepository.create({
                        userId,
                        tenantId,
                        sessionId,
                        eventType,
                        eventData,
                        timestamp,
                    });
                    await this.userBehaviorRepository.save(behavior);
                    totalEvents++;
                }
            }
        }
        return totalEvents;
    }
    async generateMockStrategies(campaigns) {
        const tenantId = tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
        let totalStrategies = 0;
        const strategyTypes = Object.values(strategy_type_enum_1.StrategyType);
        for (const campaign of campaigns) {
            const strategyCount = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < strategyCount; i++) {
                const strategyType = strategyTypes[Math.floor(Math.random() * strategyTypes.length)];
                const strategyTemplates = {
                    [strategy_type_enum_1.StrategyType.CONTENT]: {
                        description: `为${campaign.name}制定的内容策略`,
                        implementationPlan: {
                            focus: ['用户故事', '产品教程', '行业洞察'],
                            frequency: '每周2-3篇',
                            format: ['图文', '短视频', '长文章'],
                        },
                        expectedROI: 25 + Math.random() * 25,
                        confidenceScore: 70 + Math.floor(Math.random() * 25),
                    },
                    [strategy_type_enum_1.StrategyType.CHANNEL]: {
                        description: `${campaign.name}的渠道分配策略`,
                        implementationPlan: {
                            primaryChannel: '小红书',
                            secondaryChannels: ['微信公众号', '微博'],
                            budgetSplit: {
                                primary: 60,
                                secondary: 40,
                            },
                        },
                        expectedROI: 30 + Math.random() * 20,
                        confidenceScore: 75 + Math.floor(Math.random() * 20),
                    },
                    [strategy_type_enum_1.StrategyType.TIMING]: {
                        description: `${campaign.name}的最佳发布时间策略`,
                        implementationPlan: {
                            bestDays: ['周一', '周三', '周五'],
                            bestHours: ['09:00-11:00', '19:00-21:00'],
                            seasonalAdjustments: true,
                        },
                        expectedROI: 20 + Math.random() * 15,
                        confidenceScore: 65 + Math.floor(Math.random() * 20),
                    },
                    [strategy_type_enum_1.StrategyType.BUDGET_ALLOCATION]: {
                        description: `${campaign.name}的预算优化策略`,
                        implementationPlan: {
                            monthlyAllocation: campaign.budget / 12,
                            contingency: 10,
                            performanceBasedAdjustment: true,
                        },
                        expectedROI: 35 + Math.random() * 15,
                        confidenceScore: 80 + Math.floor(Math.random() * 15),
                    },
                };
                const template = strategyTemplates[strategyType];
                const strategy = this.strategyRepository.create({
                    campaignId: campaign.id,
                    tenantId,
                    strategyType,
                    description: template.description,
                    implementationPlan: template.implementationPlan,
                    expectedROI: template.expectedROI,
                    confidenceScore: template.confidenceScore,
                    generatedBy: generation_method_enum_1.GenerationMethod.AI_GENERATED,
                });
                await this.strategyRepository.save(strategy);
                totalStrategies++;
            }
        }
        return totalStrategies;
    }
    async resetMockData(userId) {
        const tenantId = tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
        let totalDeleted = 0;
        if (userId) {
            const behaviorResult = await this.userBehaviorRepository.delete({
                userId,
                tenantId,
            });
            const campaignResult = await this.campaignRepository.delete({
                userId,
                tenantId,
            });
            totalDeleted =
                (behaviorResult.affected || 0) + (campaignResult.affected || 0);
        }
        else {
            const behaviorResult = await this.userBehaviorRepository.delete({
                tenantId,
            });
            const campaignResult = await this.campaignRepository.delete({ tenantId });
            const strategyResult = await this.strategyRepository.delete({ tenantId });
            totalDeleted =
                (behaviorResult.affected || 0) +
                    (campaignResult.affected || 0) +
                    (strategyResult.affected || 0);
        }
        return { deleted: totalDeleted };
    }
    async getMockDataStatus() {
        const [totalBehaviors, totalCampaigns, totalStrategies] = await Promise.all([
            this.userBehaviorRepository.count(),
            this.campaignRepository.count(),
            this.strategyRepository.count(),
        ]);
        return {
            totalBehaviors,
            totalCampaigns,
            totalStrategies,
        };
    }
};
exports.MockDataService = MockDataService;
exports.MockDataService = MockDataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_behavior_repository_1.UserBehaviorRepository)),
    __param(1, (0, typeorm_1.InjectRepository)(marketing_campaign_repository_1.MarketingCampaignRepository)),
    __param(2, (0, typeorm_1.InjectRepository)(marketing_strategy_repository_1.MarketingStrategyRepository)),
    __metadata("design:paramtypes", [user_behavior_repository_1.UserBehaviorRepository,
        marketing_campaign_repository_1.MarketingCampaignRepository,
        marketing_strategy_repository_1.MarketingStrategyRepository])
], MockDataService);
//# sourceMappingURL=mock-data.service.js.map