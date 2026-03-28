import {
  CloudProviderFactory,
  getCloudProvider,
  getStorageService,
  getAIService,
  getDatabaseService,
  getMessagingService,
} from './cloud-provider.factory';
import { CloudProvider } from './cloud-provider.interface';

// 模拟整个模块
jest.mock('./adapters/mock.adapter', () => ({
  MockAdapter: jest.fn().mockImplementation(() => ({
    getName: jest.fn().mockReturnValue('mock'),
    initialize: jest.fn().mockResolvedValue(undefined),
    healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
    cleanup: jest.fn().mockResolvedValue(undefined),
    storage: {
      uploadFile: jest.fn(),
      downloadFile: jest.fn(),
      deleteFile: jest.fn(),
      getFileUrl: jest.fn(),
      listFiles: jest.fn(),
    },
    ai: {
      callModel: jest.fn(),
      callLocalModel: jest.fn(),
      listAvailableModels: jest.fn(),
      getServiceStatus: jest.fn(),
    },
    database: {
      query: jest.fn(),
      execute: jest.fn(),
      beginTransaction: jest.fn(),
      getConnectionStats: jest.fn(),
      sharding: {
        getTablePartition: jest.fn(),
        migrateData: jest.fn(),
        analyzePartitionBalance: jest.fn(),
      },
    },
    messaging: {
      sendMessage: jest.fn(),
      receiveMessage: jest.fn(),
      acknowledgeMessage: jest.fn(),
      publishEvent: jest.fn(),
      subscribeEvent: jest.fn(),
    },
  })),
}));

jest.mock('./adapters/alicloud.adapter', () => ({
  AliCloudAdapter: jest.fn().mockImplementation(() => ({
    getName: jest.fn().mockReturnValue('alicloud'),
    initialize: jest.fn().mockResolvedValue(undefined),
    healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
    cleanup: jest.fn().mockResolvedValue(undefined),
    storage: {},
    ai: {},
    database: {},
    messaging: {},
  })),
}));

jest.mock('./adapters/private-deploy.adapter', () => ({
  PrivateDeployAdapter: jest.fn().mockImplementation(() => ({
    getName: jest.fn().mockReturnValue('private'),
    initialize: jest.fn().mockResolvedValue(undefined),
    healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
    cleanup: jest.fn().mockResolvedValue(undefined),
    storage: {},
    ai: {},
    database: {},
    messaging: {},
  })),
}));

