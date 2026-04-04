import { ConfigService } from '@nestjs/config';
import { ScalingMetricsService } from './scaling-metrics.service';
import { KubernetesScalingProvider } from '../integrations/kubernetes-scaling-provider.service';
import { ScalingRule, ScalingDecision, ScalingEvent } from '../interfaces/autoscaling.interface';
export declare class ScalingDecisionEngine {
    private readonly configService;
    private readonly metricsService;
    private readonly scalingProvider;
    private readonly logger;
    private readonly decisions;
    private readonly events;
    private readonly maxHistorySize;
    constructor(configService: ConfigService, metricsService: ScalingMetricsService, scalingProvider: KubernetesScalingProvider);
    evaluateAllRules(): Promise<void>;
    evaluateAndExecuteRule(rule: ScalingRule): Promise<ScalingEvent>;
    evaluateRule(rule: ScalingRule): Promise<ScalingDecision>;
    private applyBehaviorStrategy;
    private applyPolicies;
    executeDecision(decision: ScalingDecision): Promise<ScalingEvent>;
    private getEventReason;
    private getEventMessage;
    getRecentDecisions(ruleId?: string, limit?: number): Promise<ScalingDecision[]>;
    getRecentEvents(ruleId?: string, limit?: number): Promise<ScalingEvent[]>;
    private saveDecision;
    private saveEvent;
    private getEnabledRules;
    private getRuleById;
    triggerEvaluation(ruleId?: string): Promise<ScalingEvent[]>;
    getEngineStatus(): {
        totalDecisions: number;
        totalEvents: number;
        lastEvaluationTime?: Date;
        enabledRules: number;
    };
}
