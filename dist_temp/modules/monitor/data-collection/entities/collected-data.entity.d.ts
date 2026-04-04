import { PlatformType, DataStatus } from '../interfaces/data-collection.interface';
export declare class CollectedData {
    id: string;
    tenantId: string;
    platform: PlatformType;
    sourceId: string;
    url: string;
    title: string;
    content: string;
    summary: string;
    author: string;
    publishDate: Date;
    collectedAt: Date;
    metadata: {
        likes?: number;
        shares?: number;
        comments?: number;
        views?: number;
        sentiment?: number;
        language?: string;
        region?: string;
        tags?: string[];
        categories?: string[];
        mediaUrls?: string[];
        rawData?: any;
    };
    status: DataStatus;
    qualityScore: number;
    sentimentScore: number;
    sentimentLabel: string;
    entities: {
        persons?: string[];
        organizations?: string[];
        locations?: string[];
        products?: string[];
        events?: string[];
    };
    topics: string[];
    isHot: boolean;
    hotnessScore: number;
    isDeleted: boolean;
    deletedAt: Date;
    deletedBy: string;
    taskId: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
