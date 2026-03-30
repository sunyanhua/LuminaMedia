import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { MetricsCollectorService } from '../../metrics/collectors/metrics-collector.service';
import {
  AlertRule,
  AlertInstance,
  AlertChannel,
  AlertCondition,
  AlertRuleType,
  AlertSeverity,
  AlertChannelType,
  PREDEFINED_ALERT_RULES,
} from '../../interfaces/alerts.interface';

@Injectable()
export class AlertRuleService implements OnModuleInit {
  private readonly logger = new Logger(AlertRuleService.name);
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, AlertInstance> = new Map();
  private channels: Map<string, AlertChannel> = new Map();
  private readonly alertHistorySize = 1000;

  constructor(
    private configService: ConfigService,
    private metricsCollector: MetricsCollectorService,
  ) {}

  async onModuleInit() {
    await this.initializeRules();
    await this.initializeChannels();
    this.logger.log('Alert rule service initialized');
  }

  /**
   * 初始化预定义告警规则
   */
  private async initializeRules(): Promise<void> {
    PREDEFINED_ALERT_RULES.forEach((rule) => {
      this.rules.set(rule.id, { ...rule, triggerCount: 0 });
    });
    this.logger.log(`Initialized ${this.rules.size} alert rules`);
  }

  /**
   * 初始化告警渠道
   */
  private async initializeChannels(): Promise<void> {
    // 默认渠道：控制台和仪表盘
    const defaultChannels: AlertChannel[] = [
      {
        id: 'console',
        type: AlertChannelType.DASHBOARD,
        name: '控制台输出',
        config: {},
        enabled: true,
      },
      {
        id: 'dashboard',
        type: AlertChannelType.DASHBOARD,
        name: '监控仪表盘',
        config: {},
        enabled: true,
      },
    ];

    // 从配置加载其他渠道
    const emailEnabled =
      this.configService.get<string>('ALERT_EMAIL_ENABLED', 'false') === 'true';
    if (emailEnabled) {
      defaultChannels.push({
        id: 'email',
        type: AlertChannelType.EMAIL,
        name: '邮件通知',
        config: {
          smtpHost: this.configService.get<string>('ALERT_EMAIL_SMTP_HOST'),
          smtpPort: this.configService.get<string>('ALERT_EMAIL_SMTP_PORT'),
          from: this.configService.get<string>('ALERT_EMAIL_FROM'),
          to: this.configService.get<string>('ALERT_EMAIL_TO'),
        },
        enabled: true,
      });
    }

    defaultChannels.forEach((channel) => {
      this.channels.set(channel.id, channel);
    });

    this.logger.log(`Initialized ${this.channels.size} alert channels`);
  }

  /**
   * 定时检查告警规则（每分钟）
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkAllRules(): Promise<void> {
    if (this.rules.size === 0) {
      return;
    }

    this.logger.debug(`Checking ${this.rules.size} alert rules`);
    const now = new Date();

    for (const rule of this.rules.values()) {
      if (!rule.enabled) {
        continue;
      }

      // 检查静默期
      if (rule.lastTriggeredAt && rule.silencePeriod) {
        const silenceEnd = new Date(
          rule.lastTriggeredAt.getTime() + rule.silencePeriod * 1000,
        );
        if (now < silenceEnd) {
          continue;
        }
      }

      // 检查规则条件
      const shouldTrigger = await this.evaluateRule(rule);
      if (shouldTrigger) {
        await this.triggerAlert(rule, now);
      }
    }
  }

  /**
   * 评估规则条件
   */
  private async evaluateRule(rule: AlertRule): Promise<boolean> {
    // 目前只支持阈值规则
    if (rule.type !== AlertRuleType.THRESHOLD) {
      return false;
    }

    // 评估所有条件（AND逻辑）
    for (const condition of rule.conditions) {
      const result = await this.evaluateCondition(condition);
      if (!result) {
        return false;
      }
    }

    return true;
  }

  /**
   * 评估单个条件
   */
  private async evaluateCondition(condition: AlertCondition): Promise<boolean> {
    const {
      metric,
      operator,
      threshold,
      timeWindow = 300,
      aggregation = 'avg',
    } = condition;
    const now = new Date();
    const startTime = new Date(now.getTime() - timeWindow * 1000);

    // 获取指标时间序列
    const timeSeries = await this.metricsCollector.getTimeSeries(
      metric,
      startTime,
      now,
    );

    if (timeSeries.length === 0) {
      return false;
    }

    // 计算聚合值
    const aggregatedValue = this.aggregateMetrics(timeSeries, aggregation);
    if (aggregatedValue === null) {
      return false;
    }

    // 应用操作符
    return this.applyOperator(aggregatedValue, operator, threshold);
  }

  /**
   * 聚合指标值
   */
  private aggregateMetrics(metrics: any[], aggregation: string): number | null {
    if (metrics.length === 0) {
      return null;
    }

    const values = metrics.map((m) => m.value);

    switch (aggregation) {
      case 'avg':
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      case 'p95':
        return this.calculatePercentile(values, 95);
      case 'p99':
        return this.calculatePercentile(values, 99);
      case 'rate':
        // 计算速率（每秒）
        if (metrics.length < 2) {
          return 0;
        }
        const firstTime = metrics[0].timestamp;
        const lastTime = metrics[metrics.length - 1].timestamp;
        const timeDiff = (lastTime - firstTime) / 1000;
        if (timeDiff <= 0) {
          return 0;
        }
        return values.reduce((sum, val) => sum + val, 0) / timeDiff;
      case 'success_rate':
        // 计算成功率（需要特殊处理）
        return 0.95; // 简化实现
      default:
        return values[values.length - 1]; // 默认取最新值
    }
  }

