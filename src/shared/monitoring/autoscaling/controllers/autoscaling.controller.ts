import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ScalingDecisionEngine } from '../services/scaling-decision-engine.service';
import { ScalingEventMonitor } from '../services/scaling-event-monitor.service';
import { KubernetesScalingProvider } from '../integrations/kubernetes-scaling-provider.service';
import {
  ScalingRule,
  ScalingDecision,
  ScalingEvent,
  PREDEFINED_SCALING_RULES,
} from '../interfaces/autoscaling.interface';

// DTO定义
class ScalingRuleDto implements ScalingRule {
  id: string;
  name: string;
  targetDeployment: {
    name: string;
    namespace: string;
    apiVersion: string;
    kind: string;
  };
  minReplicas: number;
  maxReplicas: number;
  metrics: any[];
  behavior?: any;
  enabled: boolean;
  lastEvaluatedAt?: Date;
  currentReplicas?: number;
  desiredReplicas?: number;
}

class CreateScalingRuleDto {
  name: string;
  targetDeployment: {
    name: string;
    namespace: string;
    apiVersion: string;
    kind: string;
  };
  minReplicas: number;
  maxReplicas: number;
  metrics: any[];
  behavior?: any;
  enabled: boolean;
}

class UpdateScalingRuleDto {
  name?: string;
  minReplicas?: number;
  maxReplicas?: number;
  metrics?: any[];
  behavior?: any;
  enabled?: boolean;
}

class TriggerEvaluationDto {
  ruleId?: string;
}

@ApiTags('自动扩缩容')
@Controller('autoscaling')
export class AutoscalingController {
  private readonly logger = new Logger(AutoscalingController.name);
  private rules: ScalingRule[] = [...PREDEFINED_SCALING_RULES];

  constructor(
    private readonly decisionEngine: ScalingDecisionEngine,
    private readonly eventMonitor: ScalingEventMonitor,
    private readonly scalingProvider: KubernetesScalingProvider,
  ) {}

  @Get('rules')
  @ApiOperation({ summary: '获取所有扩缩容规则' })
  @ApiResponse({ status: 200, description: '成功获取规则列表' })
  async getRules(): Promise<ScalingRule[]> {
    return this.rules;
  }

  @Get('rules/:id')
  @ApiOperation({ summary: '获取指定扩缩容规则' })
  @ApiResponse({ status: 200, description: '成功获取规则' })
  @ApiResponse({ status: 404, description: '规则不存在' })
  async getRule(@Param('id') id: string): Promise<ScalingRule> {
    const rule = this.rules.find((r) => r.id === id);
    if (!rule) {
      throw new Error(`规则不存在: ${id}`);
    }
    return rule;
  }

