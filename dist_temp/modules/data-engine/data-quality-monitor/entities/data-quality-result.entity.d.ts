export declare class DataQualityResult {
    id: string;
    ruleId: string;
    ruleName: string;
    tableName: string;
    fieldName: string | null;
    metricValue: number;
    threshold: number;
    severity: string;
    passed: boolean;
    executionTime: Date;
    details: Record<string, any> | null;
}
