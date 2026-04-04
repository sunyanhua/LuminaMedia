export declare enum ScalingMetricType {
    RESOURCE = "resource",
    POD = "pod",
    OBJECT = "object",
    BUSINESS = "business"
}
export interface ScalingMetric {
    name: string;
    type: ScalingMetricType;
    description: string;
    targetType: 'Utilization' | 'AverageValue' | 'Value';
    targetValue: number;
    source?: {
        type: string;
        resourceName?: string;
        selector?: Record<string, string>;
    };
}
export interface ScalingBehavior {
    scaleUp?: {
        policies: ScalingPolicy[];
        stabilizationWindowSeconds?: number;
        selectPolicy?: 'Max' | 'Min' | 'Disabled';
    };
    scaleDown?: {
        policies: ScalingPolicy[];
        stabilizationWindowSeconds?: number;
        selectPolicy?: 'Max' | 'Min' | 'Disabled';
    };
}
export interface ScalingPolicy {
    type: 'Pods' | 'Percent';
    value: number;
    periodSeconds: number;
}
export interface ScalingRule {
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
    metrics: ScalingMetric[];
    behavior?: ScalingBehavior;
    enabled: boolean;
    lastEvaluatedAt?: Date;
    currentReplicas?: number;
    desiredReplicas?: number;
}
export declare enum ScalingEventType {
    SCALE_UP = "scale_up",
    SCALE_DOWN = "scale_down",
    NO_SCALE = "no_scale",
    ERROR = "error"
}
export interface ScalingEvent {
    id: string;
    ruleId: string;
    type: ScalingEventType;
    timestamp: Date;
    currentReplicas: number;
    desiredReplicas: number;
    metricValues: Array<{
        metric: string;
        currentValue: number;
        targetValue: number;
    }>;
    reason: string;
    message: string;
    successful: boolean;
    error?: string;
}
export interface ScalingDecision {
    ruleId: string;
    timestamp: Date;
    currentReplicas: number;
    calculatedReplicas: number;
    finalReplicas: number;
    metricEvaluations: Array<{
        metric: ScalingMetric;
        currentValue: number;
        targetValue: number;
        calculatedReplicas: number;
    }>;
    needsScaling: boolean;
    direction: 'up' | 'down' | 'none';
    scaleAmount: number;
}
export declare const PREDEFINED_SCALING_METRICS: ScalingMetric[];
export declare const PREDEFINED_SCALING_RULES: ScalingRule[];
export interface ScalingProvider {
    getName(): string;
    isAvailable(): Promise<boolean>;
    getCurrentReplicas(deployment: {
        name: string;
        namespace: string;
        apiVersion: string;
        kind: string;
    }): Promise<number>;
    scaleDeployment(deployment: {
        name: string;
        namespace: string;
        apiVersion: string;
        kind: string;
    }, replicas: number): Promise<boolean>;
    getMetricValue(metric: ScalingMetric): Promise<number>;
    getDeploymentStatus(deployment: {
        name: string;
        namespace: string;
        apiVersion: string;
        kind: string;
    }): Promise<{
        availableReplicas: number;
        readyReplicas: number;
        updatedReplicas: number;
        conditions: Array<{
            type: string;
            status: string;
            reason?: string;
            message?: string;
        }>;
    }>;
}
export interface ScalingDecisionEngine {
    evaluateRule(rule: ScalingRule): Promise<ScalingDecision>;
    executeDecision(decision: ScalingDecision): Promise<ScalingEvent>;
    getRecentDecisions(ruleId?: string, limit?: number): Promise<ScalingDecision[]>;
    getRecentEvents(ruleId?: string, limit?: number): Promise<ScalingEvent[]>;
}
