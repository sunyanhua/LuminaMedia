export interface CloudProvider {
    storage: StorageService;
    ai: AIService;
    database: DatabaseService;
    messaging: MessagingService;
    getName(): string;
    initialize(): Promise<void>;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details?: Record<string, any>;
    }>;
    cleanup(): Promise<void>;
}
export interface StorageService {
    uploadFile(bucket: string, key: string, file: Buffer, options?: StorageOptions): Promise<StorageResult>;
    downloadFile(bucket: string, key: string): Promise<Buffer>;
    deleteFile(bucket: string, key: string): Promise<void>;
    getFileUrl(bucket: string, key: string, expiresIn?: number): Promise<string>;
    listFiles(bucket: string, prefix?: string): Promise<FileInfo[]>;
}
export interface AIService {
    callModel(model: string, prompt: string, options?: AIModelOptions): Promise<AIResponse>;
    callLocalModel(model: string, prompt: string, options?: LocalModelOptions): Promise<AIResponse>;
    listAvailableModels(): Promise<ModelInfo[]>;
    getServiceStatus(): Promise<AIServiceStatus>;
}
export interface DatabaseService {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    execute(sql: string, params?: any[]): Promise<number>;
    beginTransaction(): Promise<Transaction>;
    getConnectionStats(): Promise<ConnectionStats>;
    sharding: ShardingService;
}
export interface MessagingService {
    sendMessage(queue: string, message: any, options?: MessageOptions): Promise<string>;
    receiveMessage(queue: string, options?: ReceiveOptions): Promise<Message | null>;
    acknowledgeMessage(queue: string, messageId: string): Promise<void>;
    publishEvent(topic: string, event: any): Promise<void>;
    subscribeEvent(topic: string, handler: EventHandler): Promise<Subscription>;
}
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
    rateLimit?: {
        requestsPerMinute?: number;
        tokensPerMinute?: number;
        limit: number;
        remaining?: number;
        resetTime?: Date;
    };
    error?: string;
    lastChecked?: string;
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
    migrateData(sourceTable: string, targetTable: string): Promise<MigrationResult>;
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
