import { PlatformType, CollectionMethod, CollectedDataItem } from '../../interfaces/data-collection.interface';
export interface PlatformCollector {
    getPlatform(): PlatformType;
    getSupportedMethods(): CollectionMethod[];
    validateCredentials(credentials: any): Promise<boolean>;
    collect(data: {
        credentials: any;
        config: any;
    }): Promise<CollectedDataItem[]>;
    testConnection(credentials: any): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }>;
    getApiUsage?(credentials: any): Promise<{
        dailyLimit: number;
        remaining: number;
        resetAt: Date;
    }>;
}
export interface CollectorConfig {
    enabled: boolean;
    frequency: number;
    maxResultsPerRun: number;
    useProxy: boolean;
    proxyRegion?: string;
    complianceLevel: 'strict' | 'moderate' | 'flexible';
}
