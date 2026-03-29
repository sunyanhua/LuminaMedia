import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScalingMetricsService } from './scaling-metrics.service';
import { KubernetesScalingProvider } from '../integrations/kubernetes-scaling-provider.service';
import {
  ScalingRule,
  ScalingDecision,
  ScalingMetric,
  ScalingEvent,
  ScalingEventType,
  ScalingProvider,
} from '../interfaces/autoscaling.interface';

/**
 * 扩缩容决策引擎
 * 负责评估扩缩容规则并做出决策
 */
@Injectable()
export class ScalingDecisionEngine {
  private readonly logger = new Logger(ScalingDecisionEngine.name);
  private readonly decisions: ScalingDecision[] = [];
  private readonly events: ScalingEvent[] = [];
  private readonly maxHistorySize = 1000;

  constructor(
    private readonly configService: ConfigService,
    private readonly metricsService: ScalingMetricsService,
    private readonly scalingProvider: KubernetesScalingProvider,
  ) {}

  /**
   * 定期评估所有启用的规则
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async evaluateAllRules(): Promise<void> {
    try {
      this.logger.debug('开始定期评估扩缩容规则');

      // 获取所有启用的规则（这里简化处理，实际应从数据库或配置加载）
      const rules = await this.getEnabledRules();

      for (const rule of rules) {
        try {
          await this.evaluateAndExecuteRule(rule);
        } catch (error) {
          this.logger.error(`评估规则失败: ${rule.name}`, error.stack);
        }
      }

      this.logger.debug('定期评估扩缩容规则完成');
    } catch (error) {
      this.logger.error('定期评估扩缩容规则失败', error.stack);
    }
  }

  /**
   * 评估并执行扩缩容规则
   */
  async evaluateAndExecuteRule(rule: ScalingRule): Promise<ScalingEvent> {
    this.logger.debug(`评估规则: ${rule.name}`);

    // 1. 评估规则
    const decision = await this.evaluateRule(rule);

    // 2. 执行决策
    const event = await this.executeDecision(decision);

    // 3. 更新规则状态
    rule.lastEvaluatedAt = new Date();
    rule.currentReplicas = decision.currentReplicas;
    rule.desiredReplicas = decision.finalReplicas;

    return event;
  }

  /**
   * 评估扩缩容规则
   */
  async evaluateRule(rule: ScalingRule): Promise<ScalingDecision> {
    const timestamp = new Date();

    // 1. 获取当前副本数
    const currentReplicas = await this.scalingProvider.getCurrentReplicas(
      rule.targetDeployment,
    );

    // 2. 获取所有指标值
    const metricValues = await this.metricsService.getMetricValues(rule.metrics);

    // 3. 为每个指标计算期望副本数
    const metricEvaluations = [];
    let calculatedReplicas = currentReplicas;

    for (const { metric, value } of metricValues) {
      const targetValue = metric.targetValue;
      let metricReplicas = currentReplicas;

      // 根据指标类型和目标类型计算副本数
      if (metric.targetType === 'Utilization') {
        // 利用率类型：计算达到目标利用率所需的副本数
        // desiredReplicas = ceil(currentReplicas * (currentMetricValue / targetMetricValue))
        if (targetValue > 0 && value > 0) {
          metricReplicas = Math.ceil((currentReplicas * value) / targetValue);
        }
      } else if (metric.targetType === 'AverageValue') {
        // 平均值类型：计算达到目标平均值所需的副本数
        // desiredReplicas = ceil(currentMetricValue / targetMetricValue)
        if (targetValue > 0) {
          metricReplicas = Math.ceil(value / targetValue);
        }
      } else if (metric.targetType === 'Value') {
        // 绝对值类型：直接使用目标值作为副本数
        metricReplicas = targetValue;
      }

      // 应用行为策略（简化处理）
      metricReplicas = this.applyBehaviorStrategy(
        rule,
        metricReplicas,
        currentReplicas,
        'evaluation',
      );

      metricEvaluations.push({
        metric,
        currentValue: value,
        targetValue,
        calculatedReplicas: metricReplicas,
      });

      // 取所有指标中计算出的最大副本数（Kubernetes HPA行为）
      if (metricReplicas > calculatedReplicas) {
        calculatedReplicas = metricReplicas;
      }
    }

    // 如果没有指标数据，保持当前副本数
    if (metricEvaluations.length === 0) {
      calculatedReplicas = currentReplicas;
    }

    // 4. 应用最小/最大副本数限制
    let finalReplicas = Math.max(rule.minReplicas, calculatedReplicas);
    finalReplicas = Math.min(rule.maxReplicas, finalReplicas);

    // 5. 应用行为策略
    finalReplicas = this.applyBehaviorStrategy(
      rule,
      finalReplicas,
      currentReplicas,
      'final',
    );

    // 6. 确定扩缩容方向和数量
    const needsScaling = finalReplicas !== currentReplicas;
    let direction: 'up' | 'down' | 'none' = 'none';
    let scaleAmount = 0;

    if (needsScaling) {
      if (finalReplicas > currentReplicas) {
        direction = 'up';
        scaleAmount = finalReplicas - currentReplicas;
      } else {
        direction = 'down';
        scaleAmount = currentReplicas - finalReplicas;
      }
    }

    // 7. 创建决策记录
    const decision: ScalingDecision = {
      ruleId: rule.id,
      timestamp,
      currentReplicas,
      calculatedReplicas,
      finalReplicas,
      metricEvaluations,
      needsScaling,
      direction,
      scaleAmount,
    };

    // 8. 保存决策历史
    this.saveDecision(decision);

    this.logger.debug(`规则评估完成: ${rule.name}，决策: ${JSON.stringify(decision)}`);
    return decision;
  }