describe('CloudProviderFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 每次测试前重置单例实例
    CloudProviderFactory.destroyInstance();
    // 重置环境变量
    process.env = { ...originalEnv };
    // 清除所有mock调用记录
    jest.clearAllMocks();
  });

  afterAll(() => {
    // 恢复原始环境变量
    process.env = originalEnv;
  });

  describe('getInstance', () => {
    it('应该默认返回MockAdapter当CLOUD_PROVIDER未设置', async () => {
      delete process.env.CLOUD_PROVIDER;

      const provider = await CloudProviderFactory.getInstance();

      expect(provider.getName()).toBe('mock');
      // 验证MockAdapter构造函数被调用
      const { MockAdapter } = require('./adapters/mock.adapter');
      expect(MockAdapter).toHaveBeenCalledTimes(1);
    });

    it('应该返回MockAdapter当CLOUD_PROVIDER设置为mock', async () => {
      process.env.CLOUD_PROVIDER = 'mock';

      const provider = await CloudProviderFactory.getInstance();

      expect(provider.getName()).toBe('mock');
      const { MockAdapter } = require('./adapters/mock.adapter');
      expect(MockAdapter).toHaveBeenCalledTimes(1);
    });

    it('应该返回AliCloudAdapter当CLOUD_PROVIDER设置为alicloud', async () => {
      process.env.CLOUD_PROVIDER = 'alicloud';

      const provider = await CloudProviderFactory.getInstance();

      expect(provider.getName()).toBe('alicloud');
      const { AliCloudAdapter } = require('./adapters/alicloud.adapter');
      expect(AliCloudAdapter).toHaveBeenCalledTimes(1);
    });

    it('应该返回PrivateDeployAdapter当CLOUD_PROVIDER设置为private', async () => {
      process.env.CLOUD_PROVIDER = 'private';

      const provider = await CloudProviderFactory.getInstance();

      expect(provider.getName()).toBe('private');
      const {
        PrivateDeployAdapter,
      } = require('./adapters/private-deploy.adapter');
      expect(PrivateDeployAdapter).toHaveBeenCalledTimes(1);
    });

    it('应该对不支持的provider类型返回MockAdapter', async () => {
      process.env.CLOUD_PROVIDER = 'unknown';

      const provider = await CloudProviderFactory.getInstance();

      expect(provider.getName()).toBe('mock');
      const { MockAdapter } = require('./adapters/mock.adapter');
      expect(MockAdapter).toHaveBeenCalledTimes(1);
    });

    it('应该初始化provider实例', async () => {
      const provider = await CloudProviderFactory.getInstance();
      expect(provider.initialize).toHaveBeenCalledTimes(1);
    });

    it('应该实现单例模式，多次调用返回相同实例', async () => {
      const provider1 = await CloudProviderFactory.getInstance();
      const provider2 = await CloudProviderFactory.getInstance();

      expect(provider1).toBe(provider2);
      // MockAdapter只应被调用一次
      const { MockAdapter } = require('./adapters/mock.adapter');
      expect(MockAdapter).toHaveBeenCalledTimes(1);
    });
  });

  describe('destroyInstance', () => {
    it('应该清理当前实例并允许创建新实例', async () => {
      const provider1 = await CloudProviderFactory.getInstance();
      const cleanupSpy = jest.spyOn(provider1, 'cleanup');

      CloudProviderFactory.destroyInstance();

      expect(cleanupSpy).toHaveBeenCalledTimes(1);
      expect(CloudProviderFactory['instance']).toBeNull();

      // 再次获取实例应该创建新实例
      const provider2 = await CloudProviderFactory.getInstance();
      expect(provider2).not.toBe(provider1);
      const { MockAdapter } = require('./adapters/mock.adapter');
      expect(MockAdapter).toHaveBeenCalledTimes(2); // 第一次调用+新实例
    });

    it('应该安全地调用当没有实例存在时', () => {
      expect(CloudProviderFactory['instance']).toBeNull();
      expect(() => CloudProviderFactory.destroyInstance()).not.toThrow();
    });
  });

  describe('便捷函数', () => {
    describe('getCloudProvider', () => {
      it('应该返回与CloudProviderFactory.getInstance相同的实例', async () => {
        const provider1 = await getCloudProvider();
        const provider2 = await CloudProviderFactory.getInstance();

        expect(provider1).toBe(provider2);
      });
    });

    describe('getStorageService', () => {
      it('应该返回provider的storage服务', async () => {
        const provider = await CloudProviderFactory.getInstance();
        const storageService = await getStorageService();

        expect(storageService).toBe(provider.storage);
      });
    });

    describe('getAIService', () => {
      it('应该返回provider的ai服务', async () => {
        const provider = await CloudProviderFactory.getInstance();
        const aiService = await getAIService();

        expect(aiService).toBe(provider.ai);
      });
    });

    describe('getDatabaseService', () => {
      it('应该返回provider的database服务', async () => {
        const provider = await CloudProviderFactory.getInstance();
        const databaseService = await getDatabaseService();

        expect(databaseService).toBe(provider.database);
      });
    });

    describe('getMessagingService', () => {
      it('应该返回provider的messaging服务', async () => {
        const provider = await CloudProviderFactory.getInstance();
        const messagingService = await getMessagingService();

        expect(messagingService).toBe(provider.messaging);
      });
    });
  });

  describe('大小写不敏感', () => {
    it('应该处理大写环境变量', async () => {
      process.env.CLOUD_PROVIDER = 'ALICLOUD';

      const provider = await CloudProviderFactory.getInstance();

      expect(provider.getName()).toBe('alicloud');
      const { AliCloudAdapter } = require('./adapters/alicloud.adapter');
      expect(AliCloudAdapter).toHaveBeenCalledTimes(1);
    });

    it('应该处理混合大小写环境变量', async () => {
      process.env.CLOUD_PROVIDER = 'AliCloud';

      const provider = await CloudProviderFactory.getInstance();

      expect(provider.getName()).toBe('alicloud');
      const { AliCloudAdapter } = require('./adapters/alicloud.adapter');
      expect(AliCloudAdapter).toHaveBeenCalledTimes(1);
    });
  });
});
