import {
  CloudProvider,
  StorageService,
  AIService,
  DatabaseService,
  MessagingService,
  StorageOptions,
  StorageResult,
  FileInfo,
  AIModelOptions,
  LocalModelOptions,
  AIResponse,
  ModelInfo,
  AIServiceStatus,
  Transaction,
  ConnectionStats,
  ShardingService,
  MessageOptions,
  ReceiveOptions,
  Message,
  EventHandler,
  Subscription,
  MigrationResult,
  PartitionBalanceReport,
  PartitionInfo
} from '../cloud-provider.interface';

/**
 * Mock适配器 - 用于演示和测试环境
 */
export class MockAdapter implements CloudProvider {
  storage: StorageService = new MockStorageService();
  ai: AIService = new MockAIService();
  database: DatabaseService = new MockDatabaseService();
  messaging: MessagingService = new MockMessagingService();

  getName(): string {
    return 'mock';
  }

  async initialize(): Promise<void> {
    console.log('[MockAdapter] 初始化模拟云服务提供者');
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details?: Record<string, any>; }> {
    return {
      status: 'healthy',
      details: {
        provider: 'mock',
        message: '所有服务运行正常（模拟模式）',
        timestamp: new Date().toISOString()
      }
    };
  }

  async cleanup(): Promise<void> {
    console.log('[MockAdapter] 清理模拟云服务提供者');
  }
}

/**
 * Mock存储服务
 */
class MockStorageService implements StorageService {
  private files = new Map<string, { bucket: string; key: string; content: Buffer; metadata: Record<string, string> }>();

  async uploadFile(bucket: string, key: string, file: Buffer, options?: StorageOptions): Promise<StorageResult> {
    const fileKey = `${bucket}/${key}`;
    this.files.set(fileKey, {
      bucket,
      key,
      content: file,
      metadata: options?.metadata || {}
    });

    console.log(`[MockStorageService] 上传文件: ${fileKey}, 大小: ${file.length} bytes`);

    return {
      key,
      bucket,
      url: `https://mock-storage.example.com/${bucket}/${key}`,
      size: file.length,
      etag: `mock-etag-${Date.now()}`
    };
  }

  async downloadFile(bucket: string, key: string): Promise<Buffer> {
    const fileKey = `${bucket}/${key}`;
    const file = this.files.get(fileKey);

    if (!file) {
      throw new Error(`文件不存在: ${fileKey}`);
    }

    console.log(`[MockStorageService] 下载文件: ${fileKey}, 大小: ${file.content.length} bytes`);
    return file.content;
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    const fileKey = `${bucket}/${key}`;
    this.files.delete(fileKey);
    console.log(`[MockStorageService] 删除文件: ${fileKey}`);
  }

  async getFileUrl(bucket: string, key: string, expiresIn?: number): Promise<string> {
    return `https://mock-storage.example.com/${bucket}/${key}?expires=${expiresIn || 3600}`;
  }

  async listFiles(bucket: string, prefix?: string): Promise<FileInfo[]> {
    const files: FileInfo[] = [];

    for (const [fileKey, file] of this.files.entries()) {
      if (fileKey.startsWith(`${bucket}/`) && (!prefix || fileKey.includes(prefix))) {
        files.push({
          key: file.key,
          size: file.content.length,
          lastModified: new Date(),
          etag: `mock-etag-${fileKey}`
        });
      }
    }

    console.log(`[MockStorageService] 列出文件: bucket=${bucket}, prefix=${prefix}, 数量=${files.length}`);
    return files;
  }
}

/**
 * Mock AI服务
 */
class MockAIService implements AIService {
  private mockResponses = [
    "这是一个模拟的AI响应。",
    "根据您的请求，AI建议采取以下措施...",
    "分析完成，推荐方案已生成。",
    "模拟AI模型处理成功。",
    "这里是AI生成的创意内容。"
  ];

  async callModel(model: string, prompt: string, options?: AIModelOptions): Promise<AIResponse> {
    console.log(`[MockAIService] 调用云端模型: ${model}, prompt长度: ${prompt.length}`);

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    const randomResponse = this.mockResponses[Math.floor(Math.random() * this.mockResponses.length)];

    return {
      text: `[${model}] ${randomResponse}\n\n原始提示: ${prompt.substring(0, 100)}...`,
      usage: {
        promptTokens: Math.floor(prompt.length / 4),
        completionTokens: Math.floor(randomResponse.length / 4),
        totalTokens: Math.floor((prompt.length + randomResponse.length) / 4)
      },
      finishReason: 'stop'
    };
  }

  async callLocalModel(model: string, prompt: string, options?: LocalModelOptions): Promise<AIResponse> {
    console.log(`[MockAIService] 调用本地模型: ${model}, GPU=${options?.gpu || false}`);

    // 模拟更长的延迟（本地模型）
    await new Promise(resolve => setTimeout(resolve, 500));

    const randomResponse = this.mockResponses[Math.floor(Math.random() * this.mockResponses.length)];

    return {
      text: `[本地${model}] ${randomResponse}\n\n原始提示: ${prompt.substring(0, 100)}...`,
      usage: {
        promptTokens: Math.floor(prompt.length / 4),
        completionTokens: Math.floor(randomResponse.length / 4),
        totalTokens: Math.floor((prompt.length + randomResponse.length) / 4)
      },
      finishReason: 'stop'
    };
  }

