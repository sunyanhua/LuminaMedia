import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PublishService } from './publish.service';
import { PlatformAdapterFactory } from '../adapters/platform-adapter.factory';
import {
  PlatformType,
  PublishContentInput,
  PublishStatusType,
} from '../interfaces/platform-adapter.interface';
import { WechatFormatterService } from './wechat-formatter.service';
import { AIImageGeneratorService } from './ai-image-generator.service';

// Mock adapters
const mockWechatAdapter = {
  getPlatformName: jest.fn().mockReturnValue('WeChat Mock'),
  getPlatformType: jest.fn().mockReturnValue(PlatformType.WECHAT),
  initialize: jest.fn().mockResolvedValue(undefined),
  healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
  publishContent: jest.fn().mockResolvedValue({
    publishId: 'wechat_123',
    platform: PlatformType.WECHAT,
    status: PublishStatusType.PUBLISHED,
    url: 'https://wechat.example.com/post/123',
    publishedAt: new Date(),
  }),
  getPublishStatus: jest.fn().mockResolvedValue({
    publishId: 'wechat_123',
    status: PublishStatusType.PUBLISHED,
    lastUpdated: new Date(),
  }),
  updateContent: jest.fn(),
  deleteContent: jest.fn().mockResolvedValue(undefined),
  getPlatformStats: jest.fn().mockResolvedValue({
    platform: PlatformType.WECHAT,
    totalPublished: 10,
    successRate: 95,
  }),
  cleanup: jest.fn().mockResolvedValue(undefined),
};

const mockXHSAdapter = {
  getPlatformName: jest.fn().mockReturnValue('XHS Mock'),
  getPlatformType: jest.fn().mockReturnValue(PlatformType.XIAOHONGSHU),
  initialize: jest.fn().mockResolvedValue(undefined),
  healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
  publishContent: jest.fn().mockResolvedValue({
    publishId: 'xhs_456',
    platform: PlatformType.XIAOHONGSHU,
    status: PublishStatusType.PUBLISHED,
    url: 'https://xiaohongshu.com/note/456',
    publishedAt: new Date(),
  }),
  getPublishStatus: jest.fn().mockResolvedValue({
    publishId: 'xhs_456',
    status: PublishStatusType.PUBLISHED,
    lastUpdated: new Date(),
  }),
  updateContent: jest.fn(),
  deleteContent: jest.fn().mockResolvedValue(undefined),
  getPlatformStats: jest.fn().mockResolvedValue({
    platform: PlatformType.XIAOHONGSHU,
    totalPublished: 5,
    successRate: 85,
  }),
  cleanup: jest.fn().mockResolvedValue(undefined),
};

// Mock services
const mockWechatFormatterService = {
  formatContent: jest.fn().mockImplementation((content) =>
    Promise.resolve({
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
    }),
  ),
};

const mockAiImageGeneratorService = {
  generateImageSuggestions: jest.fn().mockResolvedValue([]),
};

