import { TagCalculatorService, TagCalculationResult, TagDefinition } from './tag-calculation.service';
export declare class TagCalculationController {
    private readonly tagCalculatorService;
    constructor(tagCalculatorService: TagCalculatorService);
    calculateTags(body: {
        tagName?: string;
        forceRecalculate?: boolean;
        batchSize?: number;
    }): Promise<TagCalculationResult>;
    getTagDefinitions(): Promise<TagDefinition[]>;
    getTagDefinition(tagName: string): Promise<TagDefinition>;
    getCalculationStatus(): Promise<{
        tags: Array<{
            name: string;
            lastCalculated?: Date;
            nextCalculation?: Date;
            refreshInterval: string;
            dependsOn: string[];
        }>;
        systemStatus: 'idle' | 'calculating' | 'error';
        lastCalculationTime?: Date;
        nextScheduledCalculation?: Date;
    }>;
    createCustomTag(body: {
        name: string;
        description: string;
        sqlTemplate: string;
        refreshInterval: 'daily' | 'weekly' | 'monthly' | 'manual';
        parameters?: Record<string, any>;
        validationRules?: string[];
    }): Promise<{
        success: boolean;
        message: string;
        tagName: string;
    }>;
    testSqlTemplate(body: {
        sqlTemplate: string;
        sampleSize?: number;
    }): Promise<{
        valid: boolean;
        executionTime?: number;
        rowCount?: number;
        error?: string;
        sampleResults?: any[];
    }>;
}
