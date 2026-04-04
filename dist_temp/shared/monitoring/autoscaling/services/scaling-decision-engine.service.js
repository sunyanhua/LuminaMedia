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
var ScalingDecisionEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalingDecisionEngine = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const scaling_metrics_service_1 = require("./scaling-metrics.service");
const kubernetes_scaling_provider_service_1 = require("../integrations/kubernetes-scaling-provider.service");
const autoscaling_interface_1 = require("../interfaces/autoscaling.interface");
let ScalingDecisionEngine = ScalingDecisionEngine_1 = class ScalingDecisionEngine {
    configService;
    metricsService;
    scalingProvider;
    logger = new common_1.Logger(ScalingDecisionEngine_1.name);
    decisions = [];
    events = [];
    maxHistorySize = 1000;
    constructor(configService, metricsService, scalingProvider) {
        this.configService = configService;
        this.metricsService = metricsService;
        this.scalingProvider = scalingProvider;
    }
    async evaluateAllRules() {
        try {
            this.logger.debug('开始定期评估扩缩容规则');
            const rules = await this.getEnabledRules();
            for (const rule of rules) {
                try {
                    await this.evaluateAndExecuteRule(rule);
                }
                catch (error) {
                    this.logger.error(`评估规则失败: ${rule.name}`, error.stack);
                }
            }
            this.logger.debug('定期评估扩缩容规则完成');
        }
        catch (error) {
            this.logger.error('定期评估扩缩容规则失败', error.stack);
        }
    }
    async evaluateAndExecuteRule(rule) {
        this.logger.debug(`评估规则: ${rule.name}`);
        const decision = await this.evaluateRule(rule);
        const event = await this.executeDecision(decision);
        rule.lastEvaluatedAt = new Date();
        rule.currentReplicas = decision.currentReplicas;
        rule.desiredReplicas = decision.finalReplicas;
        return event;
    }
    async evaluateRule(rule) {
        const timestamp = new Date();
        const currentReplicas = await this.scalingProvider.getCurrentReplicas(rule.targetDeployment);
        const metricValues = await this.metricsService.getMetricValues(rule.metrics);
        const metricEvaluations = [];
        let calculatedReplicas = currentReplicas;
        for (const { metric, value } of metricValues) {
            const targetValue = metric.targetValue;
            let metricReplicas = currentReplicas;
            if (metric.targetType === 'Utilization') {
                if (targetValue > 0 && value > 0) {
                    metricReplicas = Math.ceil((currentReplicas * value) / targetValue);
                }
            }
            else if (metric.targetType === 'AverageValue') {
                if (targetValue > 0) {
                    metricReplicas = Math.ceil(value / targetValue);
                }
            }
            else if (metric.targetType === 'Value') {
                metricReplicas = targetValue;
            }
            metricReplicas = this.applyBehaviorStrategy(rule, metricReplicas, currentReplicas, 'evaluation');
            metricEvaluations.push({
                metric,
                currentValue: value,
                targetValue,
                calculatedReplicas: metricReplicas,
            });
            if (metricReplicas > calculatedReplicas) {
                calculatedReplicas = metricReplicas;
            }
        }
        if (metricEvaluations.length === 0) {
            calculatedReplicas = currentReplicas;
        }
        let finalReplicas = Math.max(rule.minReplicas, calculatedReplicas);
        finalReplicas = Math.min(rule.maxReplicas, finalReplicas);
        finalReplicas = this.applyBehaviorStrategy(rule, finalReplicas, currentReplicas, 'final');
        const needsScaling = finalReplicas !== currentReplicas;
        let direction = 'none';
        let scaleAmount = 0;
        if (needsScaling) {
            if (finalReplicas > currentReplicas) {
                direction = 'up';
                scaleAmount = finalReplicas - currentReplicas;
            }
            else {
                direction = 'down';
                scaleAmount = currentReplicas - finalReplicas;
            }
        }
        const decision = {
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
        this.saveDecision(decision);
        this.logger.debug(`规则评估完成: ${rule.name}，决策: ${JSON.stringify(decision)}`);
        return decision;
    }
    applyBehaviorStrategy(rule, desiredReplicas, currentReplicas, stage) {
        if (!rule.behavior) {
            return desiredReplicas;
        }
        let result = desiredReplicas;
        if (desiredReplicas > currentReplicas && rule.behavior.scaleUp) {
            const policies = rule.behavior.scaleUp.policies;
            result = this.applyPolicies(policies, desiredReplicas, currentReplicas);
        }
        else if (desiredReplicas < currentReplicas && rule.behavior.scaleDown) {
            const policies = rule.behavior.scaleDown.policies;
            result = this.applyPolicies(policies, desiredReplicas, currentReplicas);
        }
        return result;
    }
    applyPolicies(policies, desiredReplicas, currentReplicas) {
        let result = desiredReplicas;
        for (const policy of policies) {
            let policyReplicas = desiredReplicas;
            if (policy.type === 'Pods') {
                const diff = desiredReplicas - currentReplicas;
                if (diff > 0) {
                    policyReplicas = currentReplicas + Math.min(diff, policy.value);
                }
                else {
                    policyReplicas = currentReplicas - Math.min(-diff, policy.value);
                }
            }
            else if (policy.type === 'Percent') {
                const percentage = policy.value / 100;
                if (desiredReplicas > currentReplicas) {
                    const increase = Math.ceil(currentReplicas * percentage);
                    policyReplicas = currentReplicas + increase;
                }
                else {
                    const decrease = Math.ceil(currentReplicas * percentage);
                    policyReplicas = Math.max(1, currentReplicas - decrease);
                }
            }
            result = policyReplicas;
            break;
        }
        return result;
    }
    async executeDecision(decision) {
        const timestamp = new Date();
        let eventType = autoscaling_interface_1.ScalingEventType.NO_SCALE;
        let successful = true;
        let error;
        let actualReplicas = decision.currentReplicas;
        try {
            if (decision.needsScaling) {
                const rule = await this.getRuleById(decision.ruleId);
                if (!rule) {
                    throw new Error(`未找到规则: ${decision.ruleId}`);
                }
                const success = await this.scalingProvider.scaleDeployment(rule.targetDeployment, decision.finalReplicas);
                if (success) {
                    eventType =
                        decision.direction === 'up'
                            ? autoscaling_interface_1.ScalingEventType.SCALE_UP
                            : autoscaling_interface_1.ScalingEventType.SCALE_DOWN;
                    actualReplicas = decision.finalReplicas;
                    this.logger.log(`扩缩容执行成功: ${rule.name}，${decision.currentReplicas} -> ${decision.finalReplicas}`);
                }
                else {
                    eventType = autoscaling_interface_1.ScalingEventType.ERROR;
                    successful = false;
                    error = '扩缩容操作失败';
                    this.logger.error(`扩缩容执行失败: ${rule.name}`);
                }
            }
            else {
                this.logger.debug(`无需扩缩容: 规则 ${decision.ruleId}`);
            }
        }
        catch (err) {
            eventType = autoscaling_interface_1.ScalingEventType.ERROR;
            successful = false;
            error = err.message;
            this.logger.error(`执行扩缩容决策失败: ${decision.ruleId}`, err.stack);
        }
        const event = {
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
        this.saveEvent(event);
        return event;
    }
    getEventReason(eventType, decision) {
        switch (eventType) {
            case autoscaling_interface_1.ScalingEventType.SCALE_UP:
                return 'HighResourceUsage';
            case autoscaling_interface_1.ScalingEventType.SCALE_DOWN:
                return 'LowResourceUsage';
            case autoscaling_interface_1.ScalingEventType.NO_SCALE:
                return 'WithinThreshold';
            case autoscaling_interface_1.ScalingEventType.ERROR:
                return 'ExecutionError';
            default:
                return 'Unknown';
        }
    }
    getEventMessage(eventType, decision, error) {
        switch (eventType) {
            case autoscaling_interface_1.ScalingEventType.SCALE_UP:
                return `从 ${decision.currentReplicas} 扩容到 ${decision.finalReplicas} 个副本`;
            case autoscaling_interface_1.ScalingEventType.SCALE_DOWN:
                return `从 ${decision.currentReplicas} 缩容到 ${decision.finalReplicas} 个副本`;
            case autoscaling_interface_1.ScalingEventType.NO_SCALE:
                return `当前副本数 ${decision.currentReplicas} 在阈值范围内，无需调整`;
            case autoscaling_interface_1.ScalingEventType.ERROR:
                return `扩缩容失败: ${error || '未知错误'}`;
            default:
                return '未知事件类型';
        }
    }
    async getRecentDecisions(ruleId, limit = 50) {
        let decisions = this.decisions;
        if (ruleId) {
            decisions = decisions.filter((d) => d.ruleId === ruleId);
        }
        decisions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return decisions.slice(0, limit);
    }
    async getRecentEvents(ruleId, limit = 50) {
        let events = this.events;
        if (ruleId) {
            events = events.filter((e) => e.ruleId === ruleId);
        }
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return events.slice(0, limit);
    }
    saveDecision(decision) {
        this.decisions.push(decision);
        if (this.decisions.length > this.maxHistorySize) {
            this.decisions.splice(0, this.decisions.length - this.maxHistorySize);
        }
    }
    saveEvent(event) {
        this.events.push(event);
        if (this.events.length > this.maxHistorySize) {
            this.events.splice(0, this.events.length - this.maxHistorySize);
        }
    }
    async getEnabledRules() {
        return autoscaling_interface_1.PREDEFINED_SCALING_RULES.filter((rule) => rule.enabled);
    }
    async getRuleById(ruleId) {
        const rules = await this.getEnabledRules();
        return rules.find((rule) => rule.id === ruleId) || null;
    }
    async triggerEvaluation(ruleId) {
        const events = [];
        const rules = await this.getEnabledRules();
        for (const rule of rules) {
            if (ruleId && rule.id !== ruleId) {
                continue;
            }
            try {
                const event = await this.evaluateAndExecuteRule(rule);
                events.push(event);
            }
            catch (error) {
                this.logger.error(`手动触发评估失败: ${rule.name}`, error.stack);
            }
        }
        return events;
    }
    getEngineStatus() {
        const lastDecision = this.decisions[this.decisions.length - 1];
        const enabledRules = autoscaling_interface_1.PREDEFINED_SCALING_RULES.filter((rule) => rule.enabled).length;
        return {
            totalDecisions: this.decisions.length,
            totalEvents: this.events.length,
            lastEvaluationTime: lastDecision?.timestamp,
            enabledRules,
        };
    }
};
exports.ScalingDecisionEngine = ScalingDecisionEngine;
__decorate([
    (0, schedule_1.Cron)('0 */5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScalingDecisionEngine.prototype, "evaluateAllRules", null);
exports.ScalingDecisionEngine = ScalingDecisionEngine = ScalingDecisionEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        scaling_metrics_service_1.ScalingMetricsService,
        kubernetes_scaling_provider_service_1.KubernetesScalingProvider])
], ScalingDecisionEngine);
//# sourceMappingURL=scaling-decision-engine.service.js.map