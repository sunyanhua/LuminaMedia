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
var MarketingStrategyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingStrategyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const strategy_type_enum_1 = require("../../../shared/enums/strategy-type.enum");
const generation_method_enum_1 = require("../../../shared/enums/generation-method.enum");
const gemini_service_1 = require("./gemini.service");
const qwen_service_1 = require("./qwen.service");
const gemini_interface_1 = require("../interfaces/gemini.interface");
const marketing_campaign_repository_1 = require("../../../shared/repositories/marketing-campaign.repository");
const marketing_strategy_repository_1 = require("../../../shared/repositories/marketing-strategy.repository");
let MarketingStrategyService = MarketingStrategyService_1 = class MarketingStrategyService {
    campaignRepository;
    strategyRepository;
    configService;
    geminiService;
    qwenService;
    logger = new common_1.Logger(MarketingStrategyService_1.name);
    constructor(campaignRepository, strategyRepository, configService, geminiService, qwenService) {
        this.campaignRepository = campaignRepository;
        this.strategyRepository = strategyRepository;
        this.configService = configService;
        this.geminiService = geminiService;
        this.qwenService = qwenService;
    }
    async generateStrategy(campaignId, strategyType, generatedBy = generation_method_enum_1.GenerationMethod.AI_GENERATED, useGemini = true) {
        const campaign = await this.campaignRepository.findOne({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign ${campaignId} not found`);
        }
        const type = strategyType ||
            Object.values(strategy_type_enum_1.StrategyType)[Math.floor(Math.random() * Object.values(strategy_type_enum_1.StrategyType).length)];
        const insights = await this.getCampaignInsights(campaignId);
        const campaignSummary = {
            id: campaign.id,
            name: campaign.name,
            campaignType: campaign.campaignType,
            targetAudience: campaign.targetAudience || {},
            budget: campaign.budget,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            userId: campaign.userId,
            insights,
        };
        let aiResult = null;
        let aiError = null;
        let fallbackUsed = false;
        let aiEngine = gemini_interface_1.AIEngine.FALLBACK;
        let isTruncated = false;
        if (useGemini) {
            if (this.qwenService.isQwenAvailable()) {
                try {
                    this.logger.log('尝试使用 Qwen API 生成营销策略');
                    const qwenResponse = await this.qwenService.generateMarketingStrategy({
                        campaignSummary,
                        strategyType: type,
                        useFallback: true,
                        timeout: 30000,
                    });
                    if (qwenResponse.success && qwenResponse.data) {
                        aiResult = qwenResponse.data;
                        fallbackUsed = qwenResponse.fallbackUsed || false;
                        isTruncated = qwenResponse.isTruncated || false;
                        aiEngine = gemini_interface_1.AIEngine.QWEN;
                        this.logger.log(`Qwen API 生成成功，引擎: ${aiEngine}, 截断状态: ${isTruncated}`);
                    }
                    else {
                        aiError = qwenResponse.error;
                        this.logger.warn(`Qwen API 失败: ${aiError?.message}`);
                    }
                }
                catch (error) {
                    this.logger.error(`调用 Qwen API 错误: ${error.message}`, error.stack);
                    aiError = error;
                }
            }
            if (!aiResult && this.geminiService.isGeminiAvailable()) {
                try {
                    this.logger.log('尝试使用 Gemini API 生成营销策略');
                    const geminiResponse = await this.geminiService.generateMarketingStrategy({
                        campaignSummary,
                        strategyType: type,
                        useFallback: true,
                        timeout: 30000,
                    });
                    if (geminiResponse.success && geminiResponse.data) {
                        aiResult = geminiResponse.data;
                        fallbackUsed = geminiResponse.fallbackUsed || false;
                        isTruncated = geminiResponse.isTruncated || false;
                        aiEngine = gemini_interface_1.AIEngine.GEMINI;
                        this.logger.log(`Gemini API 生成成功，引擎: ${aiEngine}, 截断状态: ${isTruncated}`);
                    }
                    else {
                        aiError = geminiResponse.error;
                        this.logger.warn(`Gemini API 失败: ${aiError?.message}`);
                    }
                }
                catch (error) {
                    this.logger.error(`调用 Gemini API 错误: ${error.message}`, error.stack);
                    aiError = error;
                }
            }
        }
        if (!useGemini || !aiResult) {
            this.logger.log('使用模拟模板生成回退策略');
            const fallbackStrategy = await this.generateFallbackStrategy(campaignId, type, generatedBy, campaign);
            return { strategy: fallbackStrategy, isTruncated: false };
        }
        const strategyData = this.createStrategyFromAIResponse(campaignId, type, generatedBy, aiResult, fallbackUsed, aiEngine);
        const strategy = this.strategyRepository.create(strategyData);
        strategy.expectedROI = strategyData.expectedROI || '30';
        const savedStrategy = await this.strategyRepository.save(strategy);
        return { strategy: savedStrategy, isTruncated };
    }
    async getCampaignInsights(campaignId) {
        try {
            const strategies = await this.strategyRepository.find({
                where: { campaignId },
            });
            const strategyTypeDistribution = {};
            strategies.forEach((strategy) => {
                const type = strategy.strategyType;
                strategyTypeDistribution[type] =
                    (strategyTypeDistribution[type] || 0) + 1;
            });
            const averageConfidenceScore = strategies.length > 0
                ? strategies.reduce((sum, s) => sum + parseFloat(s.confidenceScore || '0'), 0) / strategies.length
                : 0;
            const estimatedTotalROI = strategies.reduce((sum, s) => sum + (parseFloat(s.expectedROI) || 0), 0);
            return {
                totalStrategies: strategies.length,
                averageConfidenceScore,
                strategyTypeDistribution,
                estimatedTotalROI,
                completionRate: strategies.length > 0 ? 50 : 0,
            };
        }
        catch (error) {
            this.logger.warn(`Failed to get campaign insights: ${error.message}`);
            return null;
        }
    }
    async generateFallbackStrategy(campaignId, strategyType, generatedBy, campaign) {
        this.logger.log(`Generating fallback strategy for campaign ${campaignId}`);
        const strategyTemplates = {
            [strategy_type_enum_1.StrategyType.CONTENT]: {
                description: '针对目标受众的内容策略，建议制作视频教程和案例分析',
                implementationPlan: {
                    steps: [
                        '创建每周2篇深度文章',
                        '制作每月4个短视频教程',
                        '发布用户案例研究',
                    ],
                    frequency: '每周',
                    channels: ['小红书', '微信公众号'],
                },
                expectedROI: 35.5,
                confidenceScore: 85,
            },
            [strategy_type_enum_1.StrategyType.CHANNEL]: {
                description: '多渠道整合营销，重点投放小红书和微信公众号',
                implementationPlan: {
                    steps: [
                        '小红书：每日发布1篇种草笔记',
                        '微信公众号：每周推送3篇文章',
                        '同步内容到多个平台',
                    ],
                    budgetAllocation: {
                        xhs: 40,
                        wechat: 40,
                        other: 20,
                    },
                },
                expectedROI: 42.3,
                confidenceScore: 78,
            },
            [strategy_type_enum_1.StrategyType.TIMING]: {
                description: '基于用户活跃时段的发布时间优化策略',
                implementationPlan: {
                    optimalTimes: ['09:00-11:00', '19:00-21:00'],
                    days: ['周一', '周三', '周五', '周末'],
                    seasonalAdjustments: {
                        spring: '增加户外内容',
                        summer: '增加清凉主题',
                    },
                },
                expectedROI: 28.7,
                confidenceScore: 72,
            },
            [strategy_type_enum_1.StrategyType.BUDGET_ALLOCATION]: {
                description: '基于 ROI 预测的智能预算分配方案',
                implementationPlan: {
                    allocations: [
                        { channel: '小红书', percentage: 45, expectedROI: 40 },
                        { channel: '微信公众号', percentage: 35, expectedROI: 35 },
                        { channel: '其他平台', percentage: 20, expectedROI: 25 },
                    ],
                    quarterlyReview: true,
                    flexibility: 15,
                },
                expectedROI: 38.9,
                confidenceScore: 82,
            },
        };
        const template = strategyTemplates[strategyType];
        const strategyData = {
            campaignId,
            strategyType: strategyType,
            description: template.description,
            implementationPlan: template.implementationPlan,
            expectedROI: String(template.expectedROI),
            confidenceScore: String(template.confidenceScore),
            generatedBy,
        };
        if (campaign) {
            strategyData.campaignName = `${campaign.name}（模拟方案）`;
            strategyData.coreIdea = `基于${strategyType}策略模板生成的模拟方案，建议在实际使用中启用 Gemini API 获取更精准的策略。`;
            strategyData.xhsContent = `【${campaign.name}】营销方案发布！\n\n🎯 目标：提升品牌影响力\n💰 预算：${campaign.budget}元\n📅 周期：${campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '待定'} - ${campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '待定'}\n\n#${campaign.name.replace(/\s+/g, '')} #营销方案 #小红书运营`;
        }
        const strategy = this.strategyRepository.create(strategyData);
        return await this.strategyRepository.save(strategy);
    }
    createStrategyFromGeminiResponse(campaignId, strategyType, generatedBy, geminiResponse, fallbackUsed) {
        let expectedROI = '30';
        if (geminiResponse.expectedPerformanceMetrics?.estimatedROI !== undefined) {
            expectedROI = String(geminiResponse.expectedPerformanceMetrics.estimatedROI);
        }
        const confidenceScore = String(fallbackUsed ? 65 : this.calculateConfidenceScore(geminiResponse));
        const implementationPlan = this.generateImplementationPlan(geminiResponse);
        return {
            campaignId,
            strategyType,
            description: `基于${strategyType}的AI生成营销策略${fallbackUsed ? '（回退方案）' : ''}`,
            implementationPlan,
            expectedROI,
            confidenceScore,
            generatedBy: fallbackUsed ? generation_method_enum_1.GenerationMethod.TEMPLATE : generatedBy,
            campaignName: geminiResponse.campaignName,
            targetAudienceAnalysis: geminiResponse.targetAudienceAnalysis,
            coreIdea: geminiResponse.coreIdea,
            xhsContent: typeof geminiResponse.xhsContent === 'string'
                ? geminiResponse.xhsContent
                : JSON.stringify(geminiResponse.xhsContent),
            wechatFullPlan: geminiResponse.wechatFullPlan,
            recommendedExecutionTime: geminiResponse.recommendedExecutionTime,
            expectedPerformanceMetrics: geminiResponse.expectedPerformanceMetrics,
            executionSteps: geminiResponse.executionSteps,
            riskAssessment: geminiResponse.riskAssessment,
            budgetAllocation: geminiResponse.budgetAllocation,
            aiResponseRaw: JSON.stringify(geminiResponse),
        };
    }
    createStrategyFromAIResponse(campaignId, strategyType, generatedBy, aiResponse, fallbackUsed, aiEngine = gemini_interface_1.AIEngine.FALLBACK) {
        let expectedROI = '30';
        if (aiResponse.expectedROI !== undefined) {
            expectedROI = String(aiResponse.expectedROI);
        }
        else if (aiResponse.expectedPerformanceMetrics?.estimatedROI !== undefined) {
            expectedROI = String(aiResponse.expectedPerformanceMetrics.estimatedROI);
        }
        const confidenceScore = String(fallbackUsed ? 65 : this.calculateConfidenceScore(aiResponse));
        const implementationPlan = this.generateImplementationPlan(aiResponse);
        const engineDescription = aiEngine === gemini_interface_1.AIEngine.QWEN
            ? '通义千问生成'
            : aiEngine === gemini_interface_1.AIEngine.GEMINI
                ? 'Gemini生成'
                : '回退方案';
        return {
            campaignId,
            strategyType,
            description: `基于${strategyType}的${engineDescription}营销策略${fallbackUsed ? '（回退方案）' : ''}`,
            implementationPlan,
            expectedROI,
            confidenceScore,
            generatedBy: fallbackUsed ? generation_method_enum_1.GenerationMethod.TEMPLATE : generatedBy,
            campaignName: aiResponse.campaignName,
            targetAudienceAnalysis: aiResponse.targetAudienceAnalysis,
            coreIdea: aiResponse.coreIdea,
            xhsContent: typeof aiResponse.xhsContent === 'string'
                ? aiResponse.xhsContent
                : JSON.stringify(aiResponse.xhsContent),
            wechatFullPlan: aiResponse.wechatFullPlan,
            recommendedExecutionTime: aiResponse.recommendedExecutionTime,
            expectedPerformanceMetrics: aiResponse.expectedPerformanceMetrics,
            executionSteps: aiResponse.executionSteps,
            riskAssessment: aiResponse.riskAssessment,
            budgetAllocation: aiResponse.budgetAllocation,
            aiResponseRaw: JSON.stringify(aiResponse),
            aiEngine,
        };
    }
    calculateConfidenceScore(geminiResponse) {
        let score = 70;
        if (geminiResponse.campaignName?.length > 0)
            score += 5;
        if (geminiResponse.coreIdea?.length > 50)
            score += 5;
        if (geminiResponse.xhsContent)
            score += 5;
        if (geminiResponse.executionSteps?.length >= 3)
            score += 5;
        if (geminiResponse.riskAssessment?.length >= 2)
            score += 5;
        if (geminiResponse.budgetAllocation?.length >= 3)
            score += 5;
        const roi = geminiResponse.expectedPerformanceMetrics?.estimatedROI || 0;
        if (roi > 40)
            score += 10;
        else if (roi > 30)
            score += 5;
        else if (roi < 10)
            score -= 5;
        return Math.min(95, Math.max(50, score));
    }
    generateImplementationPlan(geminiResponse) {
        const timelineData = Array.isArray(geminiResponse.recommendedExecutionTime?.timeline)
            ? geminiResponse.recommendedExecutionTime.timeline
            : [geminiResponse.recommendedExecutionTime?.timeline].filter(Boolean);
        return {
            steps: timelineData.flatMap((phase) => phase?.activities?.map((activity) => `${phase.phase}: ${activity}`) || []),
            timeline: timelineData.map((phase) => ({
                phase: phase?.phase,
                duration: phase?.duration,
                activities: phase?.activities || [],
            })),
            bestPostingTimes: geminiResponse.recommendedExecutionTime?.bestPostingTimes || [],
            seasonalConsiderations: geminiResponse.recommendedExecutionTime?.seasonalConsiderations || [],
        };
    }
    async evaluateStrategy(strategyId) {
        const strategy = await this.strategyRepository.findOne({
            where: { id: strategyId },
        });
        if (!strategy) {
            throw new common_1.NotFoundException(`Strategy ${strategyId} not found`);
        }
        const feasibilityScore = Math.min(100, parseFloat(strategy.confidenceScore) + Math.floor(Math.random() * 20));
        const impactLevels = ['低', '中', '高'];
        const expectedImpact = impactLevels[Math.floor(Math.random() * impactLevels.length)];
        const riskTemplates = [
            '预算可能超出预期',
            '目标受众响应可能低于预期',
            '平台算法变化可能影响效果',
            '内容创作资源可能不足',
        ];
        const selectedRisks = riskTemplates
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
        const recommendationTemplates = [
            '建议先进行小规模测试',
            '考虑增加备用预算',
            '建议定期监测和调整',
            '考虑多渠道验证效果',
        ];
        const selectedRecommendations = recommendationTemplates
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
        return {
            strategy,
            evaluation: {
                feasibilityScore,
                expectedImpact,
                risks: selectedRisks,
                recommendations: selectedRecommendations,
            },
        };
    }
    async getRecommendedStrategies(userId) {
        const campaigns = await this.campaignRepository.find({
            where: { userId },
            relations: ['strategies'],
        });
        const allStrategies = [];
        campaigns.forEach((campaign) => {
            if (campaign.strategies) {
                allStrategies.push(...campaign.strategies);
            }
        });
        return allStrategies
            .sort((a, b) => parseFloat(b.confidenceScore) - parseFloat(a.confidenceScore))
            .slice(0, 5);
    }
    async getCampaignStrategies(campaignId) {
        const campaign = await this.campaignRepository.findOne({
            where: { id: campaignId },
            relations: ['strategies'],
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign ${campaignId} not found`);
        }
        return campaign.strategies || [];
    }
    async getStrategies(userId) {
        const campaigns = await this.campaignRepository.find({
            where: { userId },
            relations: ['strategies'],
        });
        const allStrategies = [];
        campaigns.forEach((campaign) => {
            if (campaign.strategies) {
                allStrategies.push(...campaign.strategies);
            }
        });
        return allStrategies;
    }
    async getStrategyById(id) {
        return await this.strategyRepository.findOne({
            where: { id },
            relations: ['campaign'],
        });
    }
};
exports.MarketingStrategyService = MarketingStrategyService;
exports.MarketingStrategyService = MarketingStrategyService = MarketingStrategyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(marketing_campaign_repository_1.MarketingCampaignRepository)),
    __param(1, (0, typeorm_1.InjectRepository)(marketing_strategy_repository_1.MarketingStrategyRepository)),
    __metadata("design:paramtypes", [marketing_campaign_repository_1.MarketingCampaignRepository,
        marketing_strategy_repository_1.MarketingStrategyRepository,
        config_1.ConfigService,
        gemini_service_1.GeminiService,
        qwen_service_1.QwenService])
], MarketingStrategyService);
//# sourceMappingURL=marketing-strategy.service.js.map