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
var AutoscalingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoscalingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scaling_decision_engine_service_1 = require("../services/scaling-decision-engine.service");
const scaling_event_monitor_service_1 = require("../services/scaling-event-monitor.service");
const kubernetes_scaling_provider_service_1 = require("../integrations/kubernetes-scaling-provider.service");
const autoscaling_interface_1 = require("../interfaces/autoscaling.interface");
class ScalingRuleDto {
    id;
    name;
    targetDeployment;
    minReplicas;
    maxReplicas;
    metrics;
    behavior;
    enabled;
    lastEvaluatedAt;
    currentReplicas;
    desiredReplicas;
}
class CreateScalingRuleDto {
    name;
    targetDeployment;
    minReplicas;
    maxReplicas;
    metrics;
    behavior;
    enabled;
}
class UpdateScalingRuleDto {
    name;
    minReplicas;
    maxReplicas;
    metrics;
    behavior;
    enabled;
}
class TriggerEvaluationDto {
    ruleId;
}
let AutoscalingController = AutoscalingController_1 = class AutoscalingController {
    decisionEngine;
    eventMonitor;
    scalingProvider;
    logger = new common_1.Logger(AutoscalingController_1.name);
    rules = [...autoscaling_interface_1.PREDEFINED_SCALING_RULES];
    constructor(decisionEngine, eventMonitor, scalingProvider) {
        this.decisionEngine = decisionEngine;
        this.eventMonitor = eventMonitor;
        this.scalingProvider = scalingProvider;
    }
    async getRules() {
        return this.rules;
    }
    async getRule(id) {
        const rule = this.rules.find((r) => r.id === id);
        if (!rule) {
            throw new Error(`规则不存在: ${id}`);
        }
        return rule;
    }
    async createRule(dto) {
        const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const rule = {
            id,
            ...dto,
            lastEvaluatedAt: undefined,
            currentReplicas: undefined,
            desiredReplicas: undefined,
        };
        this.rules.push(rule);
        this.logger.log(`创建扩缩容规则: ${id} - ${dto.name}`);
        return rule;
    }
    async updateRule(id, dto) {
        const index = this.rules.findIndex((r) => r.id === id);
        if (index === -1) {
            throw new Error(`规则不存在: ${id}`);
        }
        const rule = this.rules[index];
        this.rules[index] = {
            ...rule,
            ...dto,
        };
        this.logger.log(`更新扩缩容规则: ${id}`);
        return this.rules[index];
    }
    async deleteRule(id) {
        const index = this.rules.findIndex((r) => r.id === id);
        if (index === -1) {
            throw new Error(`规则不存在: ${id}`);
        }
        this.rules.splice(index, 1);
        this.logger.log(`删除扩缩容规则: ${id}`);
    }
    async getDecisions(ruleId, limit) {
        const limitNum = limit ? parseInt(limit.toString(), 10) : 50;
        return await this.decisionEngine.getRecentDecisions(ruleId, limitNum);
    }
    async getEvents(ruleId, limit) {
        const limitNum = limit ? parseInt(limit.toString(), 10) : 50;
        return await this.decisionEngine.getRecentEvents(ruleId, limitNum);
    }
    async triggerEvaluation(dto) {
        this.logger.log(`手动触发扩缩容评估: ${dto.ruleId || '所有规则'}`);
        return await this.decisionEngine.triggerEvaluation(dto.ruleId);
    }
    async getStats() {
        const enabledRules = this.rules.filter((r) => r.enabled);
        const engineStatus = this.decisionEngine.getEngineStatus();
        const eventStats = this.eventMonitor.getEventStats();
        const monitorHealth = this.eventMonitor.getHealthStatus();
        const eventTotals = eventStats.reduce((acc, stats) => {
            acc.total += stats.totalEvents;
            acc.scaleUp += stats.scaleUpEvents;
            acc.scaleDown += stats.scaleDownEvents;
            acc.errors += stats.errorEvents;
            return acc;
        }, { total: 0, scaleUp: 0, scaleDown: 0, errors: 0 });
        return {
            rules: {
                total: this.rules.length,
                enabled: enabledRules.length,
                disabled: this.rules.length - enabledRules.length,
            },
            decisions: {
                total: engineStatus.totalDecisions,
                lastEvaluationTime: engineStatus.lastEvaluationTime,
            },
            events: eventTotals,
            engineStatus,
            monitorHealth,
        };
    }
    async getProviderStatus() {
        const available = await this.scalingProvider.isAvailable();
        const deployments = this.scalingProvider.getAllSimulatedDeployments();
        const deploymentArray = Array.from(deployments.entries()).map(([key, { replicas, status }]) => ({
            key,
            replicas,
            status,
        }));
        return {
            providerName: this.scalingProvider.getName(),
            available,
            simulatedDeployments: deploymentArray,
        };
    }
    async resetProvider() {
        this.scalingProvider.resetSimulatedDeployments();
        return {
            success: true,
            message: '模拟提供商状态已重置',
        };
    }
    async getHealth() {
        const components = [];
        const issues = [];
        try {
            const engineStatus = this.decisionEngine.getEngineStatus();
            components.push({
                name: '决策引擎',
                healthy: true,
                message: `运行正常，已处理 ${engineStatus.totalDecisions} 个决策`,
            });
        }
        catch (error) {
            components.push({
                name: '决策引擎',
                healthy: false,
                message: `错误: ${error.message}`,
            });
            issues.push(`决策引擎异常: ${error.message}`);
        }
        try {
            const monitorHealth = this.eventMonitor.getHealthStatus();
            components.push({
                name: '事件监控',
                healthy: monitorHealth.healthy,
                message: `监控 ${monitorHealth.totalRules} 个规则，错误率 ${(monitorHealth.errorRate * 100).toFixed(1)}%`,
            });
            if (!monitorHealth.healthy) {
                issues.push('事件监控检测到问题');
            }
        }
        catch (error) {
            components.push({
                name: '事件监控',
                healthy: false,
                message: `错误: ${error.message}`,
            });
            issues.push(`事件监控异常: ${error.message}`);
        }
        try {
            const available = await this.scalingProvider.isAvailable();
            components.push({
                name: '扩缩容提供商',
                healthy: available,
                message: available ? '连接正常' : '连接异常',
            });
            if (!available) {
                issues.push('扩缩容提供商不可用');
            }
        }
        catch (error) {
            components.push({
                name: '扩缩容提供商',
                healthy: false,
                message: `错误: ${error.message}`,
            });
            issues.push(`扩缩容提供商异常: ${error.message}`);
        }
        const healthy = components.every((c) => c.healthy) && issues.length === 0;
        return {
            healthy,
            components,
            issues,
        };
    }
    async getMetrics() {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const recentEvents = await this.decisionEngine.getRecentEvents(undefined, 1000);
        const lastHourEvents = recentEvents.filter((e) => e.timestamp.getTime() > oneHourAgo.getTime());
        const scalingEvents = lastHourEvents.filter((e) => e.type === 'scale_up' || e.type === 'scale_down');
        const totalScaleAmount = scalingEvents.reduce((sum, event) => {
            return sum + Math.abs(event.desiredReplicas - event.currentReplicas);
        }, 0);
        const averageScaleAmount = scalingEvents.length > 0 ? totalScaleAmount / scalingEvents.length : 0;
        let totalReplicas = 0;
        const ruleMetrics = [];
        for (const rule of this.rules) {
            try {
                const currentReplicas = await this.scalingProvider.getCurrentReplicas(rule.targetDeployment);
                totalReplicas += currentReplicas;
                ruleMetrics.push({
                    id: rule.id,
                    name: rule.name,
                    currentReplicas,
                    desiredReplicas: rule.desiredReplicas,
                    minReplicas: rule.minReplicas,
                    maxReplicas: rule.maxReplicas,
                    enabled: rule.enabled,
                    lastEvaluatedAt: rule.lastEvaluatedAt,
                });
            }
            catch (error) {
                this.logger.warn(`获取规则 ${rule.id} 的副本数失败`, error.message);
            }
        }
        return {
            timestamp: now,
            rules: ruleMetrics,
            summary: {
                totalRules: this.rules.length,
                totalEnabledRules: this.rules.filter((r) => r.enabled).length,
                totalReplicas,
                scalingOperationsLastHour: scalingEvents.length,
                averageScaleAmount,
            },
        };
    }
};
exports.AutoscalingController = AutoscalingController;
__decorate([
    (0, common_1.Get)('rules'),
    (0, swagger_1.ApiOperation)({ summary: '获取所有扩缩容规则' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取规则列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "getRules", null);
__decorate([
    (0, common_1.Get)('rules/:id'),
    (0, swagger_1.ApiOperation)({ summary: '获取指定扩缩容规则' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取规则' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '规则不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "getRule", null);
__decorate([
    (0, common_1.Post)('rules'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: '创建扩缩容规则' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '规则创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数无效' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateScalingRuleDto]),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "createRule", null);
__decorate([
    (0, common_1.Put)('rules/:id'),
    (0, swagger_1.ApiOperation)({ summary: '更新扩缩容规则' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '规则更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '规则不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateScalingRuleDto]),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Delete)('rules/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: '删除扩缩容规则' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: '规则删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '规则不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "deleteRule", null);
__decorate([
    (0, common_1.Get)('decisions'),
    (0, swagger_1.ApiOperation)({ summary: '获取扩缩容决策历史' }),
    (0, swagger_1.ApiQuery)({ name: 'ruleId', required: false, description: '规则ID筛选' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: '返回数量限制',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取决策历史' }),
    __param(0, (0, common_1.Query)('ruleId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "getDecisions", null);
__decorate([
    (0, common_1.Get)('events'),
    (0, swagger_1.ApiOperation)({ summary: '获取扩缩容事件历史' }),
    (0, swagger_1.ApiQuery)({ name: 'ruleId', required: false, description: '规则ID筛选' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: '返回数量限制',
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取事件历史' }),
    __param(0, (0, common_1.Query)('ruleId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Post)('evaluate'),
    (0, swagger_1.ApiOperation)({ summary: '手动触发扩缩容评估' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '评估触发成功' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TriggerEvaluationDto]),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "triggerEvaluation", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取扩缩容统计信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取统计信息' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('provider/status'),
    (0, swagger_1.ApiOperation)({ summary: '获取扩缩容提供商状态' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取提供商状态' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "getProviderStatus", null);
__decorate([
    (0, common_1.Post)('provider/reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '重置模拟提供商状态' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '重置成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "resetProvider", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: '检查自动扩缩容系统健康状态' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '健康状态检查完成' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: '获取扩缩容相关指标' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取指标' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutoscalingController.prototype, "getMetrics", null);
exports.AutoscalingController = AutoscalingController = AutoscalingController_1 = __decorate([
    (0, swagger_1.ApiTags)('自动扩缩容'),
    (0, common_1.Controller)('autoscaling'),
    __metadata("design:paramtypes", [scaling_decision_engine_service_1.ScalingDecisionEngine,
        scaling_event_monitor_service_1.ScalingEventMonitor,
        kubernetes_scaling_provider_service_1.KubernetesScalingProvider])
], AutoscalingController);
//# sourceMappingURL=autoscaling.controller.js.map