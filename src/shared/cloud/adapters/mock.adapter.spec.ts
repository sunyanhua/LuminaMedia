import { MockAdapter } from './mock.adapter';
import {
  StorageOptions,
  AIModelOptions,
  LocalModelOptions,
  ReceiveOptions,
  MessageOptions,
} from '../cloud-provider.interface';

describe('MockAdapter', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  describe('基础功能', () => {
    it('应该正确返回名称', () => {
      expect(adapter.getName()).toBe('mock');
    });

    it('应该成功初始化', async () => {
      // 初始化应该不抛出错误
      await expect(adapter.initialize()).resolves.not.toThrow();
    });

    it('应该返回健康状态', async () => {
      const health = await adapter.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.details).toBeDefined();
      expect(health.details?.provider).toBe('mock');
      expect(health.details?.message).toContain('模拟模式');
    });

    it('应该成功清理', async () => {
      await expect(adapter.cleanup()).resolves.not.toThrow();
    });
  });

  describe('MockStorageService', () => {
    const bucket = 'test-bucket';
    const key = 'test-file.txt';
    const fileContent = Buffer.from('Hello, World!');
    const storageOptions: StorageOptions = {
      contentType: 'text/plain',
      metadata: { author: 'test' },
    };

    beforeEach(() => {
      // 重置storage服务实例
      (adapter.storage as any).files.clear();
    });

    describe('uploadFile', () => {
      it('应该成功上传文件', async () => {
        const result = await adapter.storage.uploadFile(
          bucket,
          key,
          fileContent,
          storageOptions,
        );

        expect(result.key).toBe(key);
        expect(result.bucket).toBe(bucket);
        expect(result.url).toContain(bucket);
        expect(result.url).toContain(key);
        expect(result.size).toBe(fileContent.length);
        expect(result.etag).toContain('mock-etag');
      });

      it('应该在没有options时成功上传文件', async () => {
        const result = await adapter.storage.uploadFile(
          bucket,
          key,
          fileContent,
        );

        expect(result.key).toBe(key);
        expect(result.bucket).toBe(bucket);
      });

      it('应该存储文件内容供后续下载', async () => {
        await adapter.storage.uploadFile(bucket, key, fileContent);
        const downloaded = await adapter.storage.downloadFile(bucket, key);

        expect(downloaded).toEqual(fileContent);
      });
    });

    describe('downloadFile', () => {
      it('应该下载已上传的文件', async () => {
        await adapter.storage.uploadFile(bucket, key, fileContent);
        const downloaded = await adapter.storage.downloadFile(bucket, key);

        expect(downloaded).toEqual(fileContent);
      });

      it('应该对不存在的文件抛出错误', async () => {
        await expect(
          adapter.storage.downloadFile(bucket, 'nonexistent.txt'),
        ).rejects.toThrow(/文件不存在/);
      });
    });

    describe('deleteFile', () => {
      it('应该成功删除文件', async () => {
        await adapter.storage.uploadFile(bucket, key, fileContent);
        await expect(
          adapter.storage.deleteFile(bucket, key),
        ).resolves.not.toThrow();

        // 文件应该被删除
        await expect(adapter.storage.downloadFile(bucket, key)).rejects.toThrow(
          /文件不存在/,
        );
      });

      it('应该安全地删除不存在的文件', async () => {
        await expect(
          adapter.storage.deleteFile(bucket, 'nonexistent.txt'),
        ).resolves.not.toThrow();
      });
    });

    describe('getFileUrl', () => {
      it('应该返回包含bucket和key的URL', async () => {
        const url = await adapter.storage.getFileUrl(bucket, key);

        expect(url).toContain(bucket);
        expect(url).toContain(key);
        expect(url).toContain('mock-storage.example.com');
      });

      it('应该支持过期时间参数', async () => {
        const expiresIn = 7200;
        const url = await adapter.storage.getFileUrl(bucket, key, expiresIn);

        expect(url).toContain(`expires=${expiresIn}`);
      });

      it('应该使用默认过期时间', async () => {
        const url = await adapter.storage.getFileUrl(bucket, key);

        expect(url).toContain('expires=3600');
      });
    });

    describe('listFiles', () => {
      beforeEach(async () => {
        // 上传一些测试文件
        await adapter.storage.uploadFile(
          bucket,
          'file1.txt',
          Buffer.from('content1'),
        );
        await adapter.storage.uploadFile(
          bucket,
          'folder/file2.txt',
          Buffer.from('content2'),
        );
        await adapter.storage.uploadFile(
          'other-bucket',
          'file3.txt',
          Buffer.from('content3'),
        );
      });

      it('应该列出指定bucket中的所有文件', async () => {
        const files = await adapter.storage.listFiles(bucket);

        expect(files).toHaveLength(2);
        expect(files.map((f) => f.key)).toEqual(
          expect.arrayContaining(['file1.txt', 'folder/file2.txt']),
        );
      });

      it('应该支持前缀过滤', async () => {
        const files = await adapter.storage.listFiles(bucket, 'folder/');

        expect(files).toHaveLength(1);
        expect(files[0].key).toBe('folder/file2.txt');
      });

      it('应该返回空数组当没有匹配文件时', async () => {
        const files = await adapter.storage.listFiles('empty-bucket');

        expect(files).toEqual([]);
      });

      it('应该返回正确的文件信息', async () => {
        const files = await adapter.storage.listFiles(bucket);

        if (files.length > 0) {
          const file = files[0];
          expect(file.key).toBeDefined();
          expect(file.size).toBeGreaterThan(0);
          expect(file.lastModified).toBeInstanceOf(Date);
          expect(file.etag).toContain('mock-etag');
        }
      });
    });
  });

  describe('MockAIService', () => {
    const prompt = '写一篇关于人工智能的文章';
    const model = 'gemini-2.0-pro';
    const aiOptions: AIModelOptions = {
      temperature: 0.7,
      maxTokens: 1000,
    };
    const localOptions: LocalModelOptions = {
      ...aiOptions,
      gpu: true,
      memoryLimit: '8GB',
    };

    describe('callModel', () => {
      it('应该成功调用云端模型并返回响应', async () => {
        const response = await adapter.ai.callModel(model, prompt, aiOptions);

        expect(response.text).toBeDefined();
        expect(response.text).toContain(model);
        expect(response.text).toContain(prompt.substring(0, 100));
        expect(response.usage).toBeDefined();
        expect(response.usage?.promptTokens).toBeGreaterThan(0);
        expect(response.usage?.completionTokens).toBeGreaterThan(0);
        expect(response.usage?.totalTokens).toBeGreaterThan(0);
        expect(response.finishReason).toBe('stop');
      });

      it('应该在没有options时成功调用', async () => {
        const response = await adapter.ai.callModel(model, prompt);

        expect(response.text).toBeDefined();
        expect(response.finishReason).toBe('stop');
      });

      it('应该模拟延迟', async () => {
        const startTime = Date.now();
        await adapter.ai.callModel(model, prompt);
        const elapsed = Date.now() - startTime;

        // 应该有大约100ms的延迟
        expect(elapsed).toBeGreaterThanOrEqual(90);
      });
    });

    describe('callLocalModel', () => {
      it('应该成功调用本地模型并返回响应', async () => {
        const localModel = 'qwen-7b-local';
        const response = await adapter.ai.callLocalModel(
          localModel,
          prompt,
          localOptions,
        );

        expect(response.text).toBeDefined();
        expect(response.text).toContain('本地');
        expect(response.text).toContain(localModel);
        expect(response.usage).toBeDefined();
        expect(response.finishReason).toBe('stop');
      });

      it('应该支持GPU选项', async () => {
        const response = await adapter.ai.callLocalModel(
          'qwen-7b-local',
          prompt,
          { gpu: true },
        );

        expect(response.text).toBeDefined();
      });

      it('应该模拟更长的延迟', async () => {
        const startTime = Date.now();
        await adapter.ai.callLocalModel('qwen-7b-local', prompt);
        const elapsed = Date.now() - startTime;

        // 应该有大约500ms的延迟
        expect(elapsed).toBeGreaterThanOrEqual(450);
      });
    });

    describe('listAvailableModels', () => {
      it('应该返回模型列表', async () => {
        const models = await adapter.ai.listAvailableModels();

        expect(models).toHaveLength(3);

        const geminiModel = models.find((m) => m.provider === 'gemini');
        expect(geminiModel).toBeDefined();
        expect(geminiModel?.id).toBe('gemini-2.0-pro');
        expect(geminiModel?.name).toBe('Gemini 2.0 Pro');
        expect(geminiModel?.capabilities).toEqual(
          expect.arrayContaining([
            'text-generation',
            'code-generation',
            'translation',
          ]),
        );
        expect(geminiModel?.maxTokens).toBe(32768);

        const qwenModel = models.find((m) => m.provider === 'qwen');
        expect(qwenModel).toBeDefined();
        expect(qwenModel?.id).toBe('qwen-max');

        const localModel = models.find((m) => m.provider === 'local');
        expect(localModel).toBeDefined();
        expect(localModel?.id).toBe('qwen-7b-local');
      });
    });

    describe('getServiceStatus', () => {
      it('应该返回服务状态', async () => {
        const status = await adapter.ai.getServiceStatus();

        expect(status.available).toBe(true);
        expect(status.models).toHaveLength(3);
        expect(status.latency).toBe(50);
      });
    });
  });

  describe('MockDatabaseService', () => {
    const sql = 'SELECT * FROM users';
    const params = ['tenant-id'];
    const updateSql = 'UPDATE users SET name = ? WHERE id = ?';
    const updateParams = ['新名字', 'user-id'];

    describe('query', () => {
      it('应该执行查询并返回空数组', async () => {
        const result = await adapter.database.query<any>(sql, params);

        expect(result).toEqual([]);
      });

      it('应该模拟延迟', async () => {
        const startTime = Date.now();
        await adapter.database.query(sql, params);
        const elapsed = Date.now() - startTime;

        expect(elapsed).toBeGreaterThanOrEqual(40);
      });
    });

    describe('execute', () => {
      it('应该执行更新并返回受影响行数', async () => {
        const result = await adapter.database.execute(updateSql, updateParams);

        // 对于INSERT语句返回1，其他返回0
        expect(result).toBe(0);
      });

      it('应该对INSERT语句返回1', async () => {
        const result = await adapter.database.execute(
          'INSERT INTO users VALUES (?)',
          ['new-user'],
        );

        expect(result).toBe(1);
      });

      it('应该模拟延迟', async () => {
        const startTime = Date.now();
        await adapter.database.execute(updateSql, updateParams);
        const elapsed = Date.now() - startTime;

        expect(elapsed).toBeGreaterThanOrEqual(20);
      });
    });

    describe('beginTransaction', () => {
      it('应该返回事务对象', async () => {
        const transaction = await adapter.database.beginTransaction();

        expect(transaction).toBeDefined();
        expect(typeof transaction.commit).toBe('function');
        expect(typeof transaction.rollback).toBe('function');
      });

      it('应该支持提交事务', async () => {
        const transaction = await adapter.database.beginTransaction();
        await expect(transaction.commit()).resolves.not.toThrow();
      });

      it('应该支持回滚事务', async () => {
        const transaction = await adapter.database.beginTransaction();
        await expect(transaction.rollback()).resolves.not.toThrow();
      });
    });

    describe('getConnectionStats', () => {
      it('应该返回连接统计信息', async () => {
        const stats = await adapter.database.getConnectionStats();

        expect(stats.total).toBe(10);
        expect(stats.active).toBe(2);
        expect(stats.idle).toBe(8);
        expect(stats.waiting).toBe(0);
      });
    });

    describe('sharding', () => {
      describe('getTablePartition', () => {
        it('应该根据tenantId计算分区', async () => {
          const table = 'customer_profiles';
          const tenantId = 'tenant-123';

          const partition = await adapter.database.sharding.getTablePartition(
            table,
            tenantId,
          );

          expect(partition).toContain(table);
          expect(partition).toContain('partition_');
          // 分区号应该在0-15之间
          const partitionNum = parseInt(partition.match(/\d+/)?.[0] || '');
          expect(partitionNum).toBeGreaterThanOrEqual(0);
          expect(partitionNum).toBeLessThan(16);
        });

        it('应该对相同tenantId返回相同分区', async () => {
          const table = 'customer_profiles';
          const tenantId = 'tenant-456';

          const partition1 = await adapter.database.sharding.getTablePartition(
            table,
            tenantId,
          );
          const partition2 = await adapter.database.sharding.getTablePartition(
            table,
            tenantId,
          );

          expect(partition1).toBe(partition2);
        });

        it('应该对不同tenantId可能返回不同分区', async () => {
          const table = 'customer_profiles';

          const partition1 = await adapter.database.sharding.getTablePartition(
            table,
            'tenant-a',
          );
          const partition2 = await adapter.database.sharding.getTablePartition(
            table,
            'tenant-b',
          );

          // 可能相同也可能不同，但都是有效分区
          expect(partition1).toContain('partition_');
          expect(partition2).toContain('partition_');
        });
      });

      describe('migrateData', () => {
        it('应该模拟数据迁移', async () => {
          const sourceTable = 'old_table';
          const targetTable = 'new_table';

          const result = await adapter.database.sharding.migrateData(
            sourceTable,
            targetTable,
          );

          expect(result.migratedRows).toBeGreaterThanOrEqual(100);
          expect(result.migratedRows).toBeLessThanOrEqual(1099); // 100 + 999
          expect(result.duration).toBe(1000);
          expect(result.errors).toEqual([]);
        });

        it('应该模拟延迟', async () => {
          const startTime = Date.now();
          await adapter.database.sharding.migrateData('source', 'target');
          const elapsed = Date.now() - startTime;

          expect(elapsed).toBeGreaterThanOrEqual(950);
        });
      });

      describe('analyzePartitionBalance', () => {
        it('应该返回分区平衡报告', async () => {
          const report =
            await adapter.database.sharding.analyzePartitionBalance();

          expect(report.table).toBe('customer_profiles');
          expect(report.partitions).toHaveLength(16);
          expect(report.imbalanceScore).toBe(0.15);
          expect(report.recommendations).toHaveLength(2);
          expect(report.recommendations[0]).toContain('均衡');
        });

        it('每个分区应有有效数据', async () => {
          const report =
            await adapter.database.sharding.analyzePartitionBalance();

          for (const partition of report.partitions) {
            expect(partition.name).toContain('partition_');
            expect(partition.rowCount).toBeGreaterThan(0);
            expect(partition.dataSize).toBeGreaterThan(0);
            expect(partition.tenantIds).toHaveLength(2);
          }
        });
      });
    });
  });

  describe('MockMessagingService', () => {
    const queue = 'test-queue';
    const topic = 'test-topic';
    const message = { data: 'test message' };
    const messageOptions: MessageOptions = {
      delaySeconds: 0.001, // 使用很小的延迟避免测试超时
      messageAttributes: { priority: 'high' },
    };
    const receiveOptions: ReceiveOptions = {
      maxNumberOfMessages: 5,
      waitTimeSeconds: 10,
    };

    beforeEach(() => {
      // 重置内部状态
      (adapter.messaging as any).queues.clear();
      (adapter.messaging as any).subscriptions.clear();
    });

    describe('sendMessage', () => {
      it('应该成功发送消息并返回消息ID', async () => {
        const messageId = await adapter.messaging.sendMessage(queue, message);

        expect(messageId).toBeDefined();
        expect(messageId).toContain('msg_');
      });

      it('应该支持消息选项', async () => {
        const messageId = await adapter.messaging.sendMessage(
          queue,
          message,
          messageOptions,
        );

        expect(messageId).toBeDefined();
      });

      it('应该创建队列如果不存在', async () => {
        await adapter.messaging.sendMessage('new-queue', message);

        const queues = (adapter.messaging as any).queues;
        expect(queues.has('new-queue')).toBe(true);
      });
    });

    describe('receiveMessage', () => {
      it('应该从队列接收消息', async () => {
        const messageId = await adapter.messaging.sendMessage(queue, message);
        const received = await adapter.messaging.receiveMessage(queue);

        expect(received).not.toBeNull();
        expect(received?.id).toBe(messageId);
        expect(received?.body).toEqual(message);
        expect(received?.timestamp).toBeInstanceOf(Date);
      });

      it('应该支持接收选项', async () => {
        await adapter.messaging.sendMessage(queue, message);
        const received = await adapter.messaging.receiveMessage(
          queue,
          receiveOptions,
        );

        expect(received).not.toBeNull();
      });

      it('应该返回null当队列为空时', async () => {
        const received = await adapter.messaging.receiveMessage('empty-queue');

        expect(received).toBeNull();
      });

      it('应该从队列中移除已接收的消息', async () => {
        await adapter.messaging.sendMessage(queue, message);
        await adapter.messaging.receiveMessage(queue);

        // 第二次接收应该返回null
        const secondReceive = await adapter.messaging.receiveMessage(queue);
        expect(secondReceive).toBeNull();
      });
    });

    describe('acknowledgeMessage', () => {
      it('应该成功确认消息', async () => {
        const messageId = await adapter.messaging.sendMessage(queue, message);

        await expect(
          adapter.messaging.acknowledgeMessage(queue, messageId),
        ).resolves.not.toThrow();
      });

      it('应该安全地确认不存在的消息', async () => {
        await expect(
          adapter.messaging.acknowledgeMessage(queue, 'nonexistent-id'),
        ).resolves.not.toThrow();
      });
    });

    describe('publishEvent', () => {
      it('应该发布事件到主题', async () => {
        const event = { type: 'user.created', userId: '123' };

        await expect(
          adapter.messaging.publishEvent(topic, event),
        ).resolves.not.toThrow();
      });

      it('应该触发已注册的处理程序', async () => {
        const handler = jest.fn().mockResolvedValue(undefined);
        const event = { type: 'test' };

        await adapter.messaging.subscribeEvent(topic, handler);
        await adapter.messaging.publishEvent(topic, event);

        // 处理程序应该被异步调用
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(handler).toHaveBeenCalledWith(event);
      });

      it('应该支持多个处理程序', async () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        const event = { type: 'test' };

        await adapter.messaging.subscribeEvent(topic, handler1);
        await adapter.messaging.subscribeEvent(topic, handler2);
        await adapter.messaging.publishEvent(topic, event);

        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(handler1).toHaveBeenCalledWith(event);
        expect(handler2).toHaveBeenCalledWith(event);
      });
    });

    describe('subscribeEvent', () => {
      it('应该订阅主题并返回subscription对象', async () => {
        const handler = jest.fn();
        const subscription = await adapter.messaging.subscribeEvent(
          topic,
          handler,
        );

        expect(subscription).toBeDefined();
        expect(typeof subscription.unsubscribe).toBe('function');
      });

      it('应该支持取消订阅', async () => {
        const handler = jest.fn();
        const subscription = await adapter.messaging.subscribeEvent(
          topic,
          handler,
        );

        await expect(subscription.unsubscribe()).resolves.not.toThrow();

        // 取消订阅后，处理程序不应被调用
        await adapter.messaging.publishEvent(topic, {});
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(handler).not.toHaveBeenCalled();
      });

      it('应该允许多次订阅同一主题', async () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();

        await adapter.messaging.subscribeEvent(topic, handler1);
        await adapter.messaging.subscribeEvent(topic, handler2);

        const subscriptions = (adapter.messaging as any).subscriptions.get(
          topic,
        );
        expect(subscriptions).toHaveLength(2);
      });
    });
  });
});