  @Post('rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建扩缩容规则' })
  @ApiResponse({ status: 201, description: '规则创建成功' })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  async createRule(@Body() dto: CreateScalingRuleDto): Promise<ScalingRule> {
    // 生成规则ID
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const rule: ScalingRule = {
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

  @Put('rules/:id')
  @ApiOperation({ summary: '更新扩缩容规则' })
  @ApiResponse({ status: 200, description: '规则更新成功' })
  @ApiResponse({ status: 404, description: '规则不存在' })
  async updateRule(
    @Param('id') id: string,
    @Body() dto: UpdateScalingRuleDto,
  ): Promise<ScalingRule> {
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

  @Delete('rules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除扩缩容规则' })
  @ApiResponse({ status: 204, description: '规则删除成功' })
  @ApiResponse({ status: 404, description: '规则不存在' })
  async deleteRule(@Param('id') id: string): Promise<void> {
    const index = this.rules.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`规则不存在: ${id}`);
    }

    this.rules.splice(index, 1);
    this.logger.log(`删除扩缩容规则: ${id}`);
  }

  @Get('decisions')
  @ApiOperation({ summary: '获取扩缩容决策历史' })
  @ApiQuery({ name: 'ruleId', required: false, description: '规则ID筛选' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制', type: Number })
  @ApiResponse({ status: 200, description: '成功获取决策历史' })
  async getDecisions(
    @Query('ruleId') ruleId?: string,
    @Query('limit') limit?: number,
  ): Promise<ScalingDecision[]> {
    const limitNum = limit ? parseInt(limit.toString(), 10) : 50;
    return await this.decisionEngine.getRecentDecisions(ruleId, limitNum);
  }

  @Get('events')
  @ApiOperation({ summary: '获取扩缩容事件历史' })
  @ApiQuery({ name: 'ruleId', required: false, description: '规则ID筛选' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制', type: Number })
  @ApiResponse({ status: 200, description: '成功获取事件历史' })
  async getEvents(
    @Query('ruleId') ruleId?: string,
    @Query('limit') limit?: number,
  ): Promise<ScalingEvent[]> {
    const limitNum = limit ? parseInt(limit.toString(), 10) : 50;
    return await this.decisionEngine.getRecentEvents(ruleId, limitNum);
  }

  @Post('evaluate')
  @ApiOperation({ summary: '手动触发扩缩容评估' })
  @ApiResponse({ status: 200, description: '评估触发成功' })
  async triggerEvaluation(@Body() dto: TriggerEvaluationDto): Promise<ScalingEvent[]> {
    this.logger.log(`手动触发扩缩容评估: ${dto.ruleId || '所有规则'}`);
    return await this.decisionEngine.triggerEvaluation(dto.ruleId);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取扩缩容统计信息' })
  @ApiResponse({ status: 200, description: '成功获取统计信息' })
  async getStats(): Promise<{
    rules: {
      total: number;
      enabled: number;
      disabled: number;
    };
    decisions: {
      total: number;
      lastEvaluationTime?: Date;
    };
    events: {
      total: number;
      scaleUp: number;
      scaleDown: number;
      errors: number;
    };
    engineStatus: any;
    monitorHealth: any;
  }> {
    const enabledRules = this.rules.filter((r) => r.enabled);
    const engineStatus = this.decisionEngine.getEngineStatus();
    const eventStats = this.eventMonitor.getEventStats();
    const monitorHealth = this.eventMonitor.getHealthStatus();

    const eventTotals = eventStats.reduce(
      (acc, stats) => {
        acc.total += stats.totalEvents;
        acc.scaleUp += stats.scaleUpEvents;
        acc.scaleDown += stats.scaleDownEvents;
        acc.errors += stats.errorEvents;
        return acc;
      },
      { total: 0, scaleUp: 0, scaleDown: 0, errors: 0 },
    );

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

  @Get('provider/status')
  @ApiOperation({ summary: '获取扩缩容提供商状态' })
  @ApiResponse({ status: 200, description: '成功获取提供商状态' })
  async getProviderStatus(): Promise<{
    providerName: string;
    available: boolean;
    simulatedDeployments: Array<{
      key: string;
      replicas: number;
      status: any;
    }>;
  }> {
    const available = await this.scalingProvider.isAvailable();
    const deployments = this.scalingProvider.getAllSimulatedDeployments();

    const deploymentArray = Array.from(deployments.entries()).map(
      ([key, { replicas, status }]) => ({
        key,
        replicas,
        status,
      }),
    );

    return {
      providerName: this.scalingProvider.getName(),
      available,
      simulatedDeployments: deploymentArray,
    };
  }

  @Post('provider/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重置模拟提供商状态' })
  @ApiResponse({ status: 200, description: '重置成功' })
  async resetProvider(): Promise<{ success: boolean; message: string }> {
    this.scalingProvider.resetSimulatedDeployments();
    return {
      success: true,
      message: '模拟提供商状态已重置',
    };
  }

  @Get('health')
  @ApiOperation({ summary: '检查自动扩缩容系统健康状态' })
  @ApiResponse({ status: 200, description: '健康状态检查完成' })
  async getHealth(): Promise<{
    healthy: boolean;
    components: Array<{
      name: string;
      healthy: boolean;
      message: string;
    }>;
    issues: string[];
  }> {
    const components = [];
    const issues = [];

    try {
      // 检查决策引擎
      const engineStatus = this.decisionEngine.getEngineStatus();
      components.push({
        name: '决策引擎',
        healthy: true,
        message: `运行正常，已处理 ${engineStatus.totalDecisions} 个决策`,
      });
    } catch (error) {
      components.push({
        name: '决策引擎',
        healthy: false,
        message: `错误: ${error.message}`,
      });
      issues.push(`决策引擎异常: ${error.message}`);
    }

    try {
      // 检查事件监控
      const monitorHealth = this.eventMonitor.getHealthStatus();
      components.push({
        name: '事件监控',
        healthy: monitorHealth.healthy,
        message: `监控 ${monitorHealth.totalRules} 个规则，错误率 ${(monitorHealth.errorRate * 100).toFixed(1)}%`,
      });

      if (!monitorHealth.healthy) {
        issues.push('事件监控检测到问题');
      }
    } catch (error) {
      components.push({
        name: '事件监控',
        healthy: false,
        message: `错误: ${error.message}`,
      });
      issues.push(`事件监控异常: ${error.message}`);
    }

    try {
      // 检查提供商
      const available = await this.scalingProvider.isAvailable();
      components.push({
        name: '扩缩容提供商',
        healthy: available,
        message: available ? '连接正常' : '连接异常',
      });

      if (!available) {
        issues.push('扩缩容提供商不可用');
      }
    } catch (error) {
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

  @Get('metrics')
  @ApiOperation({ summary: '获取扩缩容相关指标' })
  @ApiResponse({ status: 200, description: '成功获取指标' })
  async getMetrics(): Promise<{
    timestamp: Date;
    rules: Array<{
      id: string;
      name: string;
      currentReplicas?: number;
      desiredReplicas?: number;
      minReplicas: number;
      maxReplicas: number;
      enabled: boolean;
      lastEvaluatedAt?: Date;
    }>;
    summary: {
      totalRules: number;
      totalEnabledRules: number;
      totalReplicas: number;
      scalingOperationsLastHour: number;
      averageScaleAmount: number;
    };
  }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 获取最近一小时的事件
    const recentEvents = await this.decisionEngine.getRecentEvents(
      undefined,
      1000,
    );
    const lastHourEvents = recentEvents.filter(
      (e) => e.timestamp.getTime() > oneHourAgo.getTime(),
    );

    const scalingEvents = lastHourEvents.filter(
      (e) => e.type === 'scale_up' || e.type === 'scale_down',
    );

    const totalScaleAmount = scalingEvents.reduce((sum, event) => {
      return sum + Math.abs(event.desiredReplicas - event.currentReplicas);
    }, 0);

    const averageScaleAmount =
      scalingEvents.length > 0
        ? totalScaleAmount / scalingEvents.length
        : 0;

    // 计算总副本数
    let totalReplicas = 0;
    const ruleMetrics = [];

    for (const rule of this.rules) {
      try {
        const currentReplicas = await this.scalingProvider.getCurrentReplicas(
          rule.targetDeployment,
        );
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
      } catch (error) {
        // 如果获取失败，跳过该规则
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
}