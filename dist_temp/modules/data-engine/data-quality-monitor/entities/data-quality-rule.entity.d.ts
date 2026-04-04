export declare class DataQualityRule {
    id: string;
    name: string;
    tableName: string;
    fieldName: string | null;
    condition: string;
    threshold: number;
    severity: string;
    description: string | null;
    isActive: boolean;
    schedule: string | null;
    createdAt: Date;
    updatedAt: Date;
}