  /**
   * 计算百分位数
   */
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  /**
   * 应用操作符
   */
  private applyOperator(
    value: number,
    operator: string,
    threshold: number,
  ): boolean {
    switch (operator) {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return Math.abs(value - threshold) < 0.0001;
      case '!=':
        return Math.abs(value - threshold) >= 0.0001;
      default:
        return false;
    }
  }

  /**
   * 触发告警
   */
  private async triggerAlert(
    rule: AlertRule,
    triggeredAt: Date,
  ): Promise<void> {
    // 更新规则状态
    rule.lastTriggeredAt = triggeredAt;
    rule.triggerCount = (rule.triggerCount || 0) + 1;
    this.rules.set(rule.id, rule);

    // 获取条件值用于告警详情
    const conditionValues: number[] = [];
    for (const condition of rule.conditions) {
      const timeSeries = await this.metricsCollector.getTimeSeries(
        condition.metric,
        new Date(triggeredAt.getTime() - (condition.timeWindow || 300) * 1000),
        triggeredAt,
      );
      if (timeSeries.length > 0) {
        const aggregatedValue = this.aggregateMetrics(
          timeSeries,
          condition.aggregation || 'avg',
        );
        conditionValues.push(aggregatedValue || 0);
      }
    }

    // 创建告警实例
    const alertId = `${rule.id}_${triggeredAt.getTime()}`;
    const alert: AlertInstance = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      title: `告警: ${rule.name}`,
      description: rule.description,
      triggeredAt,
      metricValue: conditionValues[0] || 0,
      threshold: rule.conditions[0]?.threshold || 0,
      recovered: false,
      extraData: {
        conditionValues,
        ruleConditions: rule.conditions,
      },
    };

    this.alerts.set(alertId, alert);

    // 发送通知
    await this.sendAlertNotifications(alert);

    this.logger.warn(`Alert triggered: ${rule.name} (${rule.severity})`);
  }

  /**
   * 发送告警通知
   */
  private async sendAlertNotifications(alert: AlertInstance): Promise<void> {
    for (const channel of this.channels.values()) {
      if (!channel.enabled) {
        continue;
      }

      try {
        await this.sendNotification(channel, alert);
        this.logger.debug(
          `Alert notification sent via ${channel.type}: ${alert.ruleName}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send alert notification via ${channel.type}`,
          error,
        );
      }
    }
  }

  /**
   * 发送通知到具体渠道
   */
  private async sendNotification(
    channel: AlertChannel,
    alert: AlertInstance,
  ): Promise<void> {
    // 简化实现：仅记录到日志
    switch (channel.type) {
      case AlertChannelType.DASHBOARD:
      case AlertChannelType.CONSOLE:
        this.logger.log(
          `[ALERT ${alert.severity}] ${alert.ruleName}: ${alert.description}`,
        );
        break;
      case AlertChannelType.EMAIL:
        // 实际应发送邮件
        this.logger.debug(`Would send email alert: ${alert.ruleName}`);
        break;
      case AlertChannelType.DINGTALK:
        // 实际应发送钉钉消息
        this.logger.debug(`Would send dingtalk alert: ${alert.ruleName}`);
        break;
      case AlertChannelType.WEBHOOK:
        // 实际应发送Webhook
        this.logger.debug(`Would send webhook alert: ${alert.ruleName}`);
        break;
      default:
        this.logger.warn(`Unsupported alert channel type: ${channel.type}`);
    }
  }

  /**
   * 获取所有告警规则
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 获取活跃告警
   */
  getActiveAlerts(): AlertInstance[] {
    return Array.from(this.alerts.values()).filter((alert) => !alert.recovered);
  }

  /**
   * 获取告警历史
   */
  getAlertHistory(limit = 100): AlertInstance[] {
    const allAlerts = Array.from(this.alerts.values());
    return allAlerts
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, limit);
  }

  /**
   * 标记告警为已恢复
   */
  markAlertAsRecovered(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.recovered) {
      alert.recovered = true;
      alert.recoveredAt = new Date();
      this.alerts.set(alertId, alert);
      this.logger.log(`Alert marked as recovered: ${alert.ruleName}`);
    }
  }

  /**
   * 添加或更新告警规则
   */
  upsertRule(rule: AlertRule): void {
    this.rules.set(rule.id, { ...rule, triggerCount: 0 });
    this.logger.log(`Alert rule ${rule.id} updated`);
  }

  /**
   * 删除告警规则
   */
  deleteRule(ruleId: string): boolean {
    const deleted = this.rules.delete(ruleId);
    if (deleted) {
      this.logger.log(`Alert rule ${ruleId} deleted`);
    }
    return deleted;
  }

  /**
   * 手动触发规则检查
   */
  async checkRule(ruleId: string): Promise<boolean> {
    const rule = this.rules.get(ruleId);
    if (!rule || !rule.enabled) {
      return false;
    }

    const shouldTrigger = await this.evaluateRule(rule);
    if (shouldTrigger) {
      await this.triggerAlert(rule, new Date());
      return true;
    }

    return false;
  }
}
