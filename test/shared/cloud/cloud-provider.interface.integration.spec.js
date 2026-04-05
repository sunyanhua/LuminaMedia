"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mock_adapter_1 = require("../../../src/shared/cloud/adapters/mock.adapter");
const alicloud_adapter_1 = require("../../../src/shared/cloud/adapters/alicloud.adapter");
const private_deploy_adapter_1 = require("../../../src/shared/cloud/adapters/private-deploy.adapter");
const cloud_provider_factory_1 = require("../../../src/shared/cloud/cloud-provider.factory");
describe('CloudProvider Interface Integration', () => {
    const adapters = [
        { name: 'MockAdapter', constructor: mock_adapter_1.MockAdapter },
        { name: 'AliCloudAdapter', constructor: alicloud_adapter_1.AliCloudAdapter },
        { name: 'PrivateDeployAdapter', constructor: private_deploy_adapter_1.PrivateDeployAdapter },
    ];
    describe('适配器接口一致性', () => {
        adapters.forEach(({ name, constructor }) => {
            describe(`${name}`, () => {
                let adapter;
                beforeEach(() => {
                    adapter = new constructor();
                });
                afterEach(async () => {
                    if (adapter.cleanup) {
                        await adapter.cleanup().catch(() => { });
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
    describe('工厂切换逻辑', () => {
        const originalEnv = process.env;
        beforeEach(() => {
            cloud_provider_factory_1.CloudProviderFactory.destroyInstance();
            process.env = { ...originalEnv };
        });
        afterAll(() => {
            process.env = originalEnv;
        });
        it('应该能切换不同适配器', async () => {
            process.env.CLOUD_PROVIDER = 'mock';
            cloud_provider_factory_1.CloudProviderFactory.destroyInstance();
            const mockProvider = await cloud_provider_factory_1.CloudProviderFactory.getInstance();
            expect(mockProvider.getName()).toBe('mock');
            process.env.CLOUD_PROVIDER = 'alicloud';
            cloud_provider_factory_1.CloudProviderFactory.destroyInstance();
            const aliProvider = await cloud_provider_factory_1.CloudProviderFactory.getInstance();
            expect(aliProvider.getName()).toBe('alicloud');
            process.env.CLOUD_PROVIDER = 'private';
            cloud_provider_factory_1.CloudProviderFactory.destroyInstance();
            const privateProvider = await cloud_provider_factory_1.CloudProviderFactory.getInstance();
            expect(privateProvider.getName()).toBe('private');
        });
        it('应该保持适配器接口一致性', async () => {
            const providers = ['mock', 'alicloud', 'private'];
            for (const providerType of providers) {
                process.env.CLOUD_PROVIDER = providerType;
                cloud_provider_factory_1.CloudProviderFactory.destroyInstance();
                const provider = await cloud_provider_factory_1.CloudProviderFactory.getInstance();
                expect(typeof provider.getName).toBe('function');
                expect(typeof provider.initialize).toBe('function');
                expect(typeof provider.healthCheck).toBe('function');
                expect(typeof provider.cleanup).toBe('function');
                expect(provider.storage).toBeDefined();
                expect(provider.ai).toBeDefined();
                expect(provider.database).toBeDefined();
                expect(provider.messaging).toBeDefined();
                await expect(provider.initialize()).resolves.not.toThrow();
                await expect(provider.healthCheck()).resolves.toBeDefined();
            }
        });
    });
    describe('服务依赖注入', () => {
        adapters.forEach(({ name, constructor }) => {
            describe(`${name}`, () => {
                let adapter;
                beforeEach(() => {
                    adapter = new constructor();
                });
                it('storage服务应该实现所有必需方法', async () => {
                    const { storage } = adapter;
                    const uploadResult = await storage.uploadFile('test-bucket', 'test-key', Buffer.from('test'));
                    expect(uploadResult).toBeDefined();
                    expect(uploadResult.key).toBe('test-key');
                    expect(uploadResult.bucket).toBe('test-bucket');
                    expect(typeof uploadResult.url).toBe('string');
                    expect(typeof uploadResult.size).toBe('number');
                    await expect(storage.downloadFile('test-bucket', 'test-key')).resolves.toBeDefined();
                    await expect(storage.deleteFile('test-bucket', 'test-key')).resolves.not.toThrow();
                    const url = await storage.getFileUrl('test-bucket', 'test-key');
                    expect(typeof url).toBe('string');
                    expect(url).toContain('test-bucket');
                    expect(url).toContain('test-key');
                    const files = await storage.listFiles('test-bucket');
                    expect(Array.isArray(files)).toBe(true);
                });
                it('ai服务应该实现所有必需方法', async () => {
                    const { ai } = adapter;
                    const modelResponse = await ai.callModel('qwen-max', 'test prompt');
                    expect(modelResponse).toBeDefined();
                    expect(modelResponse.text).toBeDefined();
                    expect(typeof modelResponse.text).toBe('string');
                    const localResponse = await ai.callLocalModel('qwen-max', 'test prompt');
                    expect(localResponse).toBeDefined();
                    expect(localResponse.text).toBeDefined();
                    const models = await ai.listAvailableModels();
                    expect(Array.isArray(models)).toBe(true);
                    if (models.length > 0) {
                        expect(models[0].id).toBeDefined();
                        expect(models[0].name).toBeDefined();
                        expect(models[0].provider).toBeDefined();
                    }
                    const status = await ai.getServiceStatus();
                    expect(status).toBeDefined();
                    expect(status.available).toBeDefined();
                    expect(typeof status.available).toBe('boolean');
                });
                it('database服务应该实现所有必需方法', async () => {
                    const { database } = adapter;
                    const queryResult = await database.query('SELECT * FROM test');
                    expect(Array.isArray(queryResult)).toBe(true);
                    const executeResult = await database.execute('UPDATE test SET value = 1');
                    expect(typeof executeResult).toBe('number');
                    const transaction = await database.beginTransaction();
                    expect(transaction).toBeDefined();
                    expect(typeof transaction.commit).toBe('function');
                    expect(typeof transaction.rollback).toBe('function');
                    const stats = await database.getConnectionStats();
                    expect(stats).toBeDefined();
                    expect(typeof stats.total).toBe('number');
                    expect(typeof stats.active).toBe('number');
                    expect(typeof stats.idle).toBe('number');
                    expect(database.sharding).toBeDefined();
                    const partition = await database.sharding.getTablePartition('test-table', 'tenant-1');
                    expect(typeof partition).toBe('string');
                });
                it('messaging服务应该实现所有必需方法', async () => {
                    const { messaging } = adapter;
                    const messageId = await messaging.sendMessage('test-queue', {
                        data: 'test',
                    });
                    expect(typeof messageId).toBe('string');
                    const message = await messaging.receiveMessage('test-queue');
                    if (message !== null) {
                        expect(message.id).toBeDefined();
                        expect(message.body).toBeDefined();
                    }
                    if (message !== null) {
                        await expect(messaging.acknowledgeMessage('test-queue', message.id)).resolves.not.toThrow();
                    }
                    await expect(messaging.publishEvent('test-topic', { event: 'test' })).resolves.not.toThrow();
                    const handler = jest.fn();
                    const subscription = await messaging.subscribeEvent('test-topic', handler);
                    expect(subscription).toBeDefined();
                    expect(typeof subscription.unsubscribe).toBe('function');
                });
            });
        });
    });
    describe('配置验证', () => {
        const originalEnv = process.env;
        beforeEach(() => {
            cloud_provider_factory_1.CloudProviderFactory.destroyInstance();
            process.env = { ...originalEnv };
        });
        afterAll(() => {
            process.env = originalEnv;
        });
        it('应该处理缺失的环境变量', async () => {
            delete process.env.CLOUD_PROVIDER;
            delete process.env.ALICLOUD_ACCESS_KEY_ID;
            delete process.env.ALICLOUD_ACCESS_KEY_SECRET;
            const provider = await cloud_provider_factory_1.CloudProviderFactory.getInstance();
            expect(provider).toBeDefined();
            const health = await provider.healthCheck();
            expect(health).toBeDefined();
            expect(health.status).toBeDefined();
        });
        it('应该处理无效的provider类型', async () => {
            process.env.CLOUD_PROVIDER = 'invalid-provider';
            const provider = await cloud_provider_factory_1.CloudProviderFactory.getInstance();
            expect(provider.getName()).toBe('mock');
        });
        it('应该处理大小写不敏感的provider类型', async () => {
            process.env.CLOUD_PROVIDER = 'MOCK';
            cloud_provider_factory_1.CloudProviderFactory.destroyInstance();
            const mockProvider1 = await cloud_provider_factory_1.CloudProviderFactory.getInstance();
            expect(mockProvider1.getName()).toBe('mock');
            process.env.CLOUD_PROVIDER = 'AliCloud';
            cloud_provider_factory_1.CloudProviderFactory.destroyInstance();
            const aliProvider = await cloud_provider_factory_1.CloudProviderFactory.getInstance();
            expect(aliProvider.getName()).toBe('alicloud');
        });
    });
    describe('错误处理', () => {
        adapters.forEach(({ name, constructor }) => {
            describe(`${name}`, () => {
                let adapter;
                beforeEach(() => {
                    adapter = new constructor();
                });
                it('应该处理storage服务的错误场景', async () => {
                    const { storage } = adapter;
                    try {
                        await storage.downloadFile('nonexistent-bucket', 'nonexistent-key');
                    }
                    catch (error) {
                        expect(error).toBeDefined();
                    }
                });
                it('应该处理健康检查失败场景', async () => {
                    const health = await adapter.healthCheck();
                    expect(health.status).toBeDefined();
                    expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
                });
                it('应该处理服务初始化失败', async () => {
                    await expect(adapter.initialize()).resolves.not.toThrow();
                });
            });
        });
    });
});
//# sourceMappingURL=cloud-provider.interface.integration.spec.js.map