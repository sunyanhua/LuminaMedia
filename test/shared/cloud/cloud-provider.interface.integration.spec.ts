import { CloudProvider } from '../../../src/shared/cloud/cloud-provider.interface';
import { MockAdapter } from '../../../src/shared/cloud/adapters/mock.adapter';
import { AliCloudAdapter } from '../../../src/shared/cloud/adapters/alicloud.adapter';
import { PrivateDeployAdapter } from '../../../src/shared/cloud/adapters/private-deploy.adapter';
import { CloudProviderFactory } from '../../../src/shared/cloud/cloud-provider.factory';

/**
 * CloudProvider接口集成测试
 *
 * 测试目标：
 * 1. 所有适配器正确实现CloudProvider接口
 * 2. 工厂正确创建和切换适配器
 * 3. 各适配器接口一致性
 * 4. 服务依赖注入无冲突
 */

describe('CloudProvider Interface Integration', () => {
  // 定义所有需要测试的适配器构造函数
  const adapters = [
    { name: 'MockAdapter', constructor: MockAdapter },
    { name: 'AliCloudAdapter', constructor: AliCloudAdapter },
    { name: 'PrivateDeployAdapter', constructor: PrivateDeployAdapter },
  ];

  // 测试所有适配器都实现了CloudProvider接口
  describe('适配器接口一致性', () => {
    adapters.forEach(({ name, constructor }) => {
      describe(`${name}`, () => {
        let adapter: CloudProvider;

        beforeEach(() => {
          adapter = new constructor();
        });

        afterEach(async () => {
          // 清理资源
          if (adapter.cleanup) {
            await adapter.cleanup().catch(() => {});
          }
        });

        it('应该实现getName方法', () => {
          expect(typeof adapter.getName).toBe('function');
          expect(adapter.getName()).toBeDefined();
          expect(typeof adapter.getName()).toBe('string');
        });

        it('应该实现initialize方法', () => {
          expect(typeof adapter.initialize).toBe('function');
          expect(adapter.initialize()).toBeInstanceOf(Promise);
        });

        it('应该实现healthCheck方法', () => {
          expect(typeof adapter.healthCheck).toBe('function');
          const healthCheckResult = adapter.healthCheck();
          expect(healthCheckResult).toBeInstanceOf(Promise);
        });

        it('应该实现cleanup方法', () => {
          expect(typeof adapter.cleanup).toBe('function');
          expect(adapter.cleanup()).toBeInstanceOf(Promise);
        });

        it('应该包含storage服务', () => {
          expect(adapter.storage).toBeDefined();
          expect(typeof adapter.storage.uploadFile).toBe('function');
          expect(typeof adapter.storage.downloadFile).toBe('function');
          expect(typeof adapter.storage.deleteFile).toBe('function');
          expect(typeof adapter.storage.getFileUrl).toBe('function');
          expect(typeof adapter.storage.listFiles).toBe('function');
        });

        it('应该包含ai服务', () => {
          expect(adapter.ai).toBeDefined();
          expect(typeof adapter.ai.callModel).toBe('function');
          expect(typeof adapter.ai.callLocalModel).toBe('function');
          expect(typeof adapter.ai.listAvailableModels).toBe('function');
          expect(typeof adapter.ai.getServiceStatus).toBe('function');
        });

        it('应该包含database服务', () => {
          expect(adapter.database).toBeDefined();
          expect(typeof adapter.database.query).toBe('function');
          expect(typeof adapter.database.execute).toBe('function');
          expect(typeof adapter.database.beginTransaction).toBe('function');
          expect(typeof adapter.database.getConnectionStats).toBe('function');
          expect(adapter.database.sharding).toBeDefined();
        });

        it('应该包含messaging服务', () => {
          expect(adapter.messaging).toBeDefined();
          expect(typeof adapter.messaging.sendMessage).toBe('function');
          expect(typeof adapter.messaging.receiveMessage).toBe('function');
          expect(typeof adapter.messaging.acknowledgeMessage).toBe('function');
          expect(typeof adapter.messaging.publishEvent).toBe('function');
          expect(typeof adapter.messaging.subscribeEvent).toBe('function');
        });

        it('应该正确初始化', async () => {
          await expect(adapter.initialize()).resolves.not.toThrow();
        });

        it('应该返回有效的健康检查结果', async () => {
          const health = await adapter.healthCheck();

          expect(health).toBeDefined();
          expect(health.status).toBeDefined();
          expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
          expect(health.details).toBeDefined();
          expect(typeof health.details).toBe('object');
        });

        it('应该正确清理资源', async () => {
          await expect(adapter.cleanup()).resolves.not.toThrow();
        });
      });
    });
  });

  // 测试工厂切换逻辑
  describe('工厂切换逻辑', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      CloudProviderFactory.destroyInstance();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('应该能切换不同适配器', async () => {
      // 测试mock适配器
      process.env.CLOUD_PROVIDER = 'mock';
      CloudProviderFactory.destroyInstance();
      const mockProvider = await CloudProviderFactory.getInstance();
      expect(mockProvider.getName()).toBe('mock');

      // 测试alicloud适配器
      process.env.CLOUD_PROVIDER = 'alicloud';
      CloudProviderFactory.destroyInstance();
      const aliProvider = await CloudProviderFactory.getInstance();
      expect(aliProvider.getName()).toBe('alicloud');

      // 测试private适配器
      process.env.CLOUD_PROVIDER = 'private';
      CloudProviderFactory.destroyInstance();
      const privateProvider = await CloudProviderFactory.getInstance();
      expect(privateProvider.getName()).toBe('private');
    });

    it('应该保持适配器接口一致性', async () => {
      const providers = ['mock', 'alicloud', 'private'];

      for (const providerType of providers) {
        process.env.CLOUD_PROVIDER = providerType;
        CloudProviderFactory.destroyInstance();

        const provider = await CloudProviderFactory.getInstance();

        // 验证所有必需方法都存在
        expect(typeof provider.getName).toBe('function');
        expect(typeof provider.initialize).toBe('function');
        expect(typeof provider.healthCheck).toBe('function');
        expect(typeof provider.cleanup).toBe('function');

        expect(provider.storage).toBeDefined();
        expect(provider.ai).toBeDefined();
        expect(provider.database).toBeDefined();
        expect(provider.messaging).toBeDefined();

        // 验证可以调用方法而不抛出错误
        await expect(provider.initialize()).resolves.not.toThrow();
        await expect(provider.healthCheck()).resolves.toBeDefined();
      }
    });
  });

  // 测试服务依赖注入
  describe('服务依赖注入', () => {
    adapters.forEach(({ name, constructor }) => {
      describe(`${name}`, () => {
        let adapter: CloudProvider;

        beforeEach(() => {
          adapter = new constructor();
        });

        it('storage服务应该实现所有必需方法', async () => {
          const { storage } = adapter;

          // 测试uploadFile
          const uploadResult = await storage.uploadFile(
            'test-bucket',
            'test-key',
            Buffer.from('test'),
          );
          expect(uploadResult).toBeDefined();
          expect(uploadResult.key).toBe('test-key');
          expect(uploadResult.bucket).toBe('test-bucket');
          expect(typeof uploadResult.url).toBe('string');
          expect(typeof uploadResult.size).toBe('number');

          // 测试downloadFile（需要先上传文件）
          await expect(
            storage.downloadFile('test-bucket', 'test-key'),
          ).resolves.toBeDefined();

          // 测试deleteFile
          await expect(
            storage.deleteFile('test-bucket', 'test-key'),
          ).resolves.not.toThrow();

          // 测试getFileUrl
          const url = await storage.getFileUrl('test-bucket', 'test-key');
          expect(typeof url).toBe('string');
          expect(url).toContain('test-bucket');
          expect(url).toContain('test-key');

          // 测试listFiles
          const files = await storage.listFiles('test-bucket');
          expect(Array.isArray(files)).toBe(true);
        });

        it('ai服务应该实现所有必需方法', async () => {
          const { ai } = adapter;

          // 测试callModel
          const modelResponse = await ai.callModel('qwen-max', 'test prompt');
          expect(modelResponse).toBeDefined();
          expect(modelResponse.text).toBeDefined();
          expect(typeof modelResponse.text).toBe('string');

          // 测试callLocalModel
          const localResponse = await ai.callLocalModel(
            'qwen-max',
            'test prompt',
          );
          expect(localResponse).toBeDefined();
          expect(localResponse.text).toBeDefined();

          // 测试listAvailableModels
          const models = await ai.listAvailableModels();
          expect(Array.isArray(models)).toBe(true);
          if (models.length > 0) {
            expect(models[0].id).toBeDefined();
            expect(models[0].name).toBeDefined();
            expect(models[0].provider).toBeDefined();
          }

          // 测试getServiceStatus
          const status = await ai.getServiceStatus();
          expect(status).toBeDefined();
          expect(status.available).toBeDefined();
          expect(typeof status.available).toBe('boolean');
        });

        it('database服务应该实现所有必需方法', async () => {
          const { database } = adapter;

          // 测试query
          const queryResult = await database.query<any>('SELECT * FROM test');
          expect(Array.isArray(queryResult)).toBe(true);

          // 测试execute
          const executeResult = await database.execute(
            'UPDATE test SET value = 1',
          );
          expect(typeof executeResult).toBe('number');

          // 测试beginTransaction
          const transaction = await database.beginTransaction();
          expect(transaction).toBeDefined();
          expect(typeof transaction.commit).toBe('function');
          expect(typeof transaction.rollback).toBe('function');

          // 测试getConnectionStats
          const stats = await database.getConnectionStats();
          expect(stats).toBeDefined();
          expect(typeof stats.total).toBe('number');
          expect(typeof stats.active).toBe('number');
          expect(typeof stats.idle).toBe('number');

          // 测试sharding服务
          expect(database.sharding).toBeDefined();
          const partition = await database.sharding.getTablePartition(
            'test-table',
            'tenant-1',
          );
          expect(typeof partition).toBe('string');
        });

        it('messaging服务应该实现所有必需方法', async () => {
          const { messaging } = adapter;

          // 测试sendMessage
          const messageId = await messaging.sendMessage('test-queue', {
            data: 'test',
          });
          expect(typeof messageId).toBe('string');

          // 测试receiveMessage
          const message = await messaging.receiveMessage('test-queue');
          // 可能为null或消息对象
          if (message !== null) {
            expect(message.id).toBeDefined();
            expect(message.body).toBeDefined();
          }

          // 测试acknowledgeMessage
          if (message !== null) {
            await expect(
              messaging.acknowledgeMessage('test-queue', message.id),
            ).resolves.not.toThrow();
          }

          // 测试publishEvent
          await expect(
            messaging.publishEvent('test-topic', { event: 'test' }),
          ).resolves.not.toThrow();

          // 测试subscribeEvent
          const handler = jest.fn();
          const subscription = await messaging.subscribeEvent(
            'test-topic',
            handler,
          );
          expect(subscription).toBeDefined();
          expect(typeof subscription.unsubscribe).toBe('function');
        });
      });
    });
  });

  // 测试配置验证
  describe('配置验证', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      CloudProviderFactory.destroyInstance();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('应该处理缺失的环境变量', async () => {
      // 清除所有相关环境变量
      delete process.env.CLOUD_PROVIDER;
      delete process.env.ALICLOUD_ACCESS_KEY_ID;
      delete process.env.ALICLOUD_ACCESS_KEY_SECRET;

      // 应该能创建适配器而不崩溃
      const provider = await CloudProviderFactory.getInstance();
      expect(provider).toBeDefined();

      // 应该能调用健康检查
      const health = await provider.healthCheck();
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
    });

    it('应该处理无效的provider类型', async () => {
      process.env.CLOUD_PROVIDER = 'invalid-provider';

      // 应该回退到mock适配器
      const provider = await CloudProviderFactory.getInstance();
      expect(provider.getName()).toBe('mock');
    });

    it('应该处理大小写不敏感的provider类型', async () => {
      // 测试大写
      process.env.CLOUD_PROVIDER = 'MOCK';
      CloudProviderFactory.destroyInstance();
      const mockProvider1 = await CloudProviderFactory.getInstance();
      expect(mockProvider1.getName()).toBe('mock');

      // 测试混合大小写
      process.env.CLOUD_PROVIDER = 'AliCloud';
      CloudProviderFactory.destroyInstance();
      const aliProvider = await CloudProviderFactory.getInstance();
      expect(aliProvider.getName()).toBe('alicloud');
    });
  });

  // 测试错误处理
  describe('错误处理', () => {
    adapters.forEach(({ name, constructor }) => {
      describe(`${name}`, () => {
        let adapter: CloudProvider;

        beforeEach(() => {
          adapter = new constructor();
        });

        it('应该处理storage服务的错误场景', async () => {
          const { storage } = adapter;

          // 下载不存在的文件应该抛出错误或返回null
          try {
            await storage.downloadFile('nonexistent-bucket', 'nonexistent-key');
            // 如果没抛出错误，应该返回一个Buffer（模拟实现）
          } catch (error) {
            // 允许抛出错误
            expect(error).toBeDefined();
          }
        });

        it('应该处理健康检查失败场景', async () => {
          const health = await adapter.healthCheck();
          // 健康检查应该总是返回有效状态，即使模拟失败
          expect(health.status).toBeDefined();
          expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
        });

        it('应该处理服务初始化失败', async () => {
          // 初始化应该不抛出错误（模拟实现）
          await expect(adapter.initialize()).resolves.not.toThrow();
        });
      });
    });
  });
});
