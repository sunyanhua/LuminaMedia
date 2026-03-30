import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertRuleService } from '../../alerts/rules/alert-rule.service';
import { ScalingDecisionEngine } from './scaling-decision-engine.service';
import {
  ScalingEvent,
  ScalingEventType,
  ScalingDecision,
} from '../interfaces/autoscaling.interface';

/**
 * 扩缩容事件监控服务
 * 负责监控扩缩容事件并触发告警
 */
@Injectable()
export class ScalingEventMonitor {
  private readonly logger = new Logger(ScalingEventMonitor.name);
  private readonly eventStats: Map<
    string,
    {
      totalEvents: number;
      scaleUpEvents: number;
      scaleDownEvents: number;
      errorEvents: number;
      lastEventTime?: Date;
    }
  > = new Map();

  constructor(
    private readonly configService: ConfigService,
    @Optional() private readonly alertRuleService: AlertRuleService,
    private readonly decisionEngine: ScalingDecisionEngine,
  ) {}

  /**
   * 定期检查扩缩容事件并触发告警
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async monitorScalingEvents(): Promise<void> {
    try {
      this.logger.debug('开始监控扩缩容事件');

      // 获取最近的事件
      const recentEvents = await this.decisionEngine.getRecentEvents(
        undefined,
        100,
      );

      // 处理事件并更新统计
      for (const event of recentEvents) {
        await this.processEvent(event);
      }

      // 检查异常模式
      await this.checkForAnomalies();

      this.logger.debug('扩缩容事件监控完成');
    } catch (error) {
      this.logger.error('扩缩容事件监控失败', error.stack);
    }
  }

  /**
   * 处理单个事件
   */
  private async processEvent(event: ScalingEvent): Promise<void> {
    // 更新统计
    this.updateEventStats(event);

    // 检查是否需要触发告警
    if (event.type === ScalingEventType.ERROR) {
      await this.triggerErrorAlert(event);
    } else if (event.type === ScalingEventType.SCALE_UP) {
      await this.checkScaleUpPattern(event);
    } else if (event.type === ScalingEventType.SCALE_DOWN) {
      await this.checkScaleDownPattern(event);
    }

    // 记录重要事件
    if (this.isSignificantEvent(event)) {
      this.logger.log(`重要扩缩容事件: ${event.reason} - ${event.message}`);
    }
  }

  /**
   * 更新事件统计
   */
  private updateEventStats(event: ScalingEvent): void {
    const ruleId = event.ruleId;
    const stats = this.eventStats.get(ruleId) || {
      totalEvents: 0,
      scaleUpEvents: 0,
      scaleDownEvents: 0,
      errorEvents: 0,
      lastEventTime: undefined,
    };

    stats.totalEvents++;
    stats.lastEventTime = event.timestamp;

    switch (event.type) {
      case ScalingEventType.SCALE_UP:
        stats.scaleUpEvents++;
        break;
      case ScalingEventType.SCALE_DOWN:
        stats.scaleDownEvents++;
        break;
      case ScalingEventType.ERROR:
        stats.errorEvents++;
        break;
    }

    this.eventStats.set(ruleId, stats);
  }

  /**
   * 触发错误告警
   */
  private async triggerErrorAlert(event: ScalingEvent): Promise<void> {
    try {
      // 创建告警实例
      const alertInstance = {
        id: `scaling_error_${event.id}`,
        ruleId: 'scaling_error',
        ruleName: '扩缩容错误告警',
        severity: 'error' as const,
        title: `扩缩容执行失败: ${event.ruleId}`,
        description: event.message,
        triggeredAt: new Date(),
        metricValue: 1,
        threshold: 0,
        recovered: false,
        extraData: {
          eventId: event.id,
          ruleId: event.ruleId,
          error: event.error,
          currentReplicas: event.currentReplicas,
          desiredReplicas: event.desiredReplicas,
        },
      };

      // 这里应该调用告警服务发送告警
      // 当前仅记录日志
      this.logger.error(
        `扩缩容错误告警: ${event.ruleId} - ${event.error}`,
        JSON.stringify(alertInstance),
      );
    } catch (error) {
      this.logger.error('触发错误告警失败', error.stack);
    }
  }

  /**
   * 检查扩容模式
   */
  private async checkScaleUpPattern(event: ScalingEvent): Promise<void> {
    const stats = this.eventStats.get(event.ruleId);
    if (!stats) {
      return;
    }

    // 检查频繁扩容
    const timeWindow = 30 * 60 * 1000; // 30分钟
    const recentEvents = await this.decisionEngine.getRecentEvents(
      event.ruleId,
      20,
    );

    const scaleUpEvents = recentEvents.filter(
      (e) =>
        e.type === ScalingEventType.SCALE_UP &&
        e.timestamp.getTime() > Date.now() - timeWindow,
    );

    if (scaleUpEvents.length >= 5) {
      // 30分钟内扩容5次以上，可能存在问题
      await this.triggerFrequentScalingAlert(event, scaleUpEvents.length);
    }

    // 检查大规模扩容
    const scaleAmount =
      event.desiredReplicas - event.currentReplicas;
    if (scaleAmount >= 5) {
      await this.triggerLargeScaleAlert(event, scaleAmount);
    }
  }

