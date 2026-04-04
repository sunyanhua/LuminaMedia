export declare enum RuleSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error"
}
export declare class CreateDataQualityRuleDto {
    name: string;
    tableName: string;
    fieldName?: string;
    condition: string;
    threshold: number;
    severity: RuleSeverity;
    description?: string;
    isActive?: boolean;
    schedule?: string;
}
