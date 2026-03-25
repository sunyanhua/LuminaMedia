import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserBehavior } from '../entities/user-behavior.entity';
import { MarketingCampaign } from '../entities/marketing-campaign.entity';
import { MarketingStrategy } from '../entities/marketing-strategy.entity';
import { DateRange } from '../interfaces/date-range.interface';
import {
  BehaviorAnalytics,
  EngagementMetrics,
  CampaignInsights,
} from '../interfaces/behavior-analytics.interface';
import { UserBehaviorEvent } from '../../../shared/enums/user-behavior-event.enum';
import { CampaignStatus } from '../../../shared/enums/campaign-status.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserBehavior)
    private userBehaviorRepository: Repository<UserBehavior>,
    @InjectRepository(MarketingCampaign)
    private campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(MarketingStrategy)
    private strategyRepository: Repository<MarketingStrategy>,
  ) {}

  async analyzeUserBehavior(
    userId: string,
    dateRange: DateRange,
  ): Promise<BehaviorAnalytics> {
    const behaviors = await this.userBehaviorRepository.find({
      where: {
        userId,
        timestamp: Between(dateRange.startDate, dateRange.endDate),
      },
      order: { timestamp: 'ASC' },
    });

    if (behaviors.length === 0) {
      throw new NotFoundException(`No behavior data found for user ${userId}`);
    }

    // 计算事件分布
    const eventDistribution: Record<UserBehaviorEvent, number> = Object.values(
      UserBehaviorEvent,
    ).reduce(
      (acc, event) => {
        acc[event] = 0;
        return acc;
      },
      {} as Record<UserBehaviorEvent, number>,
    );

    const sessions = new Set<string>();
    const hourlyCounts = new Array(24).fill(0);

    behaviors.forEach((behavior) => {
      eventDistribution[behavior.eventType] =
        (eventDistribution[behavior.eventType] || 0) + 1;
      sessions.add(behavior.sessionId);

      const hour = behavior.timestamp.getHours();
      hourlyCounts[hour]++;
    });

    // 计算每日活跃天数
    const uniqueDays = new Set(
      behaviors.map((b) => b.timestamp.toISOString().split('T')[0]),
    ).size;

    // 最活跃的小时
    const mostActiveHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));

    // 最常见的事件
    const mostCommonEventEntry = Object.entries(eventDistribution).reduce(
      (maxEntry, entry) => (entry[1] > maxEntry[1] ? entry : maxEntry),
      ['', 0] as [string, number],
    );
    const mostCommonEvent = mostCommonEventEntry[0] as UserBehaviorEvent;

    // 计算平均会话时长（简化版本）
    const sessionDurations = await this.calculateSessionDurations(
      userId,
      dateRange,
    );
    const averageSessionDuration =
      sessionDurations.length > 0
        ? sessionDurations.reduce((sum, dur) => sum + dur, 0) /
          sessionDurations.length
        : 0;

    return {
      userId,
      totalEvents: behaviors.length,
      eventDistribution,
      dailyActiveDays: uniqueDays,
      averageEventsPerDay: behaviors.length / Math.max(1, uniqueDays),
      mostActiveHour,
      mostCommonEvent,
      sessionCount: sessions.size,
      averageSessionDuration,
    };
  }

  async generateCampaignInsights(
    campaignId: string,
  ): Promise<CampaignInsights> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['strategies'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }

    const strategies = campaign.strategies || [];
    const strategyTypeDistribution: Record<string, number> = {};

    strategies.forEach((strategy) => {
      const type = strategy.strategyType;
      strategyTypeDistribution[type] =
        (strategyTypeDistribution[type] || 0) + 1;
    });

    const averageConfidenceScore =
      strategies.length > 0
        ? strategies.reduce((sum, s) => sum + (parseFloat(s.confidenceScore) || 0), 0) /
          strategies.length
        : 0;

    const estimatedTotalROI = strategies.reduce(
      (sum, s) => sum + (parseFloat(s.expectedROI) || 0),
      0,
    );

    // 计算完成率（简化版本）
    const completionRate =
      campaign.status === CampaignStatus.COMPLETED ? 100 : 0;

    return {
      campaignId,
      totalStrategies: strategies.length,
      averageConfidenceScore,
      strategyTypeDistribution,
      estimatedTotalROI,
      completionRate,
    };
  }

  async calculateEngagementMetrics(userId: string): Promise<EngagementMetrics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const behaviors = await this.userBehaviorRepository.find({
      where: {
        userId,
        timestamp: Between(thirtyDaysAgo, now),
      },
    });

    // 计算指标
    const contentCreations = behaviors.filter(
      (b) => b.eventType === UserBehaviorEvent.CONTENT_CREATE,
    ).length;
    const publishTasks = behaviors.filter(
      (b) => b.eventType === UserBehaviorEvent.PUBLISH_TASK,
    ).length;
    const logins = behaviors.filter(
      (b) => b.eventType === UserBehaviorEvent.LOGIN,
    ).length;

    const sessions = new Set(behaviors.map((b) => b.sessionId));
    const sessionDurations = await this.calculateSessionDurations(userId, {
      startDate: thirtyDaysAgo,
      endDate: now,
    });

    const averageSessionTime =
      sessionDurations.length > 0
        ? sessionDurations.reduce((sum, dur) => sum + dur, 0) /
          sessionDurations.length
        : 0;

    // 计算参与度分数（简化版本）
    const engagementScore = Math.min(
      100,
      (contentCreations * 10 +
        publishTasks * 15 +
        logins * 5 +
        sessions.size * 3 +
        averageSessionTime * 2) /
        10,
    );

    return {
      userId,
      engagementScore,
      contentCreationRate: contentCreations / 4.3, // 近似每周
      taskCompletionRate: publishTasks > 0 ? 75 : 0, // 简化
      loginFrequency: logins / 4.3, // 近似每周
      averageSessionTime,
    };
  }

  private async calculateSessionDurations(
    userId: string,
    dateRange: DateRange,
  ): Promise<number[]> {
    // 简化版本：假设每个会话持续时间为随机值（实际应计算会话内第一个和最后一个事件的时间差）
    const behaviors = await this.userBehaviorRepository.find({
      where: {
        userId,
        timestamp: Between(dateRange.startDate, dateRange.endDate),
      },
      order: { timestamp: 'ASC' },
    });

    const sessions: Record<string, Date[]> = {};
    behaviors.forEach((behavior) => {
      if (!sessions[behavior.sessionId]) {
        sessions[behavior.sessionId] = [];
      }
      sessions[behavior.sessionId].push(behavior.timestamp);
    });

    return Object.values(sessions)
      .map((timestamps) => {
        if (timestamps.length < 2) return 5; // 默认5分钟
        const duration =
          (timestamps[timestamps.length - 1].getTime() -
            timestamps[0].getTime()) /
          (1000 * 60); // 转换为分钟
        return Math.max(1, Math.min(duration, 120)); // 限制在1-120分钟
      })
      .filter((duration) => !isNaN(duration));
  }
}
