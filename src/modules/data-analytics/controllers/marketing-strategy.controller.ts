import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { MarketingStrategyService } from '../services/marketing-strategy.service';
import { ContentGenerationService } from '../services/content-generation.service';
import { GenerateStrategyDto } from '../dto/generate-strategy.dto';
import { GenerateStrategyContentDto } from '../dto/generate-strategy-content.dto';
import { Platform } from '../../../shared/enums/platform.enum';

@Controller('api/v1/analytics/strategies')
export class MarketingStrategyController {
  constructor(
    private readonly marketingStrategyService: MarketingStrategyService,
    private readonly contentGenerationService: ContentGenerationService,
  ) {}

  @Post('generate')
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateStrategy(@Body() generateStrategyDto: GenerateStrategyDto) {
    const strategy = await this.marketingStrategyService.generateStrategy(
      generateStrategyDto.campaignId,
      generateStrategyDto.strategyType,
      generateStrategyDto.generatedBy,
      generateStrategyDto.useGemini ?? true,
    );

    return {
      success: true,
      message: 'Strategy generated successfully',
      data: strategy,
      insights: this.generateStrategyInsights(strategy),
      aiGenerated: !(generateStrategyDto.useGemini === false),
    };
  }

  @Get()
  async getStrategies(@Query('userId') userId: string) {
    const strategies = await this.marketingStrategyService.getStrategies(userId);
    return strategies;
  }

  @Get('campaign/:campaignId')
  async getCampaignStrategies(@Param('campaignId') campaignId: string) {
    const strategies =
      await this.marketingStrategyService.getCampaignStrategies(campaignId);

    return {
      success: true,
      data: {
        campaignId,
        strategies,
        summary: this.generateCampaignStrategySummary(strategies),
      },
    };
  }

  @Post(':id/evaluate')
  async evaluateStrategy(@Param('id') id: string) {
    try {
      const evaluation =
        await this.marketingStrategyService.evaluateStrategy(id);

      return {
        success: true,
        message: 'Strategy evaluation completed',
        data: evaluation,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to evaluate strategy',
      };
    }
  }

  @Get('recommendations/:userId')
  async getRecommendedStrategies(@Param('userId') userId: string) {
    const strategies =
      await this.marketingStrategyService.getRecommendedStrategies(userId);

    return {
      success: true,
      data: {
        userId,
        recommendations: strategies,
        summary: this.generateRecommendationsSummary(strategies),
      },
    };
  }

  private generateStrategyInsights(strategy: any): any {
    const insights = {
      confidenceLevel: '',
      expectedImpact: '',
      implementationComplexity: '',
    };

    if (strategy.confidenceScore >= 80) {
      insights.confidenceLevel = '高';
      insights.expectedImpact = '预期效果显著';
    } else if (strategy.confidenceScore >= 60) {
      insights.confidenceLevel = '中';
      insights.expectedImpact = '预期效果一般';
    } else {
      insights.confidenceLevel = '低';
      insights.expectedImpact = '需要进一步验证';
    }

    // 根据策略类型判断实施复杂度
    if (strategy.strategyType === 'CONTENT') {
      insights.implementationComplexity = '中等';
    } else if (strategy.strategyType === 'BUDGET_ALLOCATION') {
      insights.implementationComplexity = '高';
    } else {
      insights.implementationComplexity = '低';
    }

    return insights;
  }

  private generateCampaignStrategySummary(strategies: any[]): string {
    if (strategies.length === 0) {
      return '该活动暂无营销策略';
    }

    const avgConfidence = Math.round(
      strategies.reduce((sum, s) => sum + s.confidenceScore, 0) /
        strategies.length,
    );

    const typeCounts: Record<string, number> = {};
    strategies.forEach((s) => {
      typeCounts[s.strategyType] = (typeCounts[s.strategyType] || 0) + 1;
    });

    const mostCommonType = Object.entries(typeCounts).reduce(
      (max, entry) => (entry[1] > max[1] ? entry : max),
      ['', 0],
    )[0];

    return `共 ${strategies.length} 个策略，平均置信度 ${avgConfidence}%，最多的是 ${mostCommonType} 类型策略`;
  }

  private generateRecommendationsSummary(strategies: any[]): string {
    if (strategies.length === 0) {
      return '暂无推荐策略';
    }

    const topStrategy = strategies[0];
    return `推荐 ${topStrategy.strategyType} 策略：${topStrategy.description.substring(0, 50)}...（置信度：${topStrategy.confidenceScore}%）`;
  }

  /**
   * 为策略生成内容
   */
  @Post(':id/generate-content')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateStrategyContent(
    @Param('id') id: string,
    @Body() generateStrategyContentDto: GenerateStrategyContentDto,
  ) {
    try {
      // 获取策略信息
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

      // 获取关联的活动信息
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

      // 构建 CampaignSummary
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

      // 确定目标平台
      const targetPlatforms = generateStrategyContentDto.targetPlatforms ||
        strategy.contentPlatforms || [Platform.XHS];

      // 生成营销内容
      const result =
        await this.contentGenerationService.generateMarketingContent({
          campaignSummary: campaignSummary as any,
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

      // 更新策略的生成内容ID（如果有新生成的内容）
      // 这里需要将生成的内容保存到数据库并关联到策略
      // 目前仅返回生成的内容

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
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONTROLLER_ERROR',
          message: error.message || 'Failed to generate content for strategy',
        },
      };
    }
  }
}
