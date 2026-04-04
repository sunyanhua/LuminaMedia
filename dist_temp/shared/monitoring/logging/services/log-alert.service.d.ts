import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { LogAlertRule } from '../interfaces/log-analysis.interface';
import { LogAnalysisService } from './log-analysis.service';
export declare class LogAlertService implements OnModuleInit {
    private readonly configService;
    private readonly logAnalysisService;
    private readonly schedulerRegistry;
    private readonly rules;
    private readonly alertHistory;
    constructor(configService: ConfigService, logAnalysisService: LogAnalysisService, schedulerRegistry: SchedulerRegistry);
    onModuleInit(): Promise<void>;
    addRule(rule: LogAlertRule): Promise<void>;
    updateRule(ruleId: string, updates: Partial<LogAlertRule>): Promise<void>;
    deleteRule(ruleId: string): Promise<void>;
    getRules(): LogAlertRule[];
    getAlertHistory(ruleId?: string, limit?: number): any[];
    checkAllRules(): Promise<Array<{
        rule: LogAlertRule;
        triggered: boolean;
        details?: any;
    }>>;
    private executeAlertActions;
    private executeAction;
    private sendNotification;
    private callWebhook;
    private executeScript;
    private writeLog;
    private recordAlertTrigger;
    private loadAlertRules;
    private saveAlertRules;
    private getDefaultRules;
    private scheduleAlertChecks;
    private scheduleRuleCheck;
    private unscheduleRuleCheck;
}
