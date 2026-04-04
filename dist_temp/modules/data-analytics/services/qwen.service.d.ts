import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiStrategyResponse, GeminiError, GeminiGenerateOptions } from '../interfaces/gemini.interface';
export declare class QwenService implements OnModuleInit {
    private configService;
    private readonly logger;
    private config;
    private isAvailable;
    private apiKeys;
    private currentKeyIndex;
    private keyFailures;
    private maxFailuresPerKey;
    private keyRotationMode;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private parseApiKeys;
    private getNextApiKey;
    private recordKeyFailure;
    private resetKeyFailure;
    private rotateToNextKey;
    private initializeWithCurrentKey;
    private initialize;
    isQwenAvailable(): boolean;
    generateMarketingStrategy(options: GeminiGenerateOptions): Promise<{
        success: boolean;
        data?: GeminiStrategyResponse;
        error?: GeminiError;
        fallbackUsed?: boolean;
        isTruncated?: boolean;
    }>;
    private buildStrategyPrompt;
    private repairTruncatedJson;
    private parseQwenResponse;
    private generateFallbackStrategy;
    private generateContentViaRest;
}
