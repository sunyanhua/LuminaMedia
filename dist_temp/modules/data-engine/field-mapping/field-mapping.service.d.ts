import { ConfigService } from '@nestjs/config';
import { GeminiService } from '../../data-analytics/services/gemini.service';
export interface FieldMappingRule {
    sourceHeader: string;
    targetField: string;
    confidence: number;
    createdAt: Date;
    updatedAt: Date;
    usageCount: number;
}
export interface FieldMappingResult {
    mapping: Record<string, string>;
    confidence: Record<string, number>;
    suggestedMappings: Array<{
        sourceHeader: string;
        targetField: string;
        confidence: number;
        reasoning?: string;
    }>;
    unmatchedHeaders: string[];
    standardFields: StandardField[];
}
export interface StandardField {
    id: string;
    name: string;
    description: string;
    category: FieldCategory;
    dataType: 'string' | 'number' | 'date' | 'boolean' | 'array';
    examples: string[];
    synonyms: string[];
}
export type FieldCategory = 'basic_lifecycle' | 'consumption_personality' | 'realtime_status' | 'social_activity' | 'general_info' | 'demographic' | 'behavioral' | 'transactional';
export declare class FieldMappingService {
    private configService;
    private geminiService;
    private readonly logger;
    private standardFields;
    private mappingCache;
    private readonly CACHE_TTL;
    constructor(configService: ConfigService, geminiService: GeminiService);
    private initializeStandardFields;
    getAllStandardFields(): StandardField[];
    getStandardFieldsByCategory(): Record<FieldCategory, StandardField[]>;
    mapHeadersWithAI(headers: string[], context?: {
        industry?: string;
        dataSourceType?: 'excel' | 'csv' | 'api';
        sampleData?: Record<string, any>[];
    }): Promise<FieldMappingResult>;
    private getCachedMappings;
    private cacheMapping;
    private mapWithRules;
    private mapWithAI;
    private buildAIMappingPrompt;
    private parseAIResponse;
    private normalizeHeader;
    saveManualMapping(sourceHeader: string, targetField: string, userId: string, notes?: string): void;
    getMappingStats(): {
        totalRules: number;
        byConfidence: {
            high: number;
            medium: number;
            low: number;
        };
        byCategory: Record<FieldCategory, number>;
        cacheHitRate: number;
    };
}
