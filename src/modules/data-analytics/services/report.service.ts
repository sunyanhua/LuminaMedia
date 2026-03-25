import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserBehavior } from '../entities/user-behavior.entity';
import { MarketingCampaign } from '../entities/marketing-campaign.entity';
import { MarketingStrategy } from '../entities/marketing-strategy.entity';
import { UserBehaviorEvent } from '../../../shared/enums/user-behavior-event.enum';
import { CampaignStatus } from '../../../shared/enums/campaign-status.enum';

export interface ReportData {
  summary: {
    totalUsers?: number;
    totalCampaigns: number;
    totalStrategies: number;
    totalBehaviors: number;
    timeRange: {
      start: Date;
      end: Date;
    };
  };
  metrics: {
    engagementRate: number;
    campaignCompletionRate: number;
    averageStrategyConfidence: number;
    averageROI: number;
  };
  charts: {
    dailyActivity: Array<{ date: string; count: number }>;
    eventDistribution: Array<{ event: string; count: number }>;
    campaignStatus: Array<{ status: string; count: number }>;
    strategyTypes: Array<{ type: string; count: number }>;
  };
  recommendations: string[];
}

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(UserBehavior)
    private userBehaviorRepository: Repository<UserBehavior>,
    @InjectRepository(MarketingCampaign)
    private campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(MarketingStrategy)
    private strategyRepository: Repository<MarketingStrategy>,
  ) {}

  async generateBehaviorReport(userId: string): Promise<ReportData> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 获取用户行为数据
    const behaviors = await this.userBehaviorRepository.find({
      where: {
        userId,
        timestamp: Between(thirtyDaysAgo, now),
      },
      order: { timestamp: 'ASC' },
    });

    // 获取用户的营销活动和策略
    const campaigns = await this.campaignRepository.find({
      where: { userId },
      relations: ['strategies'],
    });

    const allStrategies = campaigns.flatMap((c) => c.strategies || []);

    // 生成报告数据
    return this.buildReportData(
      behaviors,
      campaigns,
      allStrategies,
      thirtyDaysAgo,
      now,
      userId,
    );
  }

  async generateCampaignReport(campaignId: string): Promise<ReportData> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['strategies', 'user'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }

    const userId = campaign.userId;
    const now = new Date();
    const startDate =
      campaign.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = campaign.endDate || now;

    // 获取活动期间的用户行为
    const behaviors = await this.userBehaviorRepository.find({
      where: {
        userId,
        timestamp: Between(startDate, endDate),
      },
    });

    return this.buildReportData(
      behaviors,
      [campaign],
      campaign.strategies || [],
      startDate,
      endDate,
      userId,
    );
  }

  async exportReport(
    reportId: string,
    format: 'json' | 'pdf' = 'json',
  ): Promise<any> {
    // 简化版本：只返回 JSON 格式
    if (format === 'json') {
      // 这里应该根据 reportId 获取已生成的报告
      // 为演示目的，我们生成一个简单报告
      const mockReport = {
        id: reportId,
        generatedAt: new Date().toISOString(),
        format: 'json',
        data: {
          message: 'This is a mock exported report',
          downloadUrl: `/api/v1/analytics/reports/${reportId}/download`,
        },
      };

      return mockReport;
    }

    // PDF 导出（模拟）
    return {
      success: false,
      message: 'PDF export not implemented in demo version',
      suggestion: 'Use JSON format for now',
    };
  }

  private buildReportData(
    behaviors: UserBehavior[],
    campaigns: MarketingCampaign[],
    strategies: MarketingStrategy[],
    startDate: Date,
    endDate: Date,
    userId: string,
  ): ReportData {
    // 计算每日活跃度
    const dailyActivity = this.calculateDailyActivity(
      behaviors,
      startDate,
      endDate,
    );

    // 计算事件分布
    const eventDistribution = this.calculateEventDistribution(behaviors);

    // 计算活动状态分布
    const campaignStatus = this.calculateCampaignStatus(campaigns);

    // 计算策略类型分布
    const strategyTypes = this.calculateStrategyTypes(strategies);

    // 计算指标
    const engagementRate = this.calculateEngagementRate(behaviors);
    const campaignCompletionRate =
      this.calculateCampaignCompletionRate(campaigns);
    const averageStrategyConfidence =
      this.calculateAverageStrategyConfidence(strategies);
    const averageROI = this.calculateAverageROI(strategies);

    // 生成建议
    const recommendations = this.generateRecommendations(
      engagementRate,
      campaignCompletionRate,
      averageStrategyConfidence,
      strategies.length,
    );

    return {
      summary: {
        totalCampaigns: campaigns.length,
        totalStrategies: strategies.length,
        totalBehaviors: behaviors.length,
        timeRange: {
          start: startDate,
          end: endDate,
        },
      },
      metrics: {
        engagementRate,
        campaignCompletionRate,
        averageStrategyConfidence,
        averageROI,
      },
      charts: {
        dailyActivity,
        eventDistribution,
        campaignStatus,
        strategyTypes,
      },
      recommendations,
    };
  }

  private calculateDailyActivity(
    behaviors: UserBehavior[],
    startDate: Date,
    endDate: Date,
  ): Array<{ date: string; count: number }> {
    const dailyCounts: Record<string, number> = {};
    const currentDate = new Date(startDate);

    // 初始化所有日期
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dailyCounts[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 统计实际行为
    behaviors.forEach((behavior) => {
      const dateStr = behavior.timestamp.toISOString().split('T')[0];
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++;
      }
    });

    // 转换为数组格式
    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateEventDistribution(
    behaviors: UserBehavior[],
  ): Array<{ event: string; count: number }> {
    const distribution: Record<string, number> = {};

    behaviors.forEach((behavior) => {
      const event = behavior.eventType;
      distribution[event] = (distribution[event] || 0) + 1;
    });

    return Object.entries(distribution).map(([event, count]) => ({
      event,
      count,
    }));
  }

  private calculateCampaignStatus(
    campaigns: MarketingCampaign[],
  ): Array<{ status: string; count: number }> {
    const statusCounts: Record<string, number> = {};

    campaigns.forEach((campaign) => {
      const status = campaign.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }

  private calculateStrategyTypes(
    strategies: MarketingStrategy[],
  ): Array<{ type: string; count: number }> {
    const typeCounts: Record<string, number> = {};

    strategies.forEach((strategy) => {
      const type = strategy.strategyType;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
    }));
  }

  private calculateEngagementRate(behaviors: UserBehavior[]): number {
    if (behaviors.length === 0) return 0;

    const uniqueDays = new Set(
      behaviors.map((b) => b.timestamp.toISOString().split('T')[0]),
    ).size;

    // 简化计算：活跃天数比例 * 平均每日事件数
    const totalDays = 30; // 假设统计30天
    const dayRatio = uniqueDays / totalDays;
    const avgDailyEvents = behaviors.length / Math.max(1, uniqueDays);

    return Math.min(100, (dayRatio * 100 + avgDailyEvents) / 2);
  }

  private calculateCampaignCompletionRate(
    campaigns: MarketingCampaign[],
  ): number {
    if (campaigns.length === 0) return 0;

    const completed = campaigns.filter(
      (c) => c.status === CampaignStatus.COMPLETED,
    ).length;

    return Math.round((completed / campaigns.length) * 100);
  }

  private calculateAverageStrategyConfidence(
    strategies: MarketingStrategy[],
  ): number {
    if (strategies.length === 0) return 0;

    const total = strategies.reduce((sum, s) => sum + (parseFloat(s.confidenceScore) || 0), 0);
    return Math.round(total / strategies.length);
  }

  private calculateAverageROI(strategies: MarketingStrategy[]): number {
    if (strategies.length === 0) return 0;

    const strategiesWithROI = strategies.filter((s) => s.expectedROI != null);
    if (strategiesWithROI.length === 0) return 0;

    const total = strategiesWithROI.reduce((sum, s) => sum + (parseFloat(s.expectedROI) || 0), 0);
    return Math.round((total / strategiesWithROI.length) * 100) / 100;
  }

  private generateRecommendations(
    engagementRate: number,
    completionRate: number,
    confidenceScore: number,
    strategyCount: number,
  ): string[] {
    const recommendations: string[] = [];

    if (engagementRate < 50) {
      recommendations.push('用户参与度较低，建议增加互动内容和提醒机制');
    }

    if (completionRate < 60) {
      recommendations.push('活动完成率不高，建议设置更明确的里程碑和激励机制');
    }

    if (confidenceScore < 70) {
      recommendations.push('策略置信度有待提高，建议进行更多数据分析和测试');
    }

    if (strategyCount === 0) {
      recommendations.push('尚未创建营销策略，建议为活动制定具体策略');
    } else if (strategyCount < 3) {
      recommendations.push('策略数量较少，建议为每个活动制定多维度策略');
    }

    if (recommendations.length === 0) {
      recommendations.push('整体表现良好，继续保持当前策略');
    }

    return recommendations;
  }
}
