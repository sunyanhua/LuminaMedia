import { DataQualityMonitorService } from './data-quality-monitor.service';
import { CreateDataQualityRuleDto } from './dto/create-data-quality-rule.dto';
import { UpdateDataQualityRuleDto } from './dto/update-data-quality-rule.dto';
import { DataQualityResult } from './entities/data-quality-result.entity';
export declare class DataQualityMonitorController {
    private readonly dataQualityMonitorService;
    constructor(dataQualityMonitorService: DataQualityMonitorService);
    createRule(createDataQualityRuleDto: CreateDataQualityRuleDto): Promise<import("./entities/data-quality-rule.entity").DataQualityRule>;
    getRules(): Promise<import("./entities/data-quality-rule.entity").DataQualityRule[]>;
    getRule(id: string): Promise<import("./entities/data-quality-rule.entity").DataQualityRule | undefined>;
    updateRule(id: string, updateDataQualityRuleDto: UpdateDataQualityRuleDto): Promise<import("./entities/data-quality-rule.entity").DataQualityRule>;
    deleteRule(id: string): Promise<void>;
    executeAllRules(): Promise<DataQualityResult[]>;
    executeRule(ruleId: string): Promise<DataQualityResult>;
    getRecentResults(limit?: number): Promise<DataQualityResult[]>;
    getRuleCompliance(ruleId: string, days?: number): Promise<{
        date: string;
        compliance: number;
    }[]>;
    triggerDailyScan(): Promise<void>;
}
