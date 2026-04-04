import { AnalysisAgentOutput } from '../../analysis/interfaces/analysis-agent.interface';
import { StrategyAgentOutput } from '../../strategy/interfaces/strategy-agent.interface';
import { CopywritingAgentOutput } from '../../copywriting/interfaces/copywriting-agent.interface';
export interface AgentWorkflowInput {
    customerData: any[];
    industryContext: string;
    businessGoals: string[];
    budgetConstraints?: {
        maxBudget: number;
        currency?: string;
    };
    timeline?: {
        startDate: Date;
        endDate: Date;
    };
    platformSpecs?: any[];
    brandGuidelines?: any;
    forbiddenWords?: string[];
}
export interface AgentWorkflowOutput {
    analysis: AnalysisAgentOutput;
    strategy: StrategyAgentOutput;
    copywriting: CopywritingAgentOutput;
    workflowStatus: {
        success: boolean;
        totalDuration: number;
        stageDurations: {
            analysis: number;
            strategy: number;
            copywriting: number;
        };
        error?: string;
    };
    executionId: string;
    timestamp: Date;
}
export declare enum WorkflowExecutionStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    PAUSED = "paused",
    CANCELLED = "cancelled"
}
export interface WorkflowStepStatus {
    stepName: string;
    status: WorkflowExecutionStatus;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    error?: string;
    input?: any;
    output?: any;
}
export interface WorkflowAuditLog {
    executionId: string;
    timestamp: Date;
    action: string;
    actor: string;
    details: any;
    stepName?: string;
    previousStatus?: WorkflowExecutionStatus;
    newStatus?: WorkflowExecutionStatus;
}
export interface WorkflowConfig {
    enableHumanIntervention: boolean;
    timeouts: {
        analysis: number;
        strategy: number;
        copywriting: number;
        total: number;
    };
    retry: {
        maxAttempts: number;
        backoffFactor: number;
    };
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
