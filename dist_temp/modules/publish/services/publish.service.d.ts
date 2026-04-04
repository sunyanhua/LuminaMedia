import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PlatformAdapterFactory } from '../adapters/platform-adapter.factory';
import { PlatformAdapter, PlatformType, PublishContentInput, PublishResult, PublishStatus, PlatformConfig } from '../interfaces/platform-adapter.interface';
import { WechatFormatterService } from './wechat-formatter.service';
import { AIImageGeneratorService } from './ai-image-generator.service';
export declare class PublishService implements OnModuleInit, OnModuleDestroy {
    private readonly adapterFactory;
    private readonly eventEmitter;
    private readonly wechatFormatterService;
    private readonly aiImageGeneratorService;
    private readonly logger;
    private adapters;
    private platformConfigs;
    constructor(adapterFactory: PlatformAdapterFactory, eventEmitter: EventEmitter2, wechatFormatterService: WechatFormatterService, aiImageGeneratorService: AIImageGeneratorService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    publishToPlatform(platformType: PlatformType, content: PublishContentInput): Promise<PublishResult>;
    publishToPlatforms(platformTypes: PlatformType[], content: PublishContentInput): Promise<Map<PlatformType, PublishResult>>;
    publishToAllPlatforms(content: PublishContentInput): Promise<Map<PlatformType, PublishResult>>;
    getPublishStatus(platformType: PlatformType, publishId: string): Promise<PublishStatus>;
    getPublishStatuses(publishRecords: Array<{
        platformType: PlatformType;
        publishId: string;
    }>): Promise<Map<PlatformType, PublishStatus>>;
    deleteContent(platformType: PlatformType, publishId: string): Promise<void>;
    deleteContents(records: Array<{
        platformType: PlatformType;
        publishId: string;
    }>): Promise<Map<PlatformType, boolean>>;
    getPlatformHealth(platformType: PlatformType): Promise<any>;
    getAllPlatformsHealth(): Promise<Map<PlatformType, any>>;
    getPlatformStats(platformType: PlatformType): Promise<any>;
    getAllPlatformsStats(): Promise<Map<PlatformType, any>>;
    addPlatformConfig(config: PlatformConfig): Promise<void>;
    removePlatformConfig(platformType: PlatformType): Promise<void>;
    getPlatformConfigs(): PlatformConfig[];
    getEnabledPlatforms(): PlatformType[];
    getAdapter(platformType: PlatformType): PlatformAdapter | undefined;
    getAdapters(): Map<PlatformType, PlatformAdapter>;
    private loadPlatformConfigs;
    private recordPublishResult;
    private preprocessContent;
    private validatePublishContent;
}
