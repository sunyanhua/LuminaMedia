import { ScalingDecisionEngine } from '../services/scaling-decision-engine.service';
import { ScalingEventMonitor } from '../services/scaling-event-monitor.service';
import { KubernetesScalingProvider } from '../integrations/kubernetes-scaling-provider.service';
import { ScalingRule, ScalingDecision, ScalingEvent } from '../interfaces/autoscaling.interface';
declare class CreateScalingRuleDto {
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
declare class UpdateScalingRuleDto {
    name?: string;
    minReplicas?: number;
    maxReplicas?: number;
    metrics?: any[];
    behavior?: any;
    enabled?: boolean;
}
declare class TriggerEvaluationDto {
    ruleId?: string;
}
export declare class AutoscalingController {
    private readonly decisionEngine;
    private readonly eventMonitor;
    private readonly scalingProvider;
    private readonly logger;
    private rules;
    constructor(decisionEngine: ScalingDecisionEngine, eventMonitor: ScalingEventMonitor, scalingProvider: KubernetesScalingProvider);
    getRules(): Promise<ScalingRule[]>;
    getRule(id: string): Promise<ScalingRule>;
    createRule(dto: CreateScalingRuleDto): Promise<ScalingRule>;
    updateRule(id: string, dto: UpdateScalingRuleDto): Promise<ScalingRule>;
    deleteRule(id: string): Promise<void>;
    getDecisions(ruleId?: string, limit?: number): Promise<ScalingDecision[]>;
    getEvents(ruleId?: string, limit?: number): Promise<ScalingEvent[]>;
    triggerEvaluation(dto: TriggerEvaluationDto): Promise<ScalingEvent[]>;
    getStats(): Promise<{
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
    }>;
    getProviderStatus(): Promise<{
        providerName: string;
        available: boolean;
        simulatedDeployments: Array<{
            key: string;
            replicas: number;
            status: any;
        }>;
    }>;
    resetProvider(): Promise<{
        success: boolean;
        message: string;
    }>;
    getHealth(): Promise<{
        healthy: boolean;
        components: Array<{
            name: string;
            healthy: boolean;
            message: string;
        }>;
        issues: string[];
    }>;
    getMetrics(): Promise<{
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
    }>;
}
export {};
