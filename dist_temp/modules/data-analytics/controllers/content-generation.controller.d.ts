import { ContentGenerationService } from '../services/content-generation.service';
import { GeminiService } from '../services/gemini.service';
import { GenerateTextDto } from '../dto/generate-text.dto';
import { GenerateMarketingContentDto } from '../dto/generate-marketing-content.dto';
import { Platform } from '../../../shared/enums/platform.enum';
export declare class ContentGenerationController {
    private readonly contentGenerationService;
    private readonly geminiService;
    constructor(contentGenerationService: ContentGenerationService, geminiService: GeminiService);
    generateText(generateTextDto: GenerateTextDto): Promise<{
        success: boolean;
        data: import("../interfaces/content-generation.interface").GeneratedContent | undefined;
        qualityAssessment: import("../interfaces/content-generation.interface").ContentQualityAssessment | undefined;
        processingTime: number | undefined;
        modelUsed: string | undefined;
        error: {
            code: string;
            message: string;
            details?: any;
        } | undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        data?: undefined;
        qualityAssessment?: undefined;
        processingTime?: undefined;
        modelUsed?: undefined;
    }>;
    generateMarketingContent(generateMarketingContentDto: GenerateMarketingContentDto): Promise<{
        success: boolean;
        marketingContent: import("../interfaces/content-generation.interface").MarketingContent | undefined;
        processingTime: number | undefined;
        modelUsed: string | undefined;
        error: {
            code: string;
            message: string;
            details?: any;
        } | undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        marketingContent?: undefined;
        processingTime?: undefined;
        modelUsed?: undefined;
    }>;
    getTemplates(platform?: Platform): Promise<{
        success: boolean;
        data: any;
        count: any;
        error?: undefined;
    } | {
        success: boolean;
        error: {
            code: string;
            message: any;
        };
        data?: undefined;
        count?: undefined;
    }>;
    getStatus(): Promise<{
        success: boolean;
        data: {
            geminiAvailable: boolean;
            service: string;
            timestamp: string;
        };
    }>;
    getHealth(): Promise<{
        success: boolean;
        data: {
            geminiAvailable: boolean;
            timestamp: string;
            error: string | undefined;
            details: any;
        };
    }>;
}
