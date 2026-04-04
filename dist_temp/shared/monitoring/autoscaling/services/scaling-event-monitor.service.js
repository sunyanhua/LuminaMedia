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
var ScalingEventMonitor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalingEventMonitor = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const alert_rule_service_1 = require("../../alerts/rules/alert-rule.service");
const scaling_decision_engine_service_1 = require("./scaling-decision-engine.service");
const autoscaling_interface_1 = require("../interfaces/autoscaling.interface");
let ScalingEventMonitor = ScalingEventMonitor_1 = class ScalingEventMonitor {
    configService;
    alertRuleService;
    decisionEngine;
    logger = new common_1.Logger(ScalingEventMonitor_1.name);
    eventStats = new Map();
    constructor(configService, alertRuleService, decisionEngine) {
        this.configService = configService;
        this.alertRuleService = alertRuleService;
        this.decisionEngine = decisionEngine;
    }
    async monitorScalingEvents() {
        try {
            this.logger.debug('开始监控扩缩容事件');
            const recentEvents = await this.decisionEngine.getRecentEvents(undefined, 100);
            for (const event of recentEvents) {
                await this.processEvent(event);
            }
            await this.checkForAnomalies();
            this.logger.debug('扩缩容事件监控完成');
        }
        catch (error) {
            this.logger.error('扩缩容事件监控失败', error.stack);
        }
    }
    async processEvent(event) {
        this.updateEventStats(event);
        if (event.type === autoscaling_interface_1.ScalingEventType.ERROR) {
            await this.triggerErrorAlert(event);
        }
        else if (event.type === autoscaling_interface_1.ScalingEventType.SCALE_UP) {
            await this.checkScaleUpPattern(event);
        }
        else if (event.type === autoscaling_interface_1.ScalingEventType.SCALE_DOWN) {
            await this.checkScaleDownPattern(event);
        }
        if (this.isSignificantEvent(event)) {
            this.logger.log(`重要扩缩容事件: ${event.reason} - ${event.message}`);
        }
    }
    updateEventStats(event) {
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
            case autoscaling_interface_1.ScalingEventType.SCALE_UP:
                stats.scaleUpEvents++;
                break;
            case autoscaling_interface_1.ScalingEventType.SCALE_DOWN:
                stats.scaleDownEvents++;
                break;
            case autoscaling_interface_1.ScalingEventType.ERROR:
                stats.errorEvents++;
                break;
        }
        this.eventStats.set(ruleId, stats);
    }
    async triggerErrorAlert(event) {
        try {
            const alertInstance = {
                id: `scaling_error_${event.id}`,
                ruleId: 'scaling_error',
                ruleName: '扩缩容错误告警',
                severity: 'error',
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
            this.logger.error(`扩缩容错误告警: ${event.ruleId} - ${event.error}`, JSON.stringify(alertInstance));
        }
        catch (error) {
            this.logger.error('触发错误告警失败', error.stack);
        }
    }
    async checkScaleUpPattern(event) {
        const stats = this.eventStats.get(event.ruleId);
        if (!stats) {
            return;
        }
        const timeWindow = 30 * 60 * 1000;
        const recentEvents = await this.decisionEngine.getRecentEvents(event.ruleId, 20);
        const scaleUpEvents = recentEvents.filter((e) => e.type === autoscaling_interface_1.ScalingEventType.SCALE_UP &&
            e.timestamp.getTime() > Date.now() - timeWindow);
        if (scaleUpEvents.length >= 5) {
            await this.triggerFrequentScalingAlert(event, scaleUpEvents.length);
        }
        const scaleAmount = event.desiredReplicas - event.currentReplicas;
        if (scaleAmount >= 5) {
            await this.triggerLargeScaleAlert(event, scaleAmount);
        }
    }
    async checkScaleDownPattern(event) {
        const stats = this.eventStats.get(event.ruleId);
        if (!stats) {
            return;
        }
        const timeWindow = 30 * 60 * 1000;
        const recentEvents = await this.decisionEngine.getRecentEvents(event.ruleId, 20);
        const scaleDownEvents = recentEvents.filter((e) => e.type === autoscaling_interface_1.ScalingEventType.SCALE_DOWN &&
            e.timestamp.getTime() > Date.now() - timeWindow);
        if (scaleDownEvents.length >= 5) {
            await this.triggerFrequentScalingAlert(event, scaleDownEvents.length);
        }
        if (event.desiredReplicas <= 1) {
            await this.triggerMinReplicasAlert(event);
        }
    }
    async triggerFrequentScalingAlert(event, eventCount) {
        try {
            const alertInstance = {
                id: `frequent_scaling_${event.id}`,
                ruleId: 'frequent_scaling',
                ruleName: '频繁扩缩容告警',
                severity: 'warning',
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
            this.logger.warn(`频繁扩缩容告警: ${event.ruleId} - ${eventCount}次操作`, JSON.stringify(alertInstance));
        }
        catch (error) {
            this.logger.error('触发频繁扩缩容告警失败', error.stack);
        }
    }
    async triggerLargeScaleAlert(event, scaleAmount) {
        try {
            const alertInstance = {
                id: `large_scale_${event.id}`,
                ruleId: 'large_scale',
                ruleName: '大规模扩容告警',
                severity: 'warning',
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
            this.logger.warn(`大规模扩容告警: ${event.ruleId} - 扩容${scaleAmount}个副本`, JSON.stringify(alertInstance));
        }
        catch (error) {
            this.logger.error('触发大规模扩容告警失败', error.stack);
        }
    }
    async triggerMinReplicasAlert(event) {
        try {
            const alertInstance = {
                id: `min_replicas_${event.id}`,
                ruleId: 'min_replicas',
                ruleName: '最小副本数告警',
                severity: 'warning',
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
            this.logger.warn(`最小副本数告警: ${event.ruleId} - 仅剩${event.desiredReplicas}个副本`, JSON.stringify(alertInstance));
        }
        catch (error) {
            this.logger.error('触发最小副本数告警失败', error.stack);
        }
    }
    async checkForAnomalies() {
        for (const [ruleId, stats] of this.eventStats.entries()) {
            if (stats.totalEvents > 0) {
                const errorRate = stats.errorEvents / stats.totalEvents;
                if (errorRate > 0.3) {
                    await this.triggerHighErrorRateAlert(ruleId, errorRate, stats);
                }
            }
            if (stats.lastEventTime) {
                const hoursSinceLastEvent = (Date.now() - stats.lastEventTime.getTime()) / (1000 * 60 * 60);
                if (hoursSinceLastEvent > 24) {
                    await this.triggerNoActivityAlert(ruleId, hoursSinceLastEvent);
                }
            }
        }
    }
    async triggerHighErrorRateAlert(ruleId, errorRate, stats) {
        try {
            const alertInstance = {
                id: `high_error_rate_${ruleId}_${Date.now()}`,
                ruleId: 'high_error_rate',
                ruleName: '高错误率告警',
                severity: 'error',
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
            this.logger.error(`高错误率告警: ${ruleId} - ${(errorRate * 100).toFixed(1)}%`, JSON.stringify(alertInstance));
        }
        catch (error) {
            this.logger.error('触发高错误率告警失败', error.stack);
        }
    }
    async triggerNoActivityAlert(ruleId, hoursSinceLastEvent) {
        try {
            const alertInstance = {
                id: `no_activity_${ruleId}_${Date.now()}`,
                ruleId: 'no_activity',
                ruleName: '无活动告警',
                severity: 'info',
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
            this.logger.warn(`无活动告警: ${ruleId} - ${hoursSinceLastEvent.toFixed(1)}小时无活动`, JSON.stringify(alertInstance));
        }
        catch (error) {
            this.logger.error('触发无活动告警失败', error.stack);
        }
    }
    isSignificantEvent(event) {
        if (event.type === autoscaling_interface_1.ScalingEventType.ERROR) {
            return true;
        }
        if (event.type === autoscaling_interface_1.ScalingEventType.SCALE_UP) {
            const scaleAmount = event.desiredReplicas - event.currentReplicas;
            return scaleAmount >= 3;
        }
        if (event.type === autoscaling_interface_1.ScalingEventType.SCALE_DOWN) {
            const scaleAmount = event.currentReplicas - event.desiredReplicas;
            return scaleAmount >= 3;
        }
        return false;
    }
    getEventStats() {
        const result = [];
        for (const [ruleId, stats] of this.eventStats.entries()) {
            const errorRate = stats.totalEvents > 0 ? stats.errorEvents / stats.totalEvents : 0;
            result.push({
                ruleId,
                ...stats,
                errorRate,
            });
        }
        return result;
    }
    clearStats() {
        this.eventStats.clear();
        this.logger.log('事件统计已清除');
    }
    getHealthStatus() {
        const issues = [];
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
};
exports.ScalingEventMonitor = ScalingEventMonitor;
__decorate([
    (0, schedule_1.Cron)('0 */10 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScalingEventMonitor.prototype, "monitorScalingEvents", null);
exports.ScalingEventMonitor = ScalingEventMonitor = ScalingEventMonitor_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [config_1.ConfigService,
        alert_rule_service_1.AlertRuleService,
        scaling_decision_engine_service_1.ScalingDecisionEngine])
], ScalingEventMonitor);
//# sourceMappingURL=scaling-event-monitor.service.js.map