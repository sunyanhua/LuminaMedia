"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAdapter = void 0;
class MockAdapter {
    storage = new MockStorageService();
    ai = new MockAIService();
    database = new MockDatabaseService();
    messaging = new MockMessagingService();
    getName() {
        return 'mock';
    }
    async initialize() {
        console.log('[MockAdapter] 初始化模拟云服务提供者');
    }
    async healthCheck() {
        return {
            status: 'healthy',
            details: {
                provider: 'mock',
                message: '所有服务运行正常（模拟模式）',
                timestamp: new Date().toISOString(),
            },
        };
    }
    async cleanup() {
        console.log('[MockAdapter] 清理模拟云服务提供者');
    }
}
exports.MockAdapter = MockAdapter;
class MockStorageService {
    files = new Map();
    async uploadFile(bucket, key, file, options) {
        const fileKey = `${bucket}/${key}`;
        this.files.set(fileKey, {
            bucket,
            key,
            content: file,
            metadata: options?.metadata || {},
        });
        console.log(`[MockStorageService] 上传文件: ${fileKey}, 大小: ${file.length} bytes`);
        return {
            key,
            bucket,
            url: `https://mock-storage.example.com/${bucket}/${key}`,
            size: file.length,
            etag: `mock-etag-${Date.now()}`,
        };
    }
    async downloadFile(bucket, key) {
        const fileKey = `${bucket}/${key}`;
        const file = this.files.get(fileKey);
        if (!file) {
            throw new Error(`文件不存在: ${fileKey}`);
        }
        console.log(`[MockStorageService] 下载文件: ${fileKey}, 大小: ${file.content.length} bytes`);
        return file.content;
    }
    async deleteFile(bucket, key) {
        const fileKey = `${bucket}/${key}`;
        this.files.delete(fileKey);
        console.log(`[MockStorageService] 删除文件: ${fileKey}`);
    }
    async getFileUrl(bucket, key, expiresIn) {
        return `https://mock-storage.example.com/${bucket}/${key}?expires=${expiresIn || 3600}`;
    }
    async listFiles(bucket, prefix) {
        const files = [];
        for (const [fileKey, file] of this.files.entries()) {
            if (fileKey.startsWith(`${bucket}/`) &&
                (!prefix || fileKey.includes(prefix))) {
                files.push({
                    key: file.key,
                    size: file.content.length,
                    lastModified: new Date(),
                    etag: `mock-etag-${fileKey}`,
                });
            }
        }
        console.log(`[MockStorageService] 列出文件: bucket=${bucket}, prefix=${prefix}, 数量=${files.length}`);
        return files;
    }
}
class MockAIService {
    mockResponses = [
        '这是一个模拟的AI响应。',
        '根据您的请求，AI建议采取以下措施...',
        '分析完成，推荐方案已生成。',
        '模拟AI模型处理成功。',
        '这里是AI生成的创意内容。',
    ];
    async callModel(model, prompt, options) {
        console.log(`[MockAIService] 调用云端模型: ${model}, prompt长度: ${prompt.length}`);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const randomResponse = this.mockResponses[Math.floor(Math.random() * this.mockResponses.length)];
        return {
            text: `[${model}] ${randomResponse}\n\n原始提示: ${prompt.substring(0, 100)}...`,
            usage: {
                promptTokens: Math.floor(prompt.length / 4),
                completionTokens: Math.floor(randomResponse.length / 4),
                totalTokens: Math.floor((prompt.length + randomResponse.length) / 4),
            },
            finishReason: 'stop',
        };
    }
    async callLocalModel(model, prompt, options) {
        console.log(`[MockAIService] 调用本地模型: ${model}, GPU=${options?.gpu || false}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const randomResponse = this.mockResponses[Math.floor(Math.random() * this.mockResponses.length)];
        return {
            text: `[本地${model}] ${randomResponse}\n\n原始提示: ${prompt.substring(0, 100)}...`,
            usage: {
                promptTokens: Math.floor(prompt.length / 4),
                completionTokens: Math.floor(randomResponse.length / 4),
                totalTokens: Math.floor((prompt.length + randomResponse.length) / 4),
            },
            finishReason: 'stop',
        };
    }
    async listAvailableModels() {
        return [
            {
                id: 'gemini-2.0-pro',
                name: 'Gemini 2.0 Pro',
                provider: 'gemini',
                capabilities: ['text-generation', 'code-generation', 'translation'],
                maxTokens: 32768,
            },
            {
                id: 'qwen-max',
                name: 'Qwen Max',
                provider: 'qwen',
                capabilities: ['text-generation', 'creative-writing', 'analysis'],
                maxTokens: 8192,
            },
            {
                id: 'qwen-7b-local',
                name: 'Qwen 7B (本地)',
                provider: 'local',
                capabilities: ['text-generation', 'summarization'],
                maxTokens: 4096,
            },
        ];
    }
    async getServiceStatus() {
        return {
            available: true,
            models: await this.listAvailableModels(),
            latency: 50,
        };
    }
}
class MockDatabaseService {
    sharding = new MockShardingService();
    async query(sql, params) {
        console.log(`[MockDatabaseService] 执行查询: ${sql}, 参数: ${JSON.stringify(params || [])}`);
        await new Promise((resolve) => setTimeout(resolve, 50));
        return [];
    }
    async execute(sql, params) {
        console.log(`[MockDatabaseService] 执行更新: ${sql}, 参数: ${JSON.stringify(params || [])}`);
        await new Promise((resolve) => setTimeout(resolve, 30));
        return sql.toLowerCase().includes('insert') ? 1 : 0;
    }
    async beginTransaction() {
        console.log('[MockDatabaseService] 开始事务');
        return {
            commit: async () => {
                console.log('[MockDatabaseService] 提交事务');
                await new Promise((resolve) => setTimeout(resolve, 20));
            },
            rollback: async () => {
                console.log('[MockDatabaseService] 回滚事务');
                await new Promise((resolve) => setTimeout(resolve, 20));
            },
        };
    }
    async getConnectionStats() {
        return {
            total: 10,
            active: 2,
            idle: 8,
            waiting: 0,
        };
    }
}
class MockShardingService {
    async getTablePartition(table, tenantId) {
        const hash = this.hashString(tenantId);
        const partition = hash % 16;
        return `${table}_partition_${partition}`;
    }
    async migrateData(sourceTable, targetTable) {
        console.log(`[MockShardingService] 迁移数据: ${sourceTable} -> ${targetTable}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
            migratedRows: Math.floor(Math.random() * 1000) + 100,
            duration: 1000,
            errors: [],
        };
    }
    async analyzePartitionBalance() {
        const partitions = [];
        for (let i = 0; i < 16; i++) {
            partitions.push({
                name: `partition_${i}`,
                rowCount: Math.floor(Math.random() * 10000) + 1000,
                dataSize: Math.floor(Math.random() * 100000000) + 1000000,
                tenantIds: [`tenant_${i}_1`, `tenant_${i}_2`],
            });
        }
        return {
            table: 'customer_profiles',
            partitions,
            imbalanceScore: 0.15,
            recommendations: [
                '分区分布较为均衡，无需立即调整',
                '建议监控 partition_7 的增长情况',
            ],
        };
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }
}
class MockMessagingService {
    queues = new Map();
    subscriptions = new Map();
    async sendMessage(queue, message, options) {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (!this.queues.has(queue)) {
            this.queues.set(queue, []);
        }
        const msg = {
            id: messageId,
            body: message,
            attributes: options?.messageAttributes,
            timestamp: new Date(),
        };
        this.queues.get(queue).push(msg);
        console.log(`[MockMessagingService] 发送消息到队列 ${queue}: ${messageId}`);
        if (options?.delaySeconds) {
            await new Promise((resolve) => setTimeout(resolve, (options.delaySeconds ?? 0) * 1000));
        }
        return messageId;
    }
    async receiveMessage(queue, options) {
        const messages = this.queues.get(queue) || [];
        if (messages.length === 0) {
            console.log(`[MockMessagingService] 队列 ${queue} 为空`);
            return null;
        }
        const message = messages.shift();
        console.log(`[MockMessagingService] 从队列 ${queue} 接收消息: ${message.id}`);
        return message;
    }
    async acknowledgeMessage(queue, messageId) {
        console.log(`[MockMessagingService] 确认消息已处理: ${queue}/${messageId}`);
    }
    async publishEvent(topic, event) {
        console.log(`[MockMessagingService] 发布事件到主题 ${topic}:`, event);
        const handlers = this.subscriptions.get(topic) || [];
        for (const handler of handlers) {
            setTimeout(() => {
                const result = handler(event);
                if (result && typeof result.catch === 'function') {
                    result.catch(console.error);
                }
            }, 0);
        }
    }
    async subscribeEvent(topic, handler) {
        if (!this.subscriptions.has(topic)) {
            this.subscriptions.set(topic, []);
        }
        this.subscriptions.get(topic).push(handler);
        console.log(`[MockMessagingService] 订阅主题 ${topic}`);
        return {
            unsubscribe: async () => {
                const handlers = this.subscriptions.get(topic) || [];
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                    console.log(`[MockMessagingService] 取消订阅主题 ${topic}`);
                }
            },
        };
    }
}
//# sourceMappingURL=mock.adapter.js.map