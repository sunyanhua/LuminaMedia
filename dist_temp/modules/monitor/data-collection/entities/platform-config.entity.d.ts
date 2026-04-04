import { PlatformType, CollectionMethod } from '../interfaces/data-collection.interface';
import type { PlatformCredentials, CollectionConfig } from '../interfaces/data-collection.interface';
export declare class PlatformConfig {
    id: string;
    tenantId: string;
    platform: PlatformType;
    primaryMethod: CollectionMethod;
    credentials: PlatformCredentials;
    config: CollectionConfig;
    isActive: boolean;
    successCount: number;
    failureCount: number;
    lastSuccessAt: Date;
    lastFailureAt: Date;
    lastErrorMessage: string;
    successRate: number;
    totalCollected: number;
    lastCollectionAt: Date;
    apiLimits: {
        dailyLimit: number;
        remaining: number;
        resetAt: Date;
        rateLimit: number;
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
