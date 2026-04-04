import { Repository } from 'typeorm';
import { DataQualityRule } from './entities/data-quality-rule.entity';
import { DataQualityResult } from './entities/data-quality-result.entity';
import { CreateDataQualityRuleDto } from './dto/create-data-quality-rule.dto';
import { UpdateDataQualityRuleDto } from './dto/update-data-quality-rule.dto';
import { DataSource } from 'typeorm';
export interface DataQualityMetric {
    ruleId: string;
    tableName: string;
    fieldName: string;
    metricName: string;
    value: number;
    threshold: number;
    severity: 'info' | 'warning' | 'error';
    timestamp: Date;
}
export interface AlertNotification {
    ruleId: string;
    ruleName: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: Date;
    details: Record<string, any>;
}
export declare class DataQualityMonitorService {
    private readonly ruleRepository;
    private readonly resultRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(ruleRepository: Repository<DataQualityRule>, resultRepository: Repository<DataQualityResult>, dataSource: DataSource);
    createRule(createDto: CreateDataQualityRuleDto): Promise<DataQualityRule>;
    updateRule(id: string, updateDto: UpdateDataQualityRuleDto): Promise<DataQualityRule>;
    deleteRule(id: string): Promise<void>;
    getRules(): Promise<DataQualityRule[]>;
    executeRule(rule: DataQualityRule): Promise<DataQualityResult>;
    executeAllRules(): Promise<DataQualityResult[]>;
    scheduleDailyScan(): Promise<void>;
    sendAlert(alert: AlertNotification): Promise<void>;
    getRecentResults(limit?: number): Promise<DataQualityResult[]>;
    getRuleCompliance(ruleId: string, days?: number): Promise<{
        date: string;
        compliance: number;
    }[]>;
}