  async listAvailableModels(): Promise<ModelInfo[]> {
    return [
      {
        id: 'gemini-2.0-pro',
        name: 'Gemini 2.0 Pro',
        provider: 'gemini',
        capabilities: ['text-generation', 'code-generation', 'translation'],
        maxTokens: 32768
      },
      {
        id: 'qwen-max',
        name: 'Qwen Max',
        provider: 'qwen',
        capabilities: ['text-generation', 'creative-writing', 'analysis'],
        maxTokens: 8192
      },
      {
        id: 'qwen-7b-local',
        name: 'Qwen 7B (本地)',
        provider: 'local',
        capabilities: ['text-generation', 'summarization'],
        maxTokens: 4096
      }
    ];
  }

  async getServiceStatus(): Promise<AIServiceStatus> {
    return {
      available: true,
      models: await this.listAvailableModels(),
      latency: 50
    };
  }
}

/**
 * Mock数据库服务
 */
class MockDatabaseService implements DatabaseService {
  sharding: ShardingService = new MockShardingService();

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    console.log(`[MockDatabaseService] 执行查询: ${sql}, 参数: ${JSON.stringify(params || [])}`);

    // 模拟查询延迟
    await new Promise(resolve => setTimeout(resolve, 50));

    // 返回空结果集（模拟）
    return [] as T[];
  }

  async execute(sql: string, params?: any[]): Promise<number> {
    console.log(`[MockDatabaseService] 执行更新: ${sql}, 参数: ${JSON.stringify(params || [])}`);

    // 模拟执行延迟
    await new Promise(resolve => setTimeout(resolve, 30));

    // 返回受影响的行数（模拟）
    return sql.toLowerCase().includes('insert') ? 1 : 0;
  }

  async beginTransaction(): Promise<Transaction> {
    console.log('[MockDatabaseService] 开始事务');

    return {
      commit: async () => {
        console.log('[MockDatabaseService] 提交事务');
        await new Promise(resolve => setTimeout(resolve, 20));
      },
      rollback: async () => {
        console.log('[MockDatabaseService] 回滚事务');
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    };
  }

  async getConnectionStats(): Promise<ConnectionStats> {
    return {
      total: 10,
      active: 2,
      idle: 8,
      waiting: 0
    };
  }
}

/**
 * Mock分表服务
 */
class MockShardingService implements ShardingService {
  async getTablePartition(table: string, tenantId: string): Promise<string> {
    // 简单哈希算法模拟分表
    const hash = this.hashString(tenantId);
    const partition = hash % 16;
    return `${table}_partition_${partition}`;
  }

  async migrateData(sourceTable: string, targetTable: string): Promise<MigrationResult> {
    console.log(`[MockShardingService] 迁移数据: ${sourceTable} -> ${targetTable}`);

    // 模拟迁移延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      migratedRows: Math.floor(Math.random() * 1000) + 100,
      duration: 1000,
      errors: []
    };
  }

  async analyzePartitionBalance(): Promise<PartitionBalanceReport> {
    const partitions: PartitionInfo[] = [];

    for (let i = 0; i < 16; i++) {
      partitions.push({
        name: `partition_${i}`,
        rowCount: Math.floor(Math.random() * 10000) + 1000,
        dataSize: Math.floor(Math.random() * 100000000) + 1000000,
        tenantIds: [`tenant_${i}_1`, `tenant_${i}_2`]
      });
    }

    return {
      table: 'customer_profiles',
      partitions,
      imbalanceScore: 0.15,
      recommendations: [
        '分区分布较为均衡，无需立即调整',
        '建议监控 partition_7 的增长情况'
      ]
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // 转换为32位整数
    }
    return Math.abs(hash);
  }
}

/**
 * Mock消息服务
 */
class MockMessagingService implements MessagingService {
  private queues = new Map<string, Message[]>();
  private subscriptions = new Map<string, EventHandler[]>();

  async sendMessage(queue: string, message: any, options?: MessageOptions): Promise<string> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!this.queues.has(queue)) {
      this.queues.set(queue, []);
    }

    const msg: Message = {
      id: messageId,
      body: message,
      attributes: options?.messageAttributes,
      timestamp: new Date()
    };

    this.queues.get(queue)!.push(msg);
    console.log(`[MockMessagingService] 发送消息到队列 ${queue}: ${messageId}`);

    // 模拟延迟
    if (options?.delaySeconds) {
      await new Promise(resolve => setTimeout(resolve, (options.delaySeconds ?? 0) * 1000));
    }

    return messageId;
  }

  async receiveMessage(queue: string, options?: ReceiveOptions): Promise<Message | null> {
    const messages = this.queues.get(queue) || [];

    if (messages.length === 0) {
      console.log(`[MockMessagingService] 队列 ${queue} 为空`);
      return null;
    }

    const message = messages.shift()!;
    console.log(`[MockMessagingService] 从队列 ${queue} 接收消息: ${message.id}`);

    return message;
  }

  async acknowledgeMessage(queue: string, messageId: string): Promise<void> {
    console.log(`[MockMessagingService] 确认消息已处理: ${queue}/${messageId}`);
    // 在模拟实现中，消息已被接收并从队列中移除，无需额外处理
  }

  async publishEvent(topic: string, event: any): Promise<void> {
    console.log(`[MockMessagingService] 发布事件到主题 ${topic}:`, event);

    const handlers = this.subscriptions.get(topic) || [];

    // 异步调用所有处理程序
    for (const handler of handlers) {
      setTimeout(() => handler(event).catch(console.error), 0);
    }
  }

  async subscribeEvent(topic: string, handler: EventHandler): Promise<Subscription> {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }

    this.subscriptions.get(topic)!.push(handler);
    console.log(`[MockMessagingService] 订阅主题 ${topic}`);

    return {
      unsubscribe: async () => {
        const handlers = this.subscriptions.get(topic) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
          console.log(`[MockMessagingService] 取消订阅主题 ${topic}`);
        }
      }
    };
  }
}