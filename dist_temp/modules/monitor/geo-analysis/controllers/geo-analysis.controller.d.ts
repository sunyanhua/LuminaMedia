import { GeoAnalysisService } from '../services/geo-analysis.service';
import { GeoAnalysisRequestDto } from '../dto/geo-analysis-request.dto';
import { GeoAnalysisResponse } from '../interfaces/geo-analysis.interface';
export declare class GeoAnalysisController {
    private readonly geoAnalysisService;
    constructor(geoAnalysisService: GeoAnalysisService);
    analyze(request: GeoAnalysisRequestDto): Promise<GeoAnalysisResponse>;
    getAnalysisResult(analysisId: string): Promise<import("../entities/geo-analysis-result.entity").GeoAnalysisResult>;
    getRegions(tenantId: string, regionLevel?: string, regionType?: string): Promise<import("../entities/geo-region.entity").GeoRegion[]>;
    getSeoSuggestions(tenantId: string, suggestionType?: string, priority?: string): Promise<import("../entities/seo-suggestion.entity").SeoSuggestion[]>;
}
