import type { PlatformConfig } from '../interfaces/platform-adapter.interface';
import { PlatformAdapter, PlatformType, PublishContentInput, PublishResult, PublishStatus, PlatformHealthStatus, PlatformStats } from '../interfaces/platform-adapter.interface';
export declare class WechatAdapter implements PlatformAdapter {
    private readonly logger;
    private readonly http;
    private credentials;
    private config;
    private accessToken;
    private accessTokenExpiresAt;
    constructor(config: PlatformConfig);
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
    private getAccessToken;
    private uploadImage;
    private formatWechatContent;
    private publishNow;
    private schedulePublish;
    private getNextMidnight;
    getUsers(nextOpenId?: string): Promise<{
        total: number;
        count: number;
        data: {
            openid: string[];
        };
        next_openid: string;
    }>;
    getMaterials(type: 'image' | 'video' | 'voice' | 'news', offset?: number, count?: number): Promise<any>;
}