describe('PublishService', () => {
  let service: PublishService;
  let adapterFactory: PlatformAdapterFactory;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishService,
        {
          provide: PlatformAdapterFactory,
          useValue: {
            createAdapters: jest.fn().mockReturnValue(
              new Map([
                [PlatformType.WECHAT, mockWechatAdapter],
                [PlatformType.XIAOHONGSHU, mockXHSAdapter],
              ]),
            ),
            initializeAdapters: jest.fn().mockResolvedValue(undefined),
            cleanupAdapters: jest.fn().mockResolvedValue(undefined),
            validateConfig: jest
              .fn()
              .mockReturnValue({ valid: true, errors: [] }),
            createAdapter: jest.fn().mockImplementation((config) => {
              if (config.type === PlatformType.WECHAT) return mockWechatAdapter;
              if (config.type === PlatformType.XIAOHONGSHU)
                return mockXHSAdapter;
              throw new Error(`Unknown platform type: ${config.type}`);
            }),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: WechatFormatterService,
          useValue: mockWechatFormatterService,
        },
        {
          provide: AIImageGeneratorService,
          useValue: mockAiImageGeneratorService,
        },
      ],
    }).compile();

    service = module.get<PublishService>(PublishService);
    adapterFactory = module.get<PlatformAdapterFactory>(PlatformAdapterFactory);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // Initialize adapters
    (service as any).adapters = new Map([
      [PlatformType.WECHAT, mockWechatAdapter],
      [PlatformType.XIAOHONGSHU, mockXHSAdapter],
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishToPlatform', () => {
    const mockContent: PublishContentInput = {
      title: 'Test Content',
      content: 'This is a test content for publishing.',
      coverImages: ['https://example.com/image.jpg'],
      tags: ['test', 'demo'],
    };

    it('should publish content to a single platform', async () => {
      const result = await service.publishToPlatform(
        PlatformType.WECHAT,
        mockContent,
      );

      expect(mockWechatAdapter.publishContent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockContent.title,
          coverImages: mockContent.coverImages,
          tags: mockContent.tags,
        }),
      );
      expect(result.publishId).toBe('wechat_123');
      expect(result.platform).toBe(PlatformType.WECHAT);
      expect(result.status).toBe(PublishStatusType.PUBLISHED);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'publish.before',
        expect.any(Object),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'publish.after',
        expect.any(Object),
      );
    });

    it('should throw error when platform adapter is not available', async () => {
      (service as any).adapters = new Map();

      await expect(
        service.publishToPlatform(PlatformType.WECHAT, mockContent),
      ).rejects.toThrow('No adapter available for platform: wechat');
    });

    it('should emit failure event when publish fails', async () => {
      const error = new Error('Publish failed');
      mockWechatAdapter.publishContent.mockRejectedValueOnce(error);

      await expect(
        service.publishToPlatform(PlatformType.WECHAT, mockContent),
      ).rejects.toThrow('Publish failed');

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'publish.before',
        expect.any(Object),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'publish.failed',
        expect.any(Object),
      );
    });
  });

  describe('publishToPlatforms', () => {
    const mockContent: PublishContentInput = {
      title: 'Multi-platform Test',
      content: 'Content for multiple platforms.',
    };

    it('should publish content to multiple platforms', async () => {
      const platforms = [PlatformType.WECHAT, PlatformType.XIAOHONGSHU];
      const results = await service.publishToPlatforms(platforms, mockContent);

      expect(mockWechatAdapter.publishContent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockContent.title,
        }),
      );
      expect(mockXHSAdapter.publishContent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockContent.title,
        }),
      );
      expect(results.size).toBe(2);
      expect(results.get(PlatformType.WECHAT)?.publishId).toBe('wechat_123');
      expect(results.get(PlatformType.XIAOHONGSHU)?.publishId).toBe('xhs_456');
    });

    it('should handle partial failures gracefully', async () => {
      mockWechatAdapter.publishContent.mockRejectedValueOnce(
        new Error('WeChat API error'),
      );

      const platforms = [PlatformType.WECHAT, PlatformType.XIAOHONGSHU];
      const results = await service.publishToPlatforms(platforms, mockContent);

      expect(results.size).toBe(1); // Only XHS succeeded
      expect(results.get(PlatformType.XIAOHONGSHU)?.publishId).toBe('xhs_456');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'publish.partial_failure',
        expect.any(Object),
      );
    });
  });

  describe('getPublishStatus', () => {
    it('should get publish status from adapter', async () => {
      const status = await service.getPublishStatus(
        PlatformType.WECHAT,
        'wechat_123',
      );

      expect(mockWechatAdapter.getPublishStatus).toHaveBeenCalledWith(
        'wechat_123',
      );
      expect(status.publishId).toBe('wechat_123');
      expect(status.status).toBe(PublishStatusType.PUBLISHED);
    });
  });

  describe('deleteContent', () => {
    it('should delete content from platform', async () => {
      await service.deleteContent(PlatformType.WECHAT, 'wechat_123');

      expect(mockWechatAdapter.deleteContent).toHaveBeenCalledWith(
        'wechat_123',
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'publish.deleted',
        expect.any(Object),
      );
    });
  });

  describe('getPlatformHealth', () => {
    it('should get platform health status', async () => {
      const health = await service.getPlatformHealth(PlatformType.WECHAT);

      expect(mockWechatAdapter.healthCheck).toHaveBeenCalled();
      expect(health.status).toBe('healthy');
    });
  });

  describe('getAllPlatformsHealth', () => {
    it('should get health status for all platforms', async () => {
      const healthStatuses = await service.getAllPlatformsHealth();

      expect(healthStatuses.size).toBe(2);
      expect(healthStatuses.get(PlatformType.WECHAT)?.status).toBe('healthy');
      expect(healthStatuses.get(PlatformType.XIAOHONGSHU)?.status).toBe(
        'healthy',
      );
    });
  });

  describe('addPlatformConfig', () => {
    it('should add and initialize new platform config', async () => {
      const newConfig = {
        type: PlatformType.WECHAT,
        name: 'New WeChat',
        enabled: true,
        credentials: {
          appId: 'new_app_id',
          appSecret: 'new_app_secret',
          wechatId: 'new_wechat_id',
          wechatName: 'New WeChat',
        },
      };

      await service.addPlatformConfig(newConfig as any);

      expect(adapterFactory.validateConfig).toHaveBeenCalledWith(newConfig);
      expect(adapterFactory.createAdapter).toHaveBeenCalledWith(newConfig);
      expect(mockWechatAdapter.initialize).toHaveBeenCalled();
    });
  });
});
