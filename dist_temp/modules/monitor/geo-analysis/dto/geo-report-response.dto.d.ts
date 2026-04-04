import { AnalysisStatus } from '../interfaces/geo-analysis.interface';
export declare class GeoVisualizationDto {
    id: string;
    type: 'map' | 'chart' | 'table' | 'heatmap' | 'network';
    title: string;
    description: string;
    data: any;
    format: 'png' | 'svg' | 'html' | 'json';
    interactive: boolean;
}
export declare class GeoRecommendationDto {
    id: string;
    category: 'seo' | 'content' | 'marketing' | 'product' | 'partnership';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    expectedImpact: number;
    implementationDifficulty: number;
    timeframe: string;
    estimatedCost?: number;
    requiredResources: string[];
    relatedRegions: string[];
}
export declare class AnalysisMetadataDto {
    processingTime: number;
    dataSourcesUsed: string[];
    algorithmVersion: string;
    generatedAt: Date;
}
export declare class GeoAnalysisResponseDto {
    analysisId: string;
    status: AnalysisStatus;
    results?: any;
    visualizations?: GeoVisualizationDto[];
    recommendations?: GeoRecommendationDto[];
    metadata: AnalysisMetadataDto;
}
export declare class GeoReportResponseDto {
    reportId: string;
    tenantId: string;
    customerProfileId?: string;
    generatedAt: Date;
    timeframe: {
        start: Date;
        end: Date;
    };
    executiveSummary: {
        overview: string;
        keyFindings: string[];
        topOpportunities: string[];
        criticalThreats: string[];
        strategicRecommendations: string[];
        expectedOutcomes: string[];
    };
    regionalAnalysis: any;
    competitiveAnalysis: any;
    seoAnalysis: any;
    opportunityAnalysis: any;
    recommendations: any;
    implementationPlan: any;
    appendices?: any;
}
