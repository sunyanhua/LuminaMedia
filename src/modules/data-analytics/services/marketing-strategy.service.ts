import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MarketingCampaign } from '../entities/marketing-campaign.entity';
import { MarketingStrategy } from '../entities/marketing-strategy.entity';
import { StrategyType } from '../../../shared/enums/strategy-type.enum';
import { GenerationMethod } from '../../../shared/enums/generation-method.enum';
import { GeminiService } from './gemini.service';
import { CampaignSummary } from '../interfaces/gemini.interface';

@Injectable()
export class MarketingStrategyService {
  private readonly logger = new Logger(MarketingStrategyService.name);

  constructor(
    @InjectRepository(MarketingCampaign)
    private campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(MarketingStrategy)
    private strategyRepository: Repository<MarketingStrategy>,
    private readonly configService: ConfigService,
    private readonly geminiService: GeminiService,
  ) {}

  async generateStrategy(
    campaignId: string,
    strategyType?: StrategyType,
    generatedBy: GenerationMethod = GenerationMethod.AI_GENERATED,
    useGemini: boolean = true,
  ): Promise<MarketingStrategy> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }

    const type =
      strategyType ||
      Object.values(StrategyType)[
        Math.floor(Math.random() * Object.values(StrategyType).length)
      ];

    // 尝试使用 Gemini API 生成策略
    let geminiResult: any = null;
    let geminiError: any = null;
    let fallbackUsed = false;

    if (useGemini) {
      try {
        // 获取活动洞察（如果可用）
        const insights = await this.getCampaignInsights(campaignId);

        const campaignSummary: CampaignSummary = {
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

        const geminiResponse =
          await this.geminiService.generateMarketingStrategy({
            campaignSummary,
            strategyType: type,
            useFallback: true,
            timeout: 30000,
          });

        if (geminiResponse.success && geminiResponse.data) {
          geminiResult = geminiResponse.data;
          fallbackUsed = geminiResponse.fallbackUsed || false;
        } else {
          geminiError = geminiResponse.error;
          this.logger.warn(`Gemini API failed: ${geminiError?.message}`);
          fallbackUsed = true;
        }
      } catch (error) {
        this.logger.error(
          `Error calling Gemini API: ${error.message}`,
          error.stack,
        );
        geminiError = error;
        fallbackUsed = true;
      }
    }

    // 如果没有使用 Gemini 或 Gemini 失败，使用模拟模板
    if (!useGemini || !geminiResult) {
      return this.generateFallbackStrategy(
        campaignId,
        type,
        generatedBy,
        campaign,
      );
    }

    // 基于 Gemini 响应创建策略
    const strategyData = this.createStrategyFromGeminiResponse(
      campaignId,
      type,
      generatedBy,
      geminiResult,
      fallbackUsed,
    );

    const strategy = this.strategyRepository.create(strategyData);
    return await this.strategyRepository.save(strategy);
  }

  /**
   * 获取营销活动洞察数据
   */
  private async getCampaignInsights(campaignId: string): Promise<any> {
    try {
      // 这里可以调用 AnalyticsService，为了简化，我们返回模拟数据
      const strategies = await this.strategyRepository.find({
        where: { campaignId },
      });

      const strategyTypeDistribution: Record<string, number> = {};
      strategies.forEach((strategy) => {
        const type = strategy.strategyType;
        strategyTypeDistribution[type] =
          (strategyTypeDistribution[type] || 0) + 1;
      });

      const averageConfidenceScore =
        strategies.length > 0
          ? strategies.reduce((sum, s) => sum + s.confidenceScore, 0) /
            strategies.length
          : 0;

      const estimatedTotalROI = strategies.reduce(
        (sum, s) => sum + (s.expectedROI || 0),
        0,
      );

      return {
        totalStrategies: strategies.length,
        averageConfidenceScore,
        strategyTypeDistribution,
        estimatedTotalROI,
        completionRate: strategies.length > 0 ? 50 : 0, // 简化
      };
    } catch (error) {
      this.logger.warn(`Failed to get campaign insights: ${error.message}`);
      return null;
    }
  }

  /**
   * 生成回退策略（模拟模板）
   */
  private async generateFallbackStrategy(
    campaignId: string,
    strategyType: StrategyType,
    generatedBy: GenerationMethod,
    campaign?: MarketingCampaign,
  ): Promise<MarketingStrategy> {
    this.logger.log(`Generating fallback strategy for campaign ${campaignId}`);

    // 模拟 AI 生成的策略模板
    const strategyTemplates: Record<StrategyType, any> = {
      [StrategyType.CONTENT]: {
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
      [StrategyType.CHANNEL]: {
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
      [StrategyType.TIMING]: {
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
      [StrategyType.BUDGET_ALLOCATION]: {
        description: '基于 ROI 预测的智能预算分配方案',
        implementationPlan: {
          allocations: [
            { channel: '小红书', percentage: 45, expectedROI: 40 },
            { channel: '微信公众号', percentage: 35, expectedROI: 35 },
            { channel: '其他平台', percentage: 20, expectedROI: 25 },
          ],
          quarterlyReview: true,
          flexibility: 15, // 允许调整的百分比
        },
        expectedROI: 38.9,
        confidenceScore: 82,
      },
    };

    const template = strategyTemplates[strategyType];

    const strategyData: Partial<MarketingStrategy> = {
      campaignId,
      strategyType: strategyType,
      description: template.description,
      implementationPlan: template.implementationPlan,
      expectedROI: template.expectedROI,
      confidenceScore: template.confidenceScore,
      generatedBy,
    };

    // 如果提供了活动信息，添加一些基本字段
    if (campaign) {
      strategyData.campaignName = `${campaign.name}（模拟方案）`;
      strategyData.coreIdea = `基于${strategyType}策略模板生成的模拟方案，建议在实际使用中启用 Gemini API 获取更精准的策略。`;
      strategyData.xhsContent = `【${campaign.name}】营销方案发布！\n\n🎯 目标：提升品牌影响力\n💰 预算：${campaign.budget}元\n📅 周期：${campaign.startDate ? campaign.startDate.toISOString().split('T')[0] : '待定'} - ${campaign.endDate ? campaign.endDate.toISOString().split('T')[0] : '待定'}\n\n#${campaign.name.replace(/\s+/g, '')} #营销方案 #小红书运营`;
    }

    const strategy = this.strategyRepository.create(strategyData);
    return await this.strategyRepository.save(strategy);
  }

  /**
   * 基于 Gemini 响应创建营销策略实体
   */
  private createStrategyFromGeminiResponse(
    campaignId: string,
    strategyType: StrategyType,
    generatedBy: GenerationMethod,
    geminiResponse: any,
    fallbackUsed: boolean,
  ): Partial<MarketingStrategy> {
    // 计算衍生字段
    const expectedROI =
      geminiResponse.expectedPerformanceMetrics?.estimatedROI || 30;
    const confidenceScore = fallbackUsed
      ? 65
      : this.calculateConfidenceScore(geminiResponse);

    // 从推荐执行时间生成实施计划
    const implementationPlan = this.generateImplementationPlan(geminiResponse);

    return {
      campaignId,
      strategyType,
      description: `基于${strategyType}的AI生成营销策略${fallbackUsed ? '（回退方案）' : ''}`,
      implementationPlan,
      expectedROI,
      confidenceScore,
      generatedBy: fallbackUsed ? GenerationMethod.TEMPLATE : generatedBy,
      campaignName: geminiResponse.campaignName,
      targetAudienceAnalysis: geminiResponse.targetAudienceAnalysis,
      coreIdea: geminiResponse.coreIdea,
      xhsContent:
        typeof geminiResponse.xhsContent === 'string'
          ? geminiResponse.xhsContent
          : JSON.stringify(geminiResponse.xhsContent),
      recommendedExecutionTime: geminiResponse.recommendedExecutionTime,
      expectedPerformanceMetrics: geminiResponse.expectedPerformanceMetrics,
      executionSteps: geminiResponse.executionSteps,
      riskAssessment: geminiResponse.riskAssessment,
      budgetAllocation: geminiResponse.budgetAllocation,
      aiResponseRaw: JSON.stringify(geminiResponse),
    };
  }

  /**
   * 计算策略置信度分数
   */
  private calculateConfidenceScore(geminiResponse: any): number {
    let score = 70; // 基础分数

    // 根据响应完整性加分
    if (geminiResponse.campaignName?.length > 0) score += 5;
    if (geminiResponse.coreIdea?.length > 50) score += 5;
    if (geminiResponse.xhsContent) score += 5;
    if (geminiResponse.executionSteps?.length >= 3) score += 5;
    if (geminiResponse.riskAssessment?.length >= 2) score += 5;
    if (geminiResponse.budgetAllocation?.length >= 3) score += 5;

    // 根据预期 ROI 调整
    const roi = geminiResponse.expectedPerformanceMetrics?.estimatedROI || 0;
    if (roi > 40) score += 10;
    else if (roi > 30) score += 5;
    else if (roi < 10) score -= 5;

    return Math.min(95, Math.max(50, score)); // 限制在50-95之间
  }

  /**
   * 从 Gemini 响应生成实施计划
   */
  private generateImplementationPlan(geminiResponse: any): Record<string, any> {
    const timeline = geminiResponse.recommendedExecutionTime?.timeline || [];

    return {
      steps: timeline.flatMap(
        (phase: any) =>
          phase.activities?.map(
            (activity: string) => `${phase.phase}: ${activity}`,
          ) || [],
      ),
      timeline: timeline.map((phase: any) => ({
        phase: phase.phase,
        duration: phase.duration,
        activities: phase.activities || [],
      })),
      bestPostingTimes:
        geminiResponse.recommendedExecutionTime?.bestPostingTimes || [],
      seasonalConsiderations:
        geminiResponse.recommendedExecutionTime?.seasonalConsiderations || [],
    };
  }

  async evaluateStrategy(strategyId: string): Promise<{
    strategy: MarketingStrategy;
    evaluation: {
      feasibilityScore: number;
      expectedImpact: string;
      risks: string[];
      recommendations: string[];
    };
  }> {
    const strategy = await this.strategyRepository.findOne({
      where: { id: strategyId },
    });

    if (!strategy) {
      throw new NotFoundException(`Strategy ${strategyId} not found`);
    }

    // 模拟评估逻辑
    const feasibilityScore = Math.min(
      100,
      strategy.confidenceScore + Math.floor(Math.random() * 20),
    );

    const impactLevels = ['低', '中', '高'];
    const expectedImpact =
      impactLevels[Math.floor(Math.random() * impactLevels.length)];

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

  async getRecommendedStrategies(userId: string): Promise<MarketingStrategy[]> {
    const campaigns = await this.campaignRepository.find({
      where: { userId },
      relations: ['strategies'],
    });

    // 获取所有策略，按置信度排序
    const allStrategies: MarketingStrategy[] = [];
    campaigns.forEach((campaign) => {
      if (campaign.strategies) {
        allStrategies.push(...campaign.strategies);
      }
    });

    // 按置信度排序，返回前5个
    return allStrategies
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 5);
  }

  async getCampaignStrategies(
    campaignId: string,
  ): Promise<MarketingStrategy[]> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['strategies'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }

    return campaign.strategies || [];
  }

  /**
   * 根据ID获取策略，包含关联的活动信息
   */
  async getStrategyById(id: string): Promise<MarketingStrategy | null> {
    return await this.strategyRepository.findOne({
      where: { id },
      relations: ['campaign'],
    });
  }
}
