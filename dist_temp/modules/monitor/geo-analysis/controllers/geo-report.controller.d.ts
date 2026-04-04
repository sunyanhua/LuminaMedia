import type { Response } from 'express';
import { GeoAnalysisService } from '../services/geo-analysis.service';
export declare class GeoReportController {
    private readonly geoAnalysisService;
    constructor(geoAnalysisService: GeoAnalysisService);
    getReportSummary(analysisId: string): Promise<{
        analysisId: string;
        generatedAt: Date;
        summary: string;
        keyFindings: string[];
        recommendations: {
            category: string;
            recommendation: string;
            priority: "low" | "medium" | "high";
            expectedImpact: string;
            timeframe: string;
            resourcesNeeded: string[];
        }[];
    }>;
    exportReport(analysisId: string, format: "json" | "pdf" | undefined, res: Response): Promise<void>;
    getRegionalInsights(tenantId: string, timeRangeStart?: string, timeRangeEnd?: string): Promise<{
        tenantId: string;
        timeRange: {
            start: string;
            end: string;
        };
        regionalInsights: {
            region: string;
            marketGrowth: number;
            digitalAdoption: number;
            competitiveIntensity: number;
            keyOpportunities: string[];
        }[];
        recommendations: string[];
    }>;
    private generateSummary;
}
