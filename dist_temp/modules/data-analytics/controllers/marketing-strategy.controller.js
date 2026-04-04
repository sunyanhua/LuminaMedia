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
exports.MarketingStrategyController = void 0;
const common_1 = require("@nestjs/common");
const marketing_strategy_service_1 = require("../services/marketing-strategy.service");
const content_generation_service_1 = require("../services/content-generation.service");
const generate_strategy_dto_1 = require("../dto/generate-strategy.dto");
const generate_strategy_content_dto_1 = require("../dto/generate-strategy-content.dto");
const platform_enum_1 = require("../../../shared/enums/platform.enum");
let MarketingStrategyController = class MarketingStrategyController {
    marketingStrategyService;
    contentGenerationService;
    constructor(marketingStrategyService, contentGenerationService) {
        this.marketingStrategyService = marketingStrategyService;
        this.contentGenerationService = contentGenerationService;
    }
    async generateStrategy(generateStrategyDto) {
        const result = await this.marketingStrategyService.generateStrategy(generateStrategyDto.campaignId, generateStrategyDto.strategyType, generateStrategyDto.generatedBy, generateStrategyDto.useGemini ?? true);
        return {
            success: true,
            message: 'Strategy generated successfully',
            data: result.strategy,
            insights: this.generateStrategyInsights(result.strategy),
            aiGenerated: !(generateStrategyDto.useGemini === false),
            isTruncated: result.isTruncated,
        };
    }
    async getStrategies(userId) {
        const strategies = await this.marketingStrategyService.getStrategies(userId);
        return strategies;
    }
    async getCampaignStrategies(campaignId) {
        const strategies = await this.marketingStrategyService.getCampaignStrategies(campaignId);
        return {
            success: true,
            data: {
                campaignId,
                strategies,
                summary: this.generateCampaignStrategySummary(strategies),
            },
        };
    }
    async evaluateStrategy(id) {
        try {
            const evaluation = await this.marketingStrategyService.evaluateStrategy(id);
            return {
                success: true,
                message: 'Strategy evaluation completed',
                data: evaluation,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to evaluate strategy',
            };
        }
    }
    async getRecommendedStrategies(userId) {
        const strategies = await this.marketingStrategyService.getRecommendedStrategies(userId);
        return {
            success: true,
            data: {
                userId,
                recommendations: strategies,
                summary: this.generateRecommendationsSummary(strategies),
            },
        };
    }
    generateStrategyInsights(strategy) {
        const insights = {
            confidenceLevel: '',
            expectedImpact: '',
            implementationComplexity: '',
        };
        if (strategy.confidenceScore >= 80) {
            insights.confidenceLevel = '高';
            insights.expectedImpact = '预期效果显著';
        }
        else if (strategy.confidenceScore >= 60) {
            insights.confidenceLevel = '中';
            insights.expectedImpact = '预期效果一般';
        }
        else {
            insights.confidenceLevel = '低';
            insights.expectedImpact = '需要进一步验证';
        }
        if (strategy.strategyType === 'CONTENT') {
            insights.implementationComplexity = '中等';
        }
        else if (strategy.strategyType === 'BUDGET_ALLOCATION') {
            insights.implementationComplexity = '高';
        }
        else {
            insights.implementationComplexity = '低';
        }
        return insights;
    }
    generateCampaignStrategySummary(strategies) {
        if (strategies.length === 0) {
            return '该活动暂无营销策略';
        }
        const avgConfidence = Math.round(strategies.reduce((sum, s) => sum + s.confidenceScore, 0) /
            strategies.length);
        const typeCounts = {};
        strategies.forEach((s) => {
            typeCounts[s.strategyType] = (typeCounts[s.strategyType] || 0) + 1;
        });
        const mostCommonType = Object.entries(typeCounts).reduce((max, entry) => (entry[1] > max[1] ? entry : max), ['', 0])[0];
        return `共 ${strategies.length} 个策略，平均置信度 ${avgConfidence}%，最多的是 ${mostCommonType} 类型策略`;
    }
    generateRecommendationsSummary(strategies) {
        if (strategies.length === 0) {
            return '暂无推荐策略';
        }
        const topStrategy = strategies[0];
        return `推荐 ${topStrategy.strategyType} 策略：${topStrategy.description.substring(0, 50)}...（置信度：${topStrategy.confidenceScore}%）`;
    }
    async generateStrategyContent(id, generateStrategyContentDto) {
        try {
            const strategy = await this.marketingStrategyService.getStrategyById(id);
            if (!strategy) {
                return {
                    success: false,
                    error: {
                        code: 'STRATEGY_NOT_FOUND',
                        message: 'Strategy not found',
                    },
                };
            }
            const campaign = strategy.campaign;
            if (!campaign) {
                return {
                    success: false,
                    error: {
                        code: 'CAMPAIGN_NOT_FOUND',
                        message: 'Associated campaign not found',
                    },
                };
            }
            const campaignSummary = {
                id: campaign.id,
                name: campaign.name,
                campaignType: campaign.campaignType,
                targetAudience: campaign.targetAudience || {},
                budget: campaign.budget,
                userId: campaign.userId,
                insights: {
                    totalStrategies: 0,
                    averageConfidenceScore: 0,
                    strategyTypeDistribution: {},
                    estimatedTotalROI: 0,
                    completionRate: 0,
                },
            };
            const targetPlatforms = generateStrategyContentDto.targetPlatforms ||
                strategy.contentPlatforms || [platform_enum_1.Platform.XHS];
            const result = await this.contentGenerationService.generateMarketingContent({
                campaignSummary: campaignSummary,
                targetPlatforms,
                contentTypes: generateStrategyContentDto.contentTypes,
                tone: generateStrategyContentDto.tone,
                quantity: 1,
            });
            if (!result.success) {
                return {
                    success: false,
                    error: result.error || {
                        code: 'CONTENT_GENERATION_FAILED',
                        message: 'Failed to generate content',
                    },
                };
            }
            return {
                success: true,
                message: 'Content generated successfully for strategy',
                data: {
                    strategyId: id,
                    generatedContent: result.marketingContent,
                    contentPlatforms: targetPlatforms,
                },
                processingTime: result.processingTime,
                modelUsed: result.modelUsed,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'CONTROLLER_ERROR',
                    message: error.message || 'Failed to generate content for strategy',
                },
            };
        }
    }
};
exports.MarketingStrategyController = MarketingStrategyController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(201),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_strategy_dto_1.GenerateStrategyDto]),
    __metadata("design:returntype", Promise)
], MarketingStrategyController.prototype, "generateStrategy", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketingStrategyController.prototype, "getStrategies", null);
__decorate([
    (0, common_1.Get)('campaign/:campaignId'),
    __param(0, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketingStrategyController.prototype, "getCampaignStrategies", null);
__decorate([
    (0, common_1.Post)(':id/evaluate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketingStrategyController.prototype, "evaluateStrategy", null);
__decorate([
    (0, common_1.Get)('recommendations/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketingStrategyController.prototype, "getRecommendedStrategies", null);
__decorate([
    (0, common_1.Post)(':id/generate-content'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generate_strategy_content_dto_1.GenerateStrategyContentDto]),
    __metadata("design:returntype", Promise)
], MarketingStrategyController.prototype, "generateStrategyContent", null);
exports.MarketingStrategyController = MarketingStrategyController = __decorate([
    (0, common_1.Controller)('api/v1/analytics/strategies'),
    __metadata("design:paramtypes", [marketing_strategy_service_1.MarketingStrategyService,
        content_generation_service_1.ContentGenerationService])
], MarketingStrategyController);
//# sourceMappingURL=marketing-strategy.controller.js.map