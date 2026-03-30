import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import {
  LogAlertRule,
  LogAlertAction,
} from '../interfaces/log-analysis.interface';
import { LogAnalysisService } from './log-analysis.service';

@Injectable()
export class LogAlertService implements OnModuleInit {
  private readonly rules: LogAlertRule[] = [];
  private readonly alertHistory: Array<{
    ruleId: string;
    timestamp: string;
    triggered: boolean;
    details?: any;
  }> = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly logAnalysisService: LogAnalysisService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    // 加载告警规则
    await this.loadAlertRules();

    // 调度告警检查任务
    this.scheduleAlertChecks();
  }

  /**
   * 添加告警规则
   */
  async addRule(rule: LogAlertRule): Promise<void> {
    this.rules.push(rule);
    await this.saveAlertRules();

    // 如果规则启用，立即调度检查
    if (rule.enabled) {
      this.scheduleRuleCheck(rule);
    }
  }

  /**
   * 更新告警规则
   */
  async updateRule(
    ruleId: string,
    updates: Partial<LogAlertRule>,
  ): Promise<void> {
    const index = this.rules.findIndex((r) => r.id === ruleId);
    if (index === -1) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    this.rules[index] = { ...this.rules[index], ...updates };
    await this.saveAlertRules();

    // 重新调度规则检查
    const rule = this.rules[index];
    this.unscheduleRuleCheck(ruleId);
    if (rule.enabled) {
      this.scheduleRuleCheck(rule);
    }
  }

  /**
   * 删除告警规则
   */
  async deleteRule(ruleId: string): Promise<void> {
    const index = this.rules.findIndex((r) => r.id === ruleId);
    if (index === -1) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    this.unscheduleRuleCheck(ruleId);
    this.rules.splice(index, 1);
    await this.saveAlertRules();
  }

  /**
   * 获取所有告警规则
   */
  getRules(): LogAlertRule[] {
    return [...this.rules];
  }

  /**
   * 获取告警历史
   */
  getAlertHistory(ruleId?: string, limit = 100): any[] {
    let history = this.alertHistory;
    if (ruleId) {
      history = history.filter((h) => h.ruleId === ruleId);
    }
    return history.slice(-limit);
  }

  /**
   * 立即检查所有告警规则
   */
  async checkAllRules(): Promise<
    Array<{ rule: LogAlertRule; triggered: boolean; details?: any }>
  > {
    const results = await this.logAnalysisService.checkAlertRules(this.rules);

    // 记录触发历史
    results.forEach((result) => {
      if (result.triggered) {
        this.recordAlertTrigger(result.rule, result.details);
        this.executeAlertActions(result.rule, result.details);
      }
    });

    return results;
  }

  /**
   * 执行告警动作
   */
  private async executeAlertActions(
    rule: LogAlertRule,
    details?: any,
  ): Promise<void> {
    for (const action of rule.actions) {
      try {
        await this.executeAction(action, rule, details);
      } catch (error) {
        console.error(
          `Failed to execute alert action for rule ${rule.id}:`,
          error,
        );
      }
    }
  }

  /**
   * 执行单个动作
   */
  private async executeAction(
    action: LogAlertAction,
    rule: LogAlertRule,
    details?: any,
  ): Promise<void> {
    switch (action.type) {
      case 'notification':
        await this.sendNotification(action, rule, details);
        break;
      case 'webhook':
        await this.callWebhook(action, rule, details);
        break;
      case 'script':
        await this.executeScript(action, rule, details);
        break;
      case 'log':
        await this.writeLog(action, rule, details);
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * 发送通知
   */
  private async sendNotification(
    action: LogAlertAction,
    rule: LogAlertRule,
    details?: any,
  ): Promise<void> {
    // 实现通知发送逻辑（邮件、钉钉、Slack等）
    console.log(
      `[ALERT NOTIFICATION] Rule: ${rule.name}, Action: ${action.target}`,
    );
  }

  /**
   * 调用Webhook
   */
  private async callWebhook(
    action: LogAlertAction,
    rule: LogAlertRule,
    details?: any,
  ): Promise<void> {
    // 实现Webhook调用逻辑
    console.log(
      `[ALERT WEBHOOK] Calling ${action.target} for rule ${rule.name}`,
    );
  }

  /**
   * 执行脚本
   */
  private async executeScript(
    action: LogAlertAction,
    rule: LogAlertRule,
    details?: any,
  ): Promise<void> {
    // 实现脚本执行逻辑
    console.log(
      `[ALERT SCRIPT] Executing script ${action.target} for rule ${rule.name}`,
    );
  }

  /**
   * 写入日志
   */
  private async writeLog(
    action: LogAlertAction,
    rule: LogAlertRule,
    details?: any,
  ): Promise<void> {
    // 实现日志写入逻辑
    console.log(`[ALERT LOG] Alert triggered: ${rule.name}, Details:`, details);
  }

  /**
   * 记录告警触发
   */
  private recordAlertTrigger(rule: LogAlertRule, details?: any): void {
    this.alertHistory.push({
      ruleId: rule.id,
      timestamp: new Date().toISOString(),
      triggered: true,
      details,
    });

    // 限制历史记录大小
    if (this.alertHistory.length > 1000) {
      this.alertHistory.splice(0, this.alertHistory.length - 1000);
    }
  }

  /**
   * 加载告警规则
   */
  private async loadAlertRules(): Promise<void> {
    // 从配置文件或数据库加载规则
    // 暂时加载默认规则
    this.rules.push(...this.getDefaultRules());
  }

  /**
   * 保存告警规则
   */
  private async saveAlertRules(): Promise<void> {
    // 保存规则到配置文件或数据库
    // 暂时不实现
  }

  /**
   * 获取默认告警规则
   */
  private getDefaultRules(): LogAlertRule[] {
    return [
      {
        id: 'error-rate-high',
        name: '错误率过高',
        description: '当错误日志比例超过5%时触发告警',
        enabled: true,
        condition: {
          type: 'threshold',
          field: 'error.rate',
          operator: 'gt',
          value: 5,
          window: '5m',
          occurrences: 3,
        },
        actions: [
          {
            type: 'log',
            target: 'alert-log',
            parameters: { level: 'error' },
          },
        ],
        notificationChannels: ['email', 'dingtalk'],
        cooldownPeriod: 5,
      },
      {
        id: 'critical-error',
        name: '关键错误',
        description: '当出现关键错误时立即告警',
        enabled: true,
        condition: {
          type: 'pattern',
          field: 'log.level',
          operator: 'eq',
          value: 'error',
          window: '1m',
          occurrences: 1,
        },
        actions: [
          {
            type: 'notification',
            target: 'critical-alerts',
            parameters: { priority: 'high' },
          },
        ],
        notificationChannels: ['sms', 'phone'],
        cooldownPeriod: 60,
      },
    ];
  }

  /**
   * 调度告警检查任务
   */
  private scheduleAlertChecks(): void {
    // 每分钟检查一次告警规则
    const job = new CronJob('*/1 * * * *', () => {
      this.checkAllRules().catch((err) => {
        console.error('Alert check failed:', err);
      });
    });

    this.schedulerRegistry.addCronJob('log-alert-check', job);
    job.start();
  }

  /**
   * 调度单个规则检查
   */
  private scheduleRuleCheck(rule: LogAlertRule): void {
    // 根据规则配置调度检查
    // 暂时使用全局检查任务
  }

  /**
   * 取消调度规则检查
   */
  private unscheduleRuleCheck(ruleId: string): void {
    // 取消调度
  }
}
