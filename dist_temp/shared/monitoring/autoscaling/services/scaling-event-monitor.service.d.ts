import { ConfigService } from '@nestjs/config';
import { AlertRuleService } from '../../alerts/rules/alert-rule.service';
import { ScalingDecisionEngine } from './scaling-decision-engine.service';
export declare class ScalingEventMonitor {
    private readonly configService;
    private readonly alertRuleService;
    private readonly decisionEngine;
    private readonly logger;
    private readonly eventStats;
    constructor(configService: ConfigService, alertRuleService: AlertRuleService, decisionEngine: ScalingDecisionEngine);
    monitorScalingEvents(): Promise<void>;
    private processEvent;
    private updateEventStats;
    private triggerErrorAlert;
    private checkScaleUpPattern;
    private checkScaleDownPattern;
    private triggerFrequentScalingAlert;
    private triggerLargeScaleAlert;
    private triggerMinReplicasAlert;
    private checkForAnomalies;
    private triggerHighErrorRateAlert;
    private triggerNoActivityAlert;
    private isSignificantEvent;
    getEventStats(): Array<{
        ruleId: string;
        totalEvents: number;
        scaleUpEvents: number;
        scaleDownEvents: number;
        errorEvents: number;
        lastEventTime?: Date;
        errorRate: number;
    }>;
    clearStats(): void;
    getHealthStatus(): {
        healthy: boolean;
        totalRules: number;
        totalEvents: number;
        errorRate: number;
        issues: Array<{
            ruleId: string;
            issue: string;
            severity: string;
        }>;
    };
}
