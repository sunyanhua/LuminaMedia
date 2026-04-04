import { FieldMappingService, FieldMappingResult, StandardField } from './field-mapping.service';
export declare class FieldMappingController {
    private readonly fieldMappingService;
    constructor(fieldMappingService: FieldMappingService);
    mapHeaders(body: {
        headers: string[];
        industry?: string;
        dataSourceType?: 'excel' | 'csv' | 'api';
        sampleData?: Record<string, any>[];
    }): Promise<FieldMappingResult>;
    getStandardFields(): Promise<StandardField[]>;
    getStandardFieldsByCategory(): Promise<Record<string, StandardField[]>>;
    saveManualMapping(body: {
        sourceHeader: string;
        targetField: string;
        userId: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getMappingStats(): Promise<{
        totalRules: number;
        byConfidence: {
            high: number;
            medium: number;
            low: number;
        };
        byCategory: Record<import("./field-mapping.service").FieldCategory, number>;
        cacheHitRate: number;
    }>;
    validateMapping(body: {
        mapping: Record<string, string>;
        headers: string[];
    }): Promise<{
        valid: boolean;
        issues: Array<{
            type: 'missing' | 'duplicate' | 'invalid' | 'low_confidence';
            description: string;
            suggestion?: string;
        }>;
        score: number;
    }>;
    batchProcess(body: {
        files: Array<{
            filename: string;
            headers: string[];
            industry?: string;
            dataSourceType?: 'excel' | 'csv' | 'api';
        }>;
        autoConfirm?: boolean;
    }): Promise<{
        results: Array<{
            filename: string;
            mappingResult: FieldMappingResult;
            autoConfirmed: boolean;
            issues: string[];
        }>;
        summary: {
            totalFiles: number;
            mappedHeaders: number;
            totalHeaders: number;
            matchRate: number;
            averageConfidence: number;
        };
    }>;
}
