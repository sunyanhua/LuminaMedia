import { TaskStatus, PlatformType, CollectionMethod } from '../interfaces/data-collection.interface';
export declare class DataCollectionTask {
    id: string;
    tenantId: string;
    platform: PlatformType;
    method: CollectionMethod;
    config: {
        target?: string;
        keywords?: string[];
        dateRange?: {
            start: Date;
            end: Date;
        };
        maxResults?: number;
        apiCredentials?: any;
    };
    status: TaskStatus;
    progress: number;
    errorMessage: string;
    result: {
        collectedCount: number;
        failedCount: number;
        totalCount: number;
        dataIds?: string[];
        summary?: string;
    };
    scheduledAt: Date;
    startedAt: Date;
    completedAt: Date;
    retryCount: number;
    nextRetryAt: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
