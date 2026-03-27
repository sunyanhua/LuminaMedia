/**
 * CloudProvider 抽象接口
 * 支持环境一键切换（阿里云SaaS ↔ 私有化部署 ↔ Mock演示模式）
 */
export interface CloudProvider {
  /**
   * 存储服务（对象存储、文件存储）
   */
  storage: StorageService;

  /**
   * AI服务（云端AI、本地AI模型调用）
   */
  ai: AIService;

  /**
   * 数据库服务（多租户数据库、分表管理）
   */
  database: DatabaseService;

  /**
   * 消息服务（队列、事件总线）
   */
  messaging: MessagingService;

  /**
   * 获取提供者名称
   */
  getName(): string;

  /**
   * 初始化提供者
   */
  initialize(): Promise<void>;

  /**
   * 健康检查
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: Record<string, any>;
  }>;

  /**
   * 清理资源
   */
  cleanup(): Promise<void>;
}

/**
 * 存储服务接口
 */
export interface StorageService {
  /**
   * 上传文件到云存储
   */
  uploadFile(
    bucket: string,
    key: string,
    file: Buffer,
    options?: StorageOptions,
  ): Promise<StorageResult>;

  /**
   * 下载文件
   */
  downloadFile(bucket: string, key: string): Promise<Buffer>;

  /**
   * 删除文件
   */
  deleteFile(bucket: string, key: string): Promise<void>;

  /**
   * 获取文件URL（带签名，可选过期时间）
   */
  getFileUrl(bucket: string, key: string, expiresIn?: number): Promise<string>;

  /**
   * 列出文件
   */
  listFiles(bucket: string, prefix?: string): Promise<FileInfo[]>;
}

/**
 * AI服务接口
 */
export interface AIService {
  /**
   * 调用云端AI模型（Gemini、Qwen等）
   */
  callModel(
    model: string,
    prompt: string,
    options?: AIModelOptions,
  ): Promise<AIResponse>;

  /**
   * 调用本地AI模型（Docker一键拉起）
   */
  callLocalModel(
    model: string,
    prompt: string,
    options?: LocalModelOptions,
  ): Promise<AIResponse>;

  /**
   * 获取可用模型列表
   */
  listAvailableModels(): Promise<ModelInfo[]>;

  /**
   * 获取AI服务状态
   */
  getServiceStatus(): Promise<AIServiceStatus>;
}

/**
 * 数据库服务接口
 */
export interface DatabaseService {
  /**
   * 执行查询（自动处理多租户隔离）
   */
  query<T>(sql: string, params?: any[]): Promise<T[]>;

  /**
   * 执行更新
   */
  execute(sql: string, params?: any[]): Promise<number>;

  /**
   * 开始事务
   */
  beginTransaction(): Promise<Transaction>;

  /**
   * 获取连接池状态
   */
  getConnectionStats(): Promise<ConnectionStats>;

  /**
   * 分表管理（获取分表信息、迁移数据等）
   */
  sharding: ShardingService;
}

/**
 * 消息服务接口
 */
export interface MessagingService {
  /**
   * 发送消息到队列
   */
  sendMessage(
    queue: string,
    message: any,
    options?: MessageOptions,
  ): Promise<string>;

  /**
   * 接收消息
   */
  receiveMessage(
    queue: string,
    options?: ReceiveOptions,
  ): Promise<Message | null>;

  /**
   * 确认消息已处理
   */
  acknowledgeMessage(queue: string, messageId: string): Promise<void>;

  /**
   * 发布事件到主题
   */
  publishEvent(topic: string, event: any): Promise<void>;

  /**
   * 订阅事件
   */
  subscribeEvent(topic: string, handler: EventHandler): Promise<Subscription>;
}

// ==================== 数据类型定义 ====================

export interface StorageOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
}

export interface StorageResult {
  key: string;
  bucket: string;
  url: string;
  size: number;
  etag?: string;
}

export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  etag?: string;
}

export interface AIModelOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface LocalModelOptions extends AIModelOptions {
  gpu?: boolean;
  memoryLimit?: string;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'gemini' | 'qwen' | 'local';
  capabilities: string[];
  maxTokens: number;
}

export interface AIServiceStatus {
  available: boolean;
  models: ModelInfo[];
  latency?: number;
}

export interface Transaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface ConnectionStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
}

export interface ShardingService {
  getTablePartition(table: string, tenantId: string): Promise<string>;
  migrateData(
    sourceTable: string,
    targetTable: string,
  ): Promise<MigrationResult>;
  analyzePartitionBalance(): Promise<PartitionBalanceReport>;
}

export interface MigrationResult {
  migratedRows: number;
  duration: number;
  errors: string[];
}

export interface PartitionBalanceReport {
  table: string;
  partitions: PartitionInfo[];
  imbalanceScore: number;
  recommendations: string[];
}

export interface PartitionInfo {
  name: string;
  rowCount: number;
  dataSize: number;
  tenantIds: string[];
}

export interface MessageOptions {
  delaySeconds?: number;
  messageAttributes?: Record<string, string>;
}

export interface ReceiveOptions {
  maxNumberOfMessages?: number;
  waitTimeSeconds?: number;
  visibilityTimeout?: number;
}

export interface Message {
  id: string;
  body: any;
  attributes?: Record<string, string>;
  receiptHandle?: string;
  timestamp: Date;
}

export interface EventHandler {
  (event: any): Promise<void>;
}

export interface Subscription {
  unsubscribe(): Promise<void>;
}
