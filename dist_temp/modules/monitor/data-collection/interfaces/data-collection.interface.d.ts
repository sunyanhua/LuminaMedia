export declare enum PlatformType {
    WECHAT = "wechat",
    WEIBO = "weibo",
    XIAOHONGSHU = "xiaohongshu",
    DOUYIN = "douyin",
    NEWS = "news",
    FORUM = "forum",
    OTHER = "other"
}
export declare enum CollectionMethod {
    API = "api",
    RSS = "rss",
    CRAWLER = "crawler",
    HYBRID = "hybrid"
}
export declare enum TaskStatus {
    PENDING = "pending",
    SCHEDULED = "scheduled",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    RETRYING = "retrying"
}
export declare enum DataStatus {
    RAW = "raw",
    CLEANED = "cleaned",
    PROCESSED = "processed",
    ARCHIVED = "archived",
    DELETED = "deleted"
}
export interface PlatformCredentials {
    appId?: string;
    appSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    apiSecret?: string;
    username?: string;
    password?: string;
    cookies?: string;
    expiresAt?: Date;
}
export interface CollectionConfig {
    frequency: number;
    enabled: boolean;
    maxResultsPerRun: number;
    useProxy: boolean;
    proxyRegion?: string;
    complianceLevel: 'strict' | 'moderate' | 'flexible';
    dataRetentionDays: number;
}
export interface CollectedDataItem {
    id?: string;
    platform: PlatformType;
    sourceId: string;
    url: string;
    title: string;
    content: string;
    author?: string;
    publishDate?: Date;
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
}
