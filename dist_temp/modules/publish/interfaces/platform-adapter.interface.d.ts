export interface PlatformAdapter {
    getPlatformName(): string;
    getPlatformType(): PlatformType;
    initialize(): Promise<void>;
    healthCheck(): Promise<PlatformHealthStatus>;
    publishContent(content: PublishContentInput): Promise<PublishResult>;
    getPublishStatus(publishId: string): Promise<PublishStatus>;
    updateContent(publishId: string, content: Partial<PublishContentInput>): Promise<PublishResult>;
    deleteContent(publishId: string): Promise<void>;
    getPlatformStats(): Promise<PlatformStats>;
    cleanup(): Promise<void>;
}
export declare enum PlatformType {
    WECHAT = "wechat",
    XIAOHONGSHU = "xiaohongshu",
    WEIBO = "weibo",
    DOUYIN = "douyin",
    TIKTOK = "tiktok",
    BILIBILI = "bilibili",
    KUAISHOU = "kuaishou",
    OTHER = "other"
}
export interface PublishContentInput {
    title: string;
    content: string;
    summary?: string;
    coverImages?: string[];
    contentImages?: string[];
    videoUrl?: string;
    tags?: string[];
    publishAt?: Date;
    location?: LocationInfo;
    mentions?: string[];
    productLinks?: ProductLink[];
    externalLinks?: ExternalLink[];
    metadata?: Record<string, any>;
    tenantId?: string;
    createdBy?: string;
    workflowId?: string;
    draftId?: string;
}
export interface PublishResult {
    publishId: string;
    platform: PlatformType;
    status: PublishStatusType;
    url?: string;
    rawResponse?: any;
    publishedAt?: Date;
    error?: string;
    metadata?: Record<string, any>;
}
export declare enum PublishStatusType {
    DRAFT = "draft",
    PENDING = "pending",
    PUBLISHING = "publishing",
    PUBLISHED = "published",
    FAILED = "failed",
    DELETED = "deleted",
    SCHEDULED = "scheduled"
}
export interface PublishStatus {
    publishId: string;
    status: PublishStatusType;
    progress?: number;
    message?: string;
    lastUpdated: Date;
    retryCount?: number;
    nextRetryAt?: Date;
}
export interface PlatformHealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    lastChecked: Date;
    metrics?: {
        availability: number;
        latency: number;
        successRate: number;
        quotaUsed: number;
        quotaRemaining: number;
    };
}
export interface PlatformStats {
    platform: PlatformType;
    totalPublished: number;
    totalFailed: number;
    totalScheduled: number;
    averagePublishTime: number;
    successRate: number;
    lastPublishAt?: Date;
    quotaInfo?: {
        dailyLimit: number;
        usedToday: number;
        remainingToday: number;
        resetAt: Date;
    };
}
export interface LocationInfo {
    name: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    province?: string;
    country?: string;
}
export interface ProductLink {
    title: string;
    url: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
    description?: string;
}
export interface ExternalLink {
    title: string;
    url: string;
    description?: string;
}
export interface PlatformConfig {
    type: PlatformType;
    name: string;
    enabled: boolean;
    credentials: PlatformCredentials;
    options?: PlatformOptions;
    quota?: PlatformQuota;
    webhookUrl?: string;
}
export type PlatformCredentials = WechatCredentials | XHSCredentials | WeiboCredentials | DouyinCredentials | OtherPlatformCredentials;
export interface WechatCredentials {
    appId: string;
    appSecret: string;
    accessToken?: string;
    accessTokenExpiresAt?: Date;
    refreshToken?: string;
    wechatId: string;
    wechatName: string;
    encodingAESKey?: string;
    token?: string;
}
export interface XHSCredentials {
    username: string;
    password?: string;
    sessionToken?: string;
    cookies?: string;
    deviceId?: string;
    userId?: string;
    xhsToken?: string;
}
export interface WeiboCredentials {
    appKey: string;
    appSecret: string;
    accessToken?: string;
    refreshToken?: string;
    uid?: string;
    screenName?: string;
}
export interface DouyinCredentials {
    clientKey: string;
    clientSecret: string;
    accessToken?: string;
    refreshToken?: string;
    openId?: string;
    unionId?: string;
}
export interface OtherPlatformCredentials {
    type: string;
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    username?: string;
    password?: string;
    customFields?: Record<string, string>;
}
export interface PlatformOptions {
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
    useProxy?: boolean;
    proxyUrl?: string;
    verifySSL?: boolean;
    customHeaders?: Record<string, string>;
    platformSpecific?: Record<string, any>;
}
export interface PlatformQuota {
    dailyLimit: number;
    perMinuteLimit?: number;
    perHourLimit?: number;
    maxFileSize?: number;
    maxImages?: number;
    maxVideoSize?: number;
    maxVideoDuration?: number;
}