  /**
   * 检查缩容模式
   */
  private async checkScaleDownPattern(event: ScalingEvent): Promise<void> {
    const stats = this.eventStats.get(event.ruleId);
    if (!stats) {
      return;
    }

    // 检查频繁缩容
    const timeWindow = 30 * 60 * 1000; // 30分钟
    const recentEvents = await this.decisionEngine.getRecentEvents(
      event.ruleId,
      20,
    );

    const scaleDownEvents = recentEvents.filter(
      (e) =>
        e.type === ScalingEventType.SCALE_DOWN &&
        e.timestamp.getTime() > Date.now() - timeWindow,
    );

    if (scaleDownEvents.length >= 5) {
      // 30分钟内缩容5次以上，可能存在问题
      await this.triggerFrequentScalingAlert(event, scaleDownEvents.length);
    }

    // 检查缩容到最小副本数
    // 这里需要知道规则的最小副本数，简化处理
    if (event.desiredReplicas <= 1) {
      await this.triggerMinReplicasAlert(event);
    }
  }

  /**
   * 触发频繁扩缩容告警
   */
  private async triggerFrequentScalingAlert(
    event: ScalingEvent,
    eventCount: number,
  ): Promise<void> {
    try {
      const alertInstance = {
        id: `frequent_scaling_${event.id}`,
        ruleId: 'frequent_scaling',
        ruleName: '频繁扩缩容告警',
        severity: 'warning' as const,
        title: `频繁扩缩容: ${event.ruleId}`,
        description: `在30分钟内检测到${eventCount}次扩缩容操作`,
        triggeredAt: new Date(),
        metricValue: eventCount,
        threshold: 5,
        recovered: false,
        extraData: {
          eventId: event.id,
          ruleId: event.ruleId,
          eventCount,
          eventType: event.type,
        },
      };

      this.logger.warn(
        `频繁扩缩容告警: ${event.ruleId} - ${eventCount}次操作`,
        JSON.stringify(alertInstance),
      );
    } catch (error) {
      this.logger.error('触发频繁扩缩容告警失败', error.stack);
    }
  }

  /**
   * 触发大规模扩容告警
   */
  private async triggerLargeScaleAlert(
    event: ScalingEvent,
    scaleAmount: number,
  ): Promise<void> {
    try {
      const alertInstance = {
        id: `large_scale_${event.id}`,
        ruleId: 'large_scale',
        ruleName: '大规模扩容告警',
        severity: 'warning' as const,
        title: `大规模扩容: ${event.ruleId}`,
        description: `检测到一次性扩容${scaleAmount}个副本`,
        triggeredAt: new Date(),
        metricValue: scaleAmount,
        threshold: 5,
        recovered: false,
        extraData: {
          eventId: event.id,
          ruleId: event.ruleId,
          scaleAmount,
          currentReplicas: event.currentReplicas,
          desiredReplicas: event.desiredReplicas,
        },
      };

      this.logger.warn(
        `大规模扩容告警: ${event.ruleId} - 扩容${scaleAmount}个副本`,
        JSON.stringify(alertInstance),
      );
    } catch (error) {
      this.logger.error('触发大规模扩容告警失败', error.stack);
    }
  }

  /**
   * 触发最小副本数告警
   */
  private async triggerMinReplicasAlert(event: ScalingEvent): Promise<void> {
    try {
      const alertInstance = {
        id: `min_replicas_${event.id}`,
        ruleId: 'min_replicas',
        ruleName: '最小副本数告警',
        severity: 'warning' as const,
        title: `接近最小副本数: ${event.ruleId}`,
        description: `服务已缩容到${event.desiredReplicas}个副本，接近最小配置`,
        triggeredAt: new Date(),
        metricValue: event.desiredReplicas,
        threshold: 2,
        recovered: false,
        extraData: {
          eventId: event.id,
          ruleId: event.ruleId,
          replicas: event.desiredReplicas,
        },
      };

      this.logger.warn(
        `最小副本数告警: ${event.ruleId} - 仅剩${event.desiredReplicas}个副本`,
        JSON.stringify(alertInstance),
      );
    } catch (error) {
      this.logger.error('触发最小副本数告警失败', error.stack);
    }
  }

  /**
   * 检查异常模式
   */
  private async checkForAnomalies(): Promise<void> {
    // 检查错误率
    for (const [ruleId, stats] of this.eventStats.entries()) {
      if (stats.totalEvents > 0) {
        const errorRate = stats.errorEvents / stats.totalEvents;
        if (errorRate > 0.3) {
          // 错误率超过30%
          await this.triggerHighErrorRateAlert(ruleId, errorRate, stats);
        }
      }

      // 检查最近是否有活动
      if (stats.lastEventTime) {
        const hoursSinceLastEvent =
          (Date.now() - stats.lastEventTime.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastEvent > 24) {
          // 24小时无活动
          await this.triggerNoActivityAlert(ruleId, hoursSinceLastEvent);
        }
      }
    }
  }

