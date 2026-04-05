"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const event_emitter_1 = require("@nestjs/event-emitter");
const publish_service_1 = require("./publish.service");
const platform_adapter_factory_1 = require("../adapters/platform-adapter.factory");
const platform_adapter_interface_1 = require("../interfaces/platform-adapter.interface");
const wechat_formatter_service_1 = require("./wechat-formatter.service");
const ai_image_generator_service_1 = require("./ai-image-generator.service");
const mockWechatAdapter = {
    getPlatformName: jest.fn().mockReturnValue('WeChat Mock'),
    getPlatformType: jest.fn().mockReturnValue(platform_adapter_interface_1.PlatformType.WECHAT),
    initialize: jest.fn().mockResolvedValue(undefined),
    healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
    publishContent: jest.fn().mockResolvedValue({
        publishId: 'wechat_123',
        platform: platform_adapter_interface_1.PlatformType.WECHAT,
        status: platform_adapter_interface_1.PublishStatusType.PUBLISHED,
        url: 'https://wechat.example.com/post/123',
        publishedAt: new Date(),
    }),
    getPublishStatus: jest.fn().mockResolvedValue({
        publishId: 'wechat_123',
        status: platform_adapter_interface_1.PublishStatusType.PUBLISHED,
        lastUpdated: new Date(),
    }),
    updateContent: jest.fn(),
    deleteContent: jest.fn().mockResolvedValue(undefined),
    getPlatformStats: jest.fn().mockResolvedValue({
        platform: platform_adapter_interface_1.PlatformType.WECHAT,
        totalPublished: 10,
        successRate: 95,
    }),
    cleanup: jest.fn().mockResolvedValue(undefined),
};
const mockXHSAdapter = {
    getPlatformName: jest.fn().mockReturnValue('XHS Mock'),
    getPlatformType: jest.fn().mockReturnValue(platform_adapter_interface_1.PlatformType.XIAOHONGSHU),
    initialize: jest.fn().mockResolvedValue(undefined),
    healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
    publishContent: jest.fn().mockResolvedValue({
        publishId: 'xhs_456',
        platform: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
        status: platform_adapter_interface_1.PublishStatusType.PUBLISHED,
        url: 'https://xiaohongshu.com/note/456',
        publishedAt: new Date(),
    }),
    getPublishStatus: jest.fn().mockResolvedValue({
        publishId: 'xhs_456',
        status: platform_adapter_interface_1.PublishStatusType.PUBLISHED,
        lastUpdated: new Date(),
    }),
    updateContent: jest.fn(),
    deleteContent: jest.fn().mockResolvedValue(undefined),
    getPlatformStats: jest.fn().mockResolvedValue({
        platform: platform_adapter_interface_1.PlatformType.XIAOHONGSHU,
        totalPublished: 5,
        successRate: 85,
    }),
    cleanup: jest.fn().mockResolvedValue(undefined),
};
const mockWechatFormatterService = {
    formatContent: jest.fn().mockImplementation((content) => Promise.resolve({
        html: content.content || '<p>Formatted content</p>',
        plainText: content.content || 'Formatted content',
        wordCount: (content.content || '').split(/\s+/).length || 2,
        imageCount: 0,
        qualityReport: {
            score: 85,
            issues: [],
            suggestions: [],
        },
        formattedAt: new Date(),
    })),
};
const mockAiImageGeneratorService = {
    generateImageSuggestions: jest.fn().mockResolvedValue([]),
};
describe('PublishService', () => {
    let service;
    let adapterFactory;
    let eventEmitter;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                publish_service_1.PublishService,
                {
                    provide: platform_adapter_factory_1.PlatformAdapterFactory,
                    useValue: {
                        createAdapters: jest.fn().mockReturnValue(new Map([
                            [platform_adapter_interface_1.PlatformType.WECHAT, mockWechatAdapter],
                            [platform_adapter_interface_1.PlatformType.XIAOHONGSHU, mockXHSAdapter],
                        ])),
                        initializeAdapters: jest.fn().mockResolvedValue(undefined),
                        cleanupAdapters: jest.fn().mockResolvedValue(undefined),
                        validateConfig: jest
                            .fn()
                            .mockReturnValue({ valid: true, errors: [] }),
                        createAdapter: jest.fn().mockImplementation((config) => {
                            if (config.type === platform_adapter_interface_1.PlatformType.WECHAT)
                                return mockWechatAdapter;
                            if (config.type === platform_adapter_interface_1.PlatformType.XIAOHONGSHU)
                                return mockXHSAdapter;
                            throw new Error(`Unknown platform type: ${config.type}`);
                        }),
                    },
                },
                {
                    provide: event_emitter_1.EventEmitter2,
                    useValue: {
                        emit: jest.fn(),
                    },
                },
                {
                    provide: wechat_formatter_service_1.WechatFormatterService,
                    useValue: mockWechatFormatterService,
                },
                {
                    provide: ai_image_generator_service_1.AIImageGeneratorService,
                    useValue: mockAiImageGeneratorService,
                },
            ],
        }).compile();
        service = module.get(publish_service_1.PublishService);
        adapterFactory = module.get(platform_adapter_factory_1.PlatformAdapterFactory);
        eventEmitter = module.get(event_emitter_1.EventEmitter2);
        service.adapters = new Map([
            [platform_adapter_interface_1.PlatformType.WECHAT, mockWechatAdapter],
            [platform_adapter_interface_1.PlatformType.XIAOHONGSHU, mockXHSAdapter],
        ]);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('publishToPlatform', () => {
        const mockContent = {
            title: 'Test Content',
            content: 'This is a test content for publishing.',
            coverImages: ['https://example.com/image.jpg'],
            tags: ['test', 'demo'],
        };
        it('should publish content to a single platform', async () => {
            const result = await service.publishToPlatform(platform_adapter_interface_1.PlatformType.WECHAT, mockContent);
            expect(mockWechatAdapter.publishContent).toHaveBeenCalledWith(expect.objectContaining({
                title: mockContent.title,
                coverImages: mockContent.coverImages,
                tags: mockContent.tags,
            }));
            expect(result.publishId).toBe('wechat_123');
            expect(result.platform).toBe(platform_adapter_interface_1.PlatformType.WECHAT);
            expect(result.status).toBe(platform_adapter_interface_1.PublishStatusType.PUBLISHED);
            expect(eventEmitter.emit).toHaveBeenCalledWith('publish.before', expect.any(Object));
            expect(eventEmitter.emit).toHaveBeenCalledWith('publish.after', expect.any(Object));
        });
        it('should throw error when platform adapter is not available', async () => {
            service.adapters = new Map();
            await expect(service.publishToPlatform(platform_adapter_interface_1.PlatformType.WECHAT, mockContent)).rejects.toThrow('No adapter available for platform: wechat');
        });
        it('should emit failure event when publish fails', async () => {
            const error = new Error('Publish failed');
            mockWechatAdapter.publishContent.mockRejectedValueOnce(error);
            await expect(service.publishToPlatform(platform_adapter_interface_1.PlatformType.WECHAT, mockContent)).rejects.toThrow('Publish failed');
            expect(eventEmitter.emit).toHaveBeenCalledWith('publish.before', expect.any(Object));
            expect(eventEmitter.emit).toHaveBeenCalledWith('publish.failed', expect.any(Object));
        });
    });
    describe('publishToPlatforms', () => {
        const mockContent = {
            title: 'Multi-platform Test',
            content: 'Content for multiple platforms.',
        };
        it('should publish content to multiple platforms', async () => {
            const platforms = [platform_adapter_interface_1.PlatformType.WECHAT, platform_adapter_interface_1.PlatformType.XIAOHONGSHU];
            const results = await service.publishToPlatforms(platforms, mockContent);
            expect(mockWechatAdapter.publishContent).toHaveBeenCalledWith(expect.objectContaining({
                title: mockContent.title,
            }));
            expect(mockXHSAdapter.publishContent).toHaveBeenCalledWith(expect.objectContaining({
                title: mockContent.title,
            }));
            expect(results.size).toBe(2);
            expect(results.get(platform_adapter_interface_1.PlatformType.WECHAT)?.publishId).toBe('wechat_123');
            expect(results.get(platform_adapter_interface_1.PlatformType.XIAOHONGSHU)?.publishId).toBe('xhs_456');
        });
        it('should handle partial failures gracefully', async () => {
            mockWechatAdapter.publishContent.mockRejectedValueOnce(new Error('WeChat API error'));
            const platforms = [platform_adapter_interface_1.PlatformType.WECHAT, platform_adapter_interface_1.PlatformType.XIAOHONGSHU];
            const results = await service.publishToPlatforms(platforms, mockContent);
            expect(results.size).toBe(1);
            expect(results.get(platform_adapter_interface_1.PlatformType.XIAOHONGSHU)?.publishId).toBe('xhs_456');
            expect(eventEmitter.emit).toHaveBeenCalledWith('publish.partial_failure', expect.any(Object));
        });
    });
    describe('getPublishStatus', () => {
        it('should get publish status from adapter', async () => {
            const status = await service.getPublishStatus(platform_adapter_interface_1.PlatformType.WECHAT, 'wechat_123');
            expect(mockWechatAdapter.getPublishStatus).toHaveBeenCalledWith('wechat_123');
            expect(status.publishId).toBe('wechat_123');
            expect(status.status).toBe(platform_adapter_interface_1.PublishStatusType.PUBLISHED);
        });
    });
    describe('deleteContent', () => {
        it('should delete content from platform', async () => {
            await service.deleteContent(platform_adapter_interface_1.PlatformType.WECHAT, 'wechat_123');
            expect(mockWechatAdapter.deleteContent).toHaveBeenCalledWith('wechat_123');
            expect(eventEmitter.emit).toHaveBeenCalledWith('publish.deleted', expect.any(Object));
        });
    });
    describe('getPlatformHealth', () => {
        it('should get platform health status', async () => {
            const health = await service.getPlatformHealth(platform_adapter_interface_1.PlatformType.WECHAT);
            expect(mockWechatAdapter.healthCheck).toHaveBeenCalled();
            expect(health.status).toBe('healthy');
        });
    });
    describe('getAllPlatformsHealth', () => {
        it('should get health status for all platforms', async () => {
            const healthStatuses = await service.getAllPlatformsHealth();
            expect(healthStatuses.size).toBe(2);
            expect(healthStatuses.get(platform_adapter_interface_1.PlatformType.WECHAT)?.status).toBe('healthy');
            expect(healthStatuses.get(platform_adapter_interface_1.PlatformType.XIAOHONGSHU)?.status).toBe('healthy');
        });
    });
    describe('addPlatformConfig', () => {
        it('should add and initialize new platform config', async () => {
            const newConfig = {
                type: platform_adapter_interface_1.PlatformType.WECHAT,
                name: 'New WeChat',
                enabled: true,
                credentials: {
                    appId: 'new_app_id',
                    appSecret: 'new_app_secret',
                    wechatId: 'new_wechat_id',
                    wechatName: 'New WeChat',
                },
            };
            await service.addPlatformConfig(newConfig);
            expect(adapterFactory.validateConfig).toHaveBeenCalledWith(newConfig);
            expect(adapterFactory.createAdapter).toHaveBeenCalledWith(newConfig);
            expect(mockWechatAdapter.initialize).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=publish.service.spec.js.map