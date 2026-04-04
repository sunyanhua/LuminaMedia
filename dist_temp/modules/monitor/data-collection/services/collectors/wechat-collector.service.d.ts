import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PlatformCollector } from '../interfaces/platform-collector.interface';
import { PlatformType, CollectionMethod, CollectedDataItem } from '../../interfaces/data-collection.interface';
export declare class WeChatCollectorService implements PlatformCollector {
    private configService;
    private httpService;
    private readonly logger;
    private readonly apiBaseUrl;
    private accessToken;
    private tokenExpiresAt;
    constructor(configService: ConfigService, httpService: HttpService);
    getPlatform(): PlatformType;
    getSupportedMethods(): CollectionMethod[];
    private getAccessToken;
    validateCredentials(credentials: any): Promise<boolean>;
    collect(data: {
        credentials: any;
        config: {
            officialAccountIds?: string[];
            keywords?: string[];
            dateRange?: {
                start: Date;
                end: Date;
            };
            maxResults?: number;
        };
    }): Promise<CollectedDataItem[]>;
    private fetchOfficialAccountArticles;
    private fetchArticleContent;
    private calculateQualityScore;
    testConnection(credentials: any): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }>;
    getApiUsage(credentials: any): Promise<{
        dailyLimit: number;
        remaining: number;
        resetAt: Date;
    }>;
}