  /**
   * 触发高错误率告警
   */
  private async triggerHighErrorRateAlert(
    ruleId: string,
    errorRate: number,
    stats: any,
  ): Promise<void> {
    try {
      const alertInstance = {
        id: `high_error_rate_${ruleId}_${Date.now()}`,
        ruleId: 'high_error_rate',
        ruleName: '高错误率告警',
        severity: 'error' as const,
        title: `高错误率: ${ruleId}`,
        description: `扩缩容错误率达到${(errorRate * 100).toFixed(1)}%`,
        triggeredAt: new Date(),
        metricValue: errorRate,
        threshold: 0.3,
        recovered: false,
        extraData: {
          ruleId,
          errorRate,
          totalEvents: stats.totalEvents,
          errorEvents: stats.errorEvents,
        },
      };

      this.logger.error(
        `高错误率告警: ${ruleId} - ${(errorRate * 100).toFixed(1)}%`,
        JSON.stringify(alertInstance),
      );
    } catch (error) {
      this.logger.error('触发高错误率告警失败', error.stack);
    }
  }

  /**
   * 触发无活动告警
   */
  private async triggerNoActivityAlert(
    ruleId: string,
    hoursSinceLastEvent: number,
  ): Promise<void> {
    try {
      const alertInstance = {
        id: `no_activity_${ruleId}_${Date.now()}`,
        ruleId: 'no_activity',
        ruleName: '无活动告警',
        severity: 'info' as const,
        title: `无扩缩容活动: ${ruleId}`,
        description: `已${hoursSinceLastEvent.toFixed(1)}小时无扩缩容活动`,
        triggeredAt: new Date(),
        metricValue: hoursSinceLastEvent,
        threshold: 24,
        recovered: false,
        extraData: {
          ruleId,
          hoursSinceLastEvent,
        },
      };

      this.logger.warn(
        `无活动告警: ${ruleId} - ${hoursSinceLastEvent.toFixed(1)}小时无活动`,
        JSON.stringify(alertInstance),
      );
    } catch (error) {
      this.logger.error('触发无活动告警失败', error.stack);
    }
  }

  /**
   * 判断是否为重要事件
   */
  private isSignificantEvent(event: ScalingEvent): boolean {
    if (event.type === ScalingEventType.ERROR) {
      return true;
    }

    if (event.type === ScalingEventType.SCALE_UP) {
      const scaleAmount = event.desiredReplicas - event.currentReplicas;
      return scaleAmount >= 3;
    }

    if (event.type === ScalingEventType.SCALE_DOWN) {
      const scaleAmount = event.currentReplicas - event.desiredReplicas;
      return scaleAmount >= 3;
    }

    return false;
  }

  /**
   * 获取事件统计
   */
  getEventStats(): Array<{
    ruleId: string;
    totalEvents: number;
    scaleUpEvents: number;
    scaleDownEvents: number;
    errorEvents: number;
    lastEventTime?: Date;
    errorRate: number;
  }> {
    const result: any[] = [];

    for (const [ruleId, stats] of this.eventStats.entries()) {
      const errorRate =
        stats.totalEvents > 0 ? stats.errorEvents / stats.totalEvents : 0;

      result.push({
        ruleId,
        ...stats,
        errorRate,
      });
    }

    return result;
  }

  /**
   * 清除统计
   */
  clearStats(): void {
    this.eventStats.clear();
    this.logger.log('事件统计已清除');
  }

  /**
   * 获取健康状态
   */
  getHealthStatus(): {
    healthy: boolean;
    totalRules: number;
    totalEvents: number;
    errorRate: number;
    issues: Array<{
      ruleId: string;
      issue: string;
      severity: string;
    }>;
  } {
    const issues: Array<{ ruleId: string; issue: string; severity: string }> = [];
    let totalEvents = 0;
    let totalErrorEvents = 0;

    for (const [ruleId, stats] of this.eventStats.entries()) {
      totalEvents += stats.totalEvents;
      totalErrorEvents += stats.errorEvents;

      const errorRate = stats.totalEvents > 0 ? stats.errorEvents / stats.totalEvents : 0;
      if (errorRate > 0.3) {
        issues.push({
          ruleId,
          issue: `错误率过高: ${(errorRate * 100).toFixed(1)}%`,
          severity: 'error',
        });
      }

      if (stats.scaleUpEvents >= 10 && stats.scaleDownEvents >= 10) {
        issues.push({
          ruleId,
          issue: '频繁扩缩容震荡',
          severity: 'warning',
        });
      }
    }

    const overallErrorRate = totalEvents > 0 ? totalErrorEvents / totalEvents : 0;
    const healthy = overallErrorRate < 0.5 && issues.length === 0;

    return {
      healthy,
      totalRules: this.eventStats.size,
      totalEvents,
      errorRate: overallErrorRate,
      issues,
    };
  }
}