  /**
   * 应用行为策略
   */
  private applyBehaviorStrategy(
    rule: ScalingRule,
    desiredReplicas: number,
    currentReplicas: number,
    stage: 'evaluation' | 'final',
  ): number {
    if (!rule.behavior) {
      return desiredReplicas;
    }

    let result = desiredReplicas;

    // 扩容行为策略
    if (desiredReplicas > currentReplicas && rule.behavior.scaleUp) {
      const policies = rule.behavior.scaleUp.policies;
      result = this.applyPolicies(policies, desiredReplicas, currentReplicas);
    }
    // 缩容行为策略
    else if (desiredReplicas < currentReplicas && rule.behavior.scaleDown) {
      const policies = rule.behavior.scaleDown.policies;
      result = this.applyPolicies(policies, desiredReplicas, currentReplicas);
    }

    return result;
  }

  /**
   * 应用策略
   */
  private applyPolicies(
    policies: Array<{ type: 'Pods' | 'Percent'; value: number; periodSeconds: number }>,
    desiredReplicas: number,
    currentReplicas: number,
  ): number {
    let result = desiredReplicas;

    for (const policy of policies) {
      let policyReplicas = desiredReplicas;

      if (policy.type === 'Pods') {
        // Pods策略：每次扩缩容固定数量的Pod
        const diff = desiredReplicas - currentReplicas;
        if (diff > 0) {
          // 扩容：最多增加policy.value个Pod
          policyReplicas = currentReplicas + Math.min(diff, policy.value);
        } else {
          // 缩容：最多减少policy.value个Pod
          policyReplicas = currentReplicas - Math.min(-diff, policy.value);
        }
      } else if (policy.type === 'Percent') {
        // Percent策略：按百分比扩缩容
        const percentage = policy.value / 100;
        if (desiredReplicas > currentReplicas) {
          // 扩容：增加当前副本数的百分比
          const increase = Math.ceil(currentReplicas * percentage);
          policyReplicas = currentReplicas + increase;
        } else {
          // 缩容：减少当前副本数的百分比
          const decrease = Math.ceil(currentReplicas * percentage);
          policyReplicas = Math.max(1, currentReplicas - decrease);
        }
      }

      // 选择策略（简化处理，实际应考虑稳定窗口等）
      result = policyReplicas;
      break; // 简化：只应用第一个策略
    }

    return result;
  }

  /**
   * 执行扩缩容决策
   */
  async executeDecision(decision: ScalingDecision): Promise<ScalingEvent> {
    const timestamp = new Date();
    let eventType = ScalingEventType.NO_SCALE;
    let successful = true;
    let error: string | undefined;
    let actualReplicas = decision.currentReplicas;

    try {
      if (decision.needsScaling) {
        // 获取规则（简化处理）
        const rule = await this.getRuleById(decision.ruleId);
        if (!rule) {
          throw new Error(`未找到规则: ${decision.ruleId}`);
        }

        // 执行扩缩容
        const success = await this.scalingProvider.scaleDeployment(
          rule.targetDeployment,
          decision.finalReplicas,
        );

        if (success) {
          eventType =
            decision.direction === 'up'
              ? ScalingEventType.SCALE_UP
              : ScalingEventType.SCALE_DOWN;
          actualReplicas = decision.finalReplicas;
          this.logger.log(
            `扩缩容执行成功: ${rule.name}，${decision.currentReplicas} -> ${decision.finalReplicas}`,
          );
        } else {
          eventType = ScalingEventType.ERROR;
          successful = false;
          error = '扩缩容操作失败';
          this.logger.error(`扩缩容执行失败: ${rule.name}`);
        }
      } else {
        this.logger.debug(`无需扩缩容: 规则 ${decision.ruleId}`);
      }
    } catch (err) {
      eventType = ScalingEventType.ERROR;
      successful = false;
      error = err.message;
      this.logger.error(`执行扩缩容决策失败: ${decision.ruleId}`, err.stack);
    }

    // 创建事件
    const event: ScalingEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: decision.ruleId,
      type: eventType,
      timestamp,
      currentReplicas: decision.currentReplicas,
      desiredReplicas: decision.finalReplicas,
      metricValues: decision.metricEvaluations.map((e) => ({
        metric: e.metric.name,
        currentValue: e.currentValue,
        targetValue: e.targetValue,
      })),
      reason: this.getEventReason(eventType, decision),
      message: this.getEventMessage(eventType, decision, error),
      successful,
      error,
    };

