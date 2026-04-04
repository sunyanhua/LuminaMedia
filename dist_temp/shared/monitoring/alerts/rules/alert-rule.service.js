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
var AlertRuleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertRuleService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const metrics_collector_service_1 = require("../../metrics/collectors/metrics-collector.service");
const alerts_interface_1 = require("../../interfaces/alerts.interface");
let AlertRuleService = AlertRuleService_1 = class AlertRuleService {
    configService;
    metricsCollector;
    logger = new common_1.Logger(AlertRuleService_1.name);
    rules = new Map();
    alerts = new Map();
    channels = new Map();
    alertHistorySize = 1000;
    constructor(configService, metricsCollector) {
        this.configService = configService;
        this.metricsCollector = metricsCollector;
    }
    async onModuleInit() {
        await this.initializeRules();
        await this.initializeChannels();
        this.logger.log('Alert rule service initialized');
    }
    async initializeRules() {
        alerts_interface_1.PREDEFINED_ALERT_RULES.forEach((rule) => {
            this.rules.set(rule.id, { ...rule, triggerCount: 0 });
        });
        this.logger.log(`Initialized ${this.rules.size} alert rules`);
    }
    async initializeChannels() {
        const defaultChannels = [
            {
                id: 'console',
                type: alerts_interface_1.AlertChannelType.DASHBOARD,
                name: '控制台输出',
                config: {},
                enabled: true,
            },
            {
                id: 'dashboard',
                type: alerts_interface_1.AlertChannelType.DASHBOARD,
                name: '监控仪表盘',
                config: {},
                enabled: true,
            },
        ];
        const emailEnabled = this.configService.get('ALERT_EMAIL_ENABLED', 'false') === 'true';
        if (emailEnabled) {
            defaultChannels.push({
                id: 'email',
                type: alerts_interface_1.AlertChannelType.EMAIL,
                name: '邮件通知',
                config: {
                    smtpHost: this.configService.get('ALERT_EMAIL_SMTP_HOST'),
                    smtpPort: this.configService.get('ALERT_EMAIL_SMTP_PORT'),
                    from: this.configService.get('ALERT_EMAIL_FROM'),
                    to: this.configService.get('ALERT_EMAIL_TO'),
                },
                enabled: true,
            });
        }
        defaultChannels.forEach((channel) => {
            this.channels.set(channel.id, channel);
        });
        this.logger.log(`Initialized ${this.channels.size} alert channels`);
    }
    async checkAllRules() {
        if (this.rules.size === 0) {
            return;
        }
        this.logger.debug(`Checking ${this.rules.size} alert rules`);
        const now = new Date();
        for (const rule of this.rules.values()) {
            if (!rule.enabled) {
                continue;
            }
            if (rule.lastTriggeredAt && rule.silencePeriod) {
                const silenceEnd = new Date(rule.lastTriggeredAt.getTime() + rule.silencePeriod * 1000);
                if (now < silenceEnd) {
                    continue;
                }
            }
            const shouldTrigger = await this.evaluateRule(rule);
            if (shouldTrigger) {
                await this.triggerAlert(rule, now);
            }
        }
    }
    async evaluateRule(rule) {
        if (rule.type !== alerts_interface_1.AlertRuleType.THRESHOLD) {
            return false;
        }
        for (const condition of rule.conditions) {
            const result = await this.evaluateCondition(condition);
            if (!result) {
                return false;
            }
        }
        return true;
    }
    async evaluateCondition(condition) {
        const { metric, operator, threshold, timeWindow = 300, aggregation = 'avg', } = condition;
        const now = new Date();
        const startTime = new Date(now.getTime() - timeWindow * 1000);
        const timeSeries = await this.metricsCollector.getTimeSeries(metric, startTime, now);
        if (timeSeries.length === 0) {
            return false;
        }
        const aggregatedValue = this.aggregateMetrics(timeSeries, aggregation);
        if (aggregatedValue === null) {
            return false;
        }
        return this.applyOperator(aggregatedValue, operator, threshold);
    }
    aggregateMetrics(metrics, aggregation) {
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
                return 0.95;
            default:
                return values[values.length - 1];
        }
    }
    calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
    }
    applyOperator(value, operator, threshold) {
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
    async triggerAlert(rule, triggeredAt) {
        rule.lastTriggeredAt = triggeredAt;
        rule.triggerCount = (rule.triggerCount || 0) + 1;
        this.rules.set(rule.id, rule);
        const conditionValues = [];
        for (const condition of rule.conditions) {
            const timeSeries = await this.metricsCollector.getTimeSeries(condition.metric, new Date(triggeredAt.getTime() - (condition.timeWindow || 300) * 1000), triggeredAt);
            if (timeSeries.length > 0) {
                const aggregatedValue = this.aggregateMetrics(timeSeries, condition.aggregation || 'avg');
                conditionValues.push(aggregatedValue || 0);
            }
        }
        const alertId = `${rule.id}_${triggeredAt.getTime()}`;
        const alert = {
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
        await this.sendAlertNotifications(alert);
        this.logger.warn(`Alert triggered: ${rule.name} (${rule.severity})`);
    }
    async sendAlertNotifications(alert) {
        for (const channel of this.channels.values()) {
            if (!channel.enabled) {
                continue;
            }
            try {
                await this.sendNotification(channel, alert);
                this.logger.debug(`Alert notification sent via ${channel.type}: ${alert.ruleName}`);
            }
            catch (error) {
                this.logger.error(`Failed to send alert notification via ${channel.type}`, error);
            }
        }
    }
    async sendNotification(channel, alert) {
        switch (channel.type) {
            case alerts_interface_1.AlertChannelType.DASHBOARD:
            case alerts_interface_1.AlertChannelType.CONSOLE:
                this.logger.log(`[ALERT ${alert.severity}] ${alert.ruleName}: ${alert.description}`);
                break;
            case alerts_interface_1.AlertChannelType.EMAIL:
                this.logger.debug(`Would send email alert: ${alert.ruleName}`);
                break;
            case alerts_interface_1.AlertChannelType.DINGTALK:
                this.logger.debug(`Would send dingtalk alert: ${alert.ruleName}`);
                break;
            case alerts_interface_1.AlertChannelType.WEBHOOK:
                this.logger.debug(`Would send webhook alert: ${alert.ruleName}`);
                break;
            default:
                this.logger.warn(`Unsupported alert channel type: ${channel.type}`);
        }
    }
    getRules() {
        return Array.from(this.rules.values());
    }
    getActiveAlerts() {
        return Array.from(this.alerts.values()).filter((alert) => !alert.recovered);
    }
    getAlertHistory(limit = 100) {
        const allAlerts = Array.from(this.alerts.values());
        return allAlerts
            .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
            .slice(0, limit);
    }
    markAlertAsRecovered(alertId) {
        const alert = this.alerts.get(alertId);
        if (alert && !alert.recovered) {
            alert.recovered = true;
            alert.recoveredAt = new Date();
            this.alerts.set(alertId, alert);
            this.logger.log(`Alert marked as recovered: ${alert.ruleName}`);
        }
    }
    upsertRule(rule) {
        this.rules.set(rule.id, { ...rule, triggerCount: 0 });
        this.logger.log(`Alert rule ${rule.id} updated`);
    }
    deleteRule(ruleId) {
        const deleted = this.rules.delete(ruleId);
        if (deleted) {
            this.logger.log(`Alert rule ${ruleId} deleted`);
        }
        return deleted;
    }
    async checkRule(ruleId) {
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
};
exports.AlertRuleService = AlertRuleService;
__decorate([
    (0, schedule_1.Cron)('0 */5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertRuleService.prototype, "checkAllRules", null);
exports.AlertRuleService = AlertRuleService = AlertRuleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        metrics_collector_service_1.MetricsCollectorService])
], AlertRuleService);
//# sourceMappingURL=alert-rule.service.js.map