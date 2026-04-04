import { AnalysisType, RegionLevel } from '../interfaces/geo-analysis.interface';
export declare class TimeRangeDto {
    start: Date;
    end: Date;
}
export declare class AnalysisOptionsDto {
    includeVisualizations?: boolean;
    includeRecommendations?: boolean;
    language?: string;
    depth?: 'basic' | 'standard' | 'comprehensive';
}
export declare class GeoAnalysisRequestDto {
    tenantId: string;
    customerProfileId?: string;
    targetRegionIds?: string[];
    targetRegionNames?: string[];
    analysisTypes: AnalysisType[];
    timeRange?: TimeRangeDto;
    competitors?: string[];
    industries?: string[];
    keywords?: string[];
    metrics?: string[];
    regionLevel?: RegionLevel;
    dataSources?: string[];
    options?: AnalysisOptionsDto;
}