    // 保存事件
    this.saveEvent(event);

    return event;
  }

  /**
   * 获取事件原因
   */
  private getEventReason(
    eventType: ScalingEventType,
    decision: ScalingDecision,
  ): string {
    switch (eventType) {
      case ScalingEventType.SCALE_UP:
        return 'HighResourceUsage';
      case ScalingEventType.SCALE_DOWN:
        return 'LowResourceUsage';
      case ScalingEventType.NO_SCALE:
        return 'WithinThreshold';
      case ScalingEventType.ERROR:
        return 'ExecutionError';
      default:
        return 'Unknown';
    }
  }

  /**
   * 获取事件消息
   */
  private getEventMessage(
    eventType: ScalingEventType,
    decision: ScalingDecision,
    error?: string,
  ): string {
    switch (eventType) {
      case ScalingEventType.SCALE_UP:
        return `从 ${decision.currentReplicas} 扩容到 ${decision.finalReplicas} 个副本`;
      case ScalingEventType.SCALE_DOWN:
        return `从 ${decision.currentReplicas} 缩容到 ${decision.finalReplicas} 个副本`;
      case ScalingEventType.NO_SCALE:
        return `当前副本数 ${decision.currentReplicas} 在阈值范围内，无需调整`;
      case ScalingEventType.ERROR:
        return `扩缩容失败: ${error || '未知错误'}`;
      default:
        return '未知事件类型';
    }
  }

  /**
   * 获取所有规则的最新决策
   */
  async getRecentDecisions(
    ruleId?: string,
    limit: number = 50,
  ): Promise<ScalingDecision[]> {
    let decisions = this.decisions;

    if (ruleId) {
      decisions = decisions.filter((d) => d.ruleId === ruleId);
    }

    // 按时间倒序排序
    decisions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return decisions.slice(0, limit);
  }

  /**
   * 获取所有事件
   */
  async getRecentEvents(
    ruleId?: string,
    limit: number = 50,
  ): Promise<ScalingEvent[]> {
    let events = this.events;

    if (ruleId) {
      events = events.filter((e) => e.ruleId === ruleId);
    }

    // 按时间倒序排序
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return events.slice(0, limit);
  }

  /**
   * 保存决策
   */
  private saveDecision(decision: ScalingDecision): void {
    this.decisions.push(decision);

    // 限制历史记录大小
    if (this.decisions.length > this.maxHistorySize) {
      this.decisions.splice(0, this.decisions.length - this.maxHistorySize);
    }
  }

  /**
   * 保存事件
   */
  private saveEvent(event: ScalingEvent): void {
    this.events.push(event);

    // 限制历史记录大小
    if (this.events.length > this.maxHistorySize) {
      this.events.splice(0, this.events.length - this.maxHistorySize);
    }
  }

  /**
   * 获取启用的规则（简化实现）
   */
  private async getEnabledRules(): Promise<ScalingRule[]> {
    // 这里应该从数据库或配置加载规则
    // 当前返回预定义规则中启用的规则
    const { PREDEFINED_SCALING_RULES } = await import(
      '../interfaces/autoscaling.interface'
    );
    return PREDEFINED_SCALING_RULES.filter((rule) => rule.enabled);
  }

  /**
   * 根据ID获取规则（简化实现）
   */
  private async getRuleById(ruleId: string): Promise<ScalingRule | null> {
    const rules = await this.getEnabledRules();
    return rules.find((rule) => rule.id === ruleId) || null;
  }

  /**
   * 手动触发规则评估
   */
  async triggerEvaluation(ruleId?: string): Promise<ScalingEvent[]> {
    const events: ScalingEvent[] = [];
    const rules = await this.getEnabledRules();

    for (const rule of rules) {
      if (ruleId && rule.id !== ruleId) {
        continue;
      }

      try {
        const event = await this.evaluateAndExecuteRule(rule);
        events.push(event);
      } catch (error) {
        this.logger.error(`手动触发评估失败: ${rule.name}`, error.stack);
      }
    }

    return events;
  }

  /**
   * 获取决策引擎状态
   */
  getEngineStatus(): {
    totalDecisions: number;
    totalEvents: number;
    lastEvaluationTime?: Date;
    enabledRules: number;
  } {
    const lastDecision = this.decisions[this.decisions.length - 1];
    const rules = this.getEnabledRules();

    return {
      totalDecisions: this.decisions.length,
      totalEvents: this.events.length,
      lastEvaluationTime: lastDecision?.timestamp,
      enabledRules: rules.length,
    };
  }
}