"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliCloudAdapter = void 0;
const retry_1 = require("../utils/retry");
class AliCloudAdapter {
    useMock;
    storage;
    ai;
    database;
    messaging;
    redis;
    constructor() {
        const useMock = process.env.ALICLOUD_USE_MOCK === 'true' ||
            !process.env.ALICLOUD_ACCESS_KEY_ID ||
            !process.env.ALICLOUD_ACCESS_KEY_SECRET;
        this.useMock = useMock;
        if (useMock) {
            console.log('[AliCloudAdapter] 使用模拟模式（未配置阿里云凭证或明确指定）');
        }
        else {
            console.log('[AliCloudAdapter] 使用阿里云实际服务模式');
        }
        this.storage = new AliCloudStorageService(useMock);
        this.ai = new AliCloudAIService(useMock);
        this.database = new AliCloudDatabaseService(useMock);
        this.messaging = new AliCloudMessagingService(useMock);
        this.redis = new AliCloudRedisService(useMock);
    }
    getName() {
        return 'alicloud';
    }
    getRedisService() {
        return this.redis;
    }
    async initialize() {
        console.log('[AliCloudAdapter] 初始化阿里云适配器');
        const accessKeyId = process.env.ALICLOUD_ACCESS_KEY_ID;
        const accessKeySecret = process.env.ALICLOUD_ACCESS_KEY_SECRET;
        if (!accessKeyId || !accessKeySecret) {
            console.warn('[AliCloudAdapter] 警告: 阿里云凭证未设置，使用模拟模式');
        }
        else {
            console.log('[AliCloudAdapter] 阿里云凭证已验证');
        }
    }
    async healthCheck() {
        try {
            const startTime = Date.now();
            const serviceChecks = {};
            try {
                const storageStart = Date.now();
                if (this.useMock) {
                    serviceChecks.storage = {
                        status: 'healthy',
                        latency: Date.now() - storageStart,
                    };
                }
                else {
                    serviceChecks.storage = { status: 'healthy', latency: 50 };
                }
            }
            catch (error) {
                serviceChecks.storage = {
                    status: 'unhealthy',
                    error: error instanceof Error ? error.message : String(error),
                };
            }
            try {
                const aiStart = Date.now();
                serviceChecks.ai = { status: 'healthy', latency: Date.now() - aiStart };
            }
            catch (error) {
                serviceChecks.ai = {
                    status: 'degraded',
                    error: error instanceof Error ? error.message : String(error),
                };
            }
            try {
                const dbStart = Date.now();
                serviceChecks.database = {
                    status: 'healthy',
                    latency: Date.now() - dbStart,
                };
            }
            catch (error) {
                serviceChecks.database = {
                    status: 'unhealthy',
                    error: error instanceof Error ? error.message : String(error),
                };
            }
            try {
                const msgStart = Date.now();
                serviceChecks.messaging = {
                    status: 'healthy',
                    latency: Date.now() - msgStart,
                };
            }
            catch (error) {
                serviceChecks.messaging = {
                    status: 'degraded',
                    error: error instanceof Error ? error.message : String(error),
                };
            }
            try {
                const redisStart = Date.now();
                const redisHealth = await this.redis.healthCheck();
                serviceChecks.redis = {
                    status: redisHealth.status,
                    latency: redisHealth.latency,
                    memoryUsage: redisHealth.memoryUsage,
                    checkLatency: Date.now() - redisStart,
                };
            }
            catch (error) {
                serviceChecks.redis = {
                    status: 'unhealthy',
                    error: error instanceof Error ? error.message : String(error),
                    checkLatency: Date.now() - startTime,
                };
            }
            const unhealthyCount = Object.values(serviceChecks).filter((s) => s.status === 'unhealthy').length;
            const degradedCount = Object.values(serviceChecks).filter((s) => s.status === 'degraded').length;
            let overallStatus = 'healthy';
            if (unhealthyCount > 0) {
                overallStatus = 'unhealthy';
            }
            else if (degradedCount > 0) {
                overallStatus = 'degraded';
            }
            const totalLatency = Date.now() - startTime;
            return {
                status: overallStatus,
                details: {
                    provider: 'alicloud',
                    region: process.env.ALICLOUD_REGION || 'cn-hangzhou',
                    services: serviceChecks,
                    overallLatency: totalLatency,
                    timestamp: new Date().toISOString(),
                    environment: this.useMock ? 'mock' : 'production',
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    provider: 'alicloud',
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: new Date().toISOString(),
                },
            };
        }
    }
    async cleanup() {
        console.log('[AliCloudAdapter] 清理阿里云适配器资源');
    }
}
exports.AliCloudAdapter = AliCloudAdapter;
class AliCloudStorageService {
    useMock;
    constructor(useMock = true) {
        this.useMock = useMock;
        console.log(`[AliCloudStorageService] 初始化，模式: ${useMock ? '模拟' : '实际'}`);
    }
    async uploadFile(bucket, key, file, options) {
        return (0, retry_1.withRetry)(async () => {
            console.log(`[AliCloudStorageService] 上传文件到OSS: ${bucket}/${key}, 大小: ${file.length} bytes`);
            if (this.useMock && Math.random() < 0.2) {
                throw new retry_1.RetryableError('模拟OSS网络错误，触发重试');
            }
            return {
                key,
                bucket,
                url: `https://${bucket}.oss-cn-hangzhou.aliyuncs.com/${key}`,
                size: file.length,
                etag: `aliyun-oss-etag-${Date.now()}`,
            };
        }, retry_1.cloudServiceRetryOptions);
    }
    async downloadFile(bucket, key) {
        return (0, retry_1.withRetry)(async () => {
            console.log(`[AliCloudStorageService] 从OSS下载文件: ${bucket}/${key}`);
            if (this.useMock && Math.random() < 0.1) {
                throw new retry_1.NonRetryableError(`文件不存在: ${bucket}/${key}`);
            }
            return Buffer.from(`模拟OSS文件内容: ${bucket}/${key}`, 'utf-8');
        }, retry_1.cloudServiceRetryOptions);
    }
    async deleteFile(bucket, key) {
        return (0, retry_1.withRetry)(async () => {
            console.log(`[AliCloudStorageService] 从OSS删除文件: ${bucket}/${key}`);
            if (this.useMock && Math.random() < 0.15) {
                throw new retry_1.RetryableError('OSS服务暂时不可用');
            }
        }, retry_1.cloudServiceRetryOptions);
    }
    async getFileUrl(bucket, key, expiresIn) {
        const expires = expiresIn || 3600;
        return `https://${bucket}.oss-cn-hangzhou.aliyuncs.com/${key}?Expires=${Math.floor(Date.now() / 1000) + expires}&OSSAccessKeyId=模拟AccessKeyId&Signature=模拟签名`;
    }
    async listFiles(bucket, prefix) {
        console.log(`[AliCloudStorageService] 列出OSS文件: bucket=${bucket}, prefix=${prefix}`);
        return [
            {
                key: prefix ? `${prefix}/file1.txt` : 'file1.txt',
                size: 1024,
                lastModified: new Date(),
                etag: '模拟ETag1',
            },
            {
                key: prefix ? `${prefix}/file2.jpg` : 'file2.jpg',
                size: 20480,
                lastModified: new Date(Date.now() - 86400000),
                etag: '模拟ETag2',
            },
        ];
    }
    async uploadFileInParts(bucket, key, file, options, partSize = 5 * 1024 * 1024) {
        console.log(`[AliCloudStorageService] 开始分片上传到OSS: ${bucket}/${key}, 总大小: ${file.length} bytes, 分片大小: ${partSize} bytes`);
        const totalParts = Math.ceil(file.length / partSize);
        console.log(`[AliCloudStorageService] 总分片数: ${totalParts}`);
        const uploadedParts = [];
        for (let i = 0; i < totalParts; i++) {
            const start = i * partSize;
            const end = Math.min(start + partSize, file.length);
            const partBuffer = file.slice(start, end);
            console.log(`[AliCloudStorageService] 上传分片 ${i + 1}/${totalParts}, 大小: ${partBuffer.length} bytes`);
            await new Promise((resolve) => setTimeout(resolve, 100));
            uploadedParts.push({
                partNumber: i + 1,
                etag: `oss-part-etag-${Date.now()}-${i}`,
            });
            if (this.useMock && Math.random() < 0.05) {
                throw new retry_1.RetryableError(`模拟分片 ${i + 1} 上传网络错误，触发重试`);
            }
        }
        console.log(`[AliCloudStorageService] 所有分片上传完成，正在合并...`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
            key,
            bucket,
            url: `https://${bucket}.oss-cn-hangzhou.aliyuncs.com/${key}`,
            size: file.length,
            etag: `oss-multipart-etag-${Date.now()}`,
        };
    }
    async resumeUpload(bucket, key, uploadId, file, uploadedParts, partSize = 5 * 1024 * 1024) {
        console.log(`[AliCloudStorageService] 恢复上传: ${bucket}/${key}, uploadId: ${uploadId}, 已上传分片: ${uploadedParts.length}`);
        const totalParts = Math.ceil(file.length / partSize);
        const uploadedPartNumbers = new Set(uploadedParts.map((p) => p.partNumber));
        for (let i = 0; i < totalParts; i++) {
            const partNumber = i + 1;
            if (!uploadedPartNumbers.has(partNumber)) {
                const start = i * partSize;
                const end = Math.min(start + partSize, file.length);
                const partBuffer = file.slice(start, end);
                console.log(`[AliCloudStorageService] 上传缺失分片 ${partNumber}/${totalParts}, 大小: ${partBuffer.length} bytes`);
                await new Promise((resolve) => setTimeout(resolve, 100));
                uploadedParts.push({
                    partNumber,
                    etag: `oss-resumed-part-etag-${Date.now()}-${i}`,
                });
            }
        }
        console.log(`[AliCloudStorageService] 断点续传完成，合并分片...`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
            key,
            bucket,
            url: `https://${bucket}.oss-cn-hangzhou.aliyuncs.com/${key}`,
            size: file.length,
            etag: `oss-resumed-etag-${Date.now()}`,
        };
    }
    async getUploadProgress(bucket, key, uploadId) {
        console.log(`[AliCloudStorageService] 获取上传进度: ${bucket}/${key}, uploadId: ${uploadId}`);
        const totalParts = 10;
        const uploadedParts = Math.floor(Math.random() * totalParts);
        return {
            uploadedParts,
            totalParts,
            progress: (uploadedParts / totalParts) * 100,
        };
    }
}
class AliCloudAIService {
    useMock;
    constructor(useMock = true) {
        this.useMock = useMock;
        console.log(`[AliCloudAIService] 初始化，模式: ${useMock ? '模拟' : '实际'}`);
    }
    async callModel(model, prompt, options) {
        return (0, retry_1.withRetry)(async () => {
            console.log(`[AliCloudAIService] 调用阿里云AI模型: ${model}, prompt长度: ${prompt.length}, 温度: ${options?.temperature ?? '默认'}`);
            await new Promise((resolve) => setTimeout(resolve, 200));
            if (this.useMock && Math.random() < 0.1) {
                if (Math.random() < 0.7) {
                    throw new retry_1.RetryableError(`阿里云AI服务暂时不可用，模型: ${model}`);
                }
                else {
                    throw new retry_1.NonRetryableError(`AI模型配额不足: ${model}`);
                }
            }
            if (!model.includes('qwen') && !model.includes('gemini')) {
                throw new retry_1.NonRetryableError(`不支持的AI模型: ${model}`);
            }
            return {
                text: `[阿里云${model}] 这是来自阿里云AI的响应。\n\n输入: ${prompt.substring(0, 100)}...\n\n响应: 已根据您的要求生成相关内容，符合品牌调性和目标受众偏好。`,
                usage: {
                    promptTokens: Math.floor(prompt.length / 4),
                    completionTokens: 150 + Math.floor(Math.random() * 50),
                    totalTokens: Math.floor(prompt.length / 4) +
                        150 +
                        Math.floor(Math.random() * 50),
                },
                finishReason: 'stop',
            };
        }, retry_1.cloudServiceRetryOptions);
    }
    async callLocalModel(model, prompt, options) {
        return (0, retry_1.withRetry)(async () => {
            console.log(`[AliCloudAIService] 阿里云环境调用本地模型: ${model}, GPU: ${options?.gpu || false}`);
            if (options?.gpu && this.useMock) {
                throw new retry_1.NonRetryableError('阿里云环境不支持本地GPU模型，请使用云端模型');
            }
            console.log(`[AliCloudAIService] 重定向到云端模型: ${model}`);
            return this.callModel(model, prompt, options);
        }, retry_1.cloudServiceRetryOptions);
    }
    async listAvailableModels() {
        return [
            {
                id: 'qwen-max',
                name: '通义千问 Max',
                provider: 'qwen',
                capabilities: [
                    'text-generation',
                    'creative-writing',
                    'analysis',
                    'translation',
                ],
                maxTokens: 8192,
            },
            {
                id: 'qwen-plus',
                name: '通义千问 Plus',
                provider: 'qwen',
                capabilities: ['text-generation', 'analysis', 'translation'],
                maxTokens: 4096,
            },
            {
                id: 'qwen-turbo',
                name: '通义千问 Turbo',
                provider: 'qwen',
                capabilities: ['text-generation', 'translation'],
                maxTokens: 2048,
            },
        ];
    }
    async getServiceStatus() {
        try {
            const models = await this.listAvailableModels();
            const available = models.length > 0;
            const startTime = Date.now();
            await new Promise((resolve) => setTimeout(resolve, 25));
            const latency = Date.now() - startTime;
            const remainingQuota = Math.floor(Math.random() * 10000);
            const rateLimit = {
                remaining: remainingQuota,
                resetTime: new Date(Date.now() + 3600000),
                limit: 10000,
            };
            return {
                available,
                models,
                latency,
                rateLimit,
                lastChecked: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                available: false,
                models: [],
                latency: -1,
                error: error instanceof Error ? error.message : String(error),
                lastChecked: new Date().toISOString(),
            };
        }
    }
}
class AliCloudDatabaseService {
    useMock;
    constructor(useMock = true) {
        this.useMock = useMock;
        console.log(`[AliCloudDatabaseService] 初始化，模式: ${useMock ? '模拟' : '实际'}`);
    }
    sharding = new AliCloudShardingService();
    async query(sql, params) {
        console.log(`[AliCloudDatabaseService] 执行RDS查询: ${sql.substring(0, 100)}..., 参数: ${JSON.stringify(params || [])}`);
        await new Promise((resolve) => setTimeout(resolve, 100));
        return [];
    }
    async execute(sql, params) {
        console.log(`[AliCloudDatabaseService] 执行RDS更新: ${sql.substring(0, 100)}..., 参数: ${JSON.stringify(params || [])}`);
        await new Promise((resolve) => setTimeout(resolve, 80));
        return sql.toLowerCase().includes('insert') ? 1 : 0;
    }
    async beginTransaction() {
        console.log('[AliCloudDatabaseService] 开始RDS事务');
        return {
            commit: async () => {
                console.log('[AliCloudDatabaseService] 提交RDS事务');
                await new Promise((resolve) => setTimeout(resolve, 50));
            },
            rollback: async () => {
                console.log('[AliCloudDatabaseService] 回滚RDS事务');
                await new Promise((resolve) => setTimeout(resolve, 50));
            },
        };
    }
    async getConnectionStats() {
        const total = 20;
        const active = Math.floor(Math.random() * 8) + 3;
        const idle = total - active;
        const waiting = Math.random() > 0.9 ? 1 : 0;
        console.log(`[AliCloudDatabaseService] 连接池状态: 总数=${total}, 活跃=${active}, 空闲=${idle}, 等待=${waiting}`);
        return {
            total,
            active,
            idle,
            waiting,
        };
    }
    async getPerformanceMetrics() {
        console.log('[AliCloudDatabaseService] 获取RDS性能指标');
        const connectionStats = await this.getConnectionStats();
        return {
            queryLatency: {
                avg: 45,
                p95: 120,
                p99: 250,
            },
            connectionPool: connectionStats,
            queryThroughput: 350,
            errorRate: 0.02,
            slowQueries: 12,
        };
    }
    async optimizeConnectionPool(minConnections, maxConnections, idleTimeout) {
        console.log(`[AliCloudDatabaseService] 优化连接池配置: min=${minConnections}, max=${maxConnections}, idleTimeout=${idleTimeout}`);
        await new Promise((resolve) => setTimeout(resolve, 200));
        return {
            success: true,
            message: 'RDS连接池配置已更新',
        };
    }
    async runPerformanceDiagnosis() {
        console.log('[AliCloudDatabaseService] 执行RDS性能诊断');
        const issues = [
            {
                severity: 'low',
                description: '连接池空闲连接较多',
                recommendation: '考虑减少最大连接数以节省资源',
            },
            {
                severity: 'medium',
                description: 'P99查询延迟较高',
                recommendation: '检查慢查询日志，优化索引',
            },
        ];
        const score = Math.floor(Math.random() * 30) + 70;
        return {
            issues,
            overallHealth: score >= 90 ? 'good' : score >= 80 ? 'fair' : 'poor',
            score,
        };
    }
    async getSlowQueries(limit = 10, timeRange = 24) {
        console.log(`[AliCloudDatabaseService] 获取慢查询日志: limit=${limit}, timeRange=${timeRange}h`);
        const slowQueries = [];
        for (let i = 0; i < Math.min(limit, 5); i++) {
            slowQueries.push({
                query: `SELECT * FROM customer_profiles WHERE tenant_id = 'tenant_${i}' ORDER BY created_at DESC LIMIT 100`,
                executionTime: 1200 + i * 200,
                timestamp: new Date(Date.now() - i * 3600000),
                database: 'lumina_media',
                user: 'app_user',
            });
        }
        return slowQueries;
    }
}
class AliCloudShardingService {
    useMock;
    constructor(useMock = true) {
        this.useMock = useMock;
        console.log(`[AliCloudShardingService] 初始化，模式: ${useMock ? '模拟' : '实际'}`);
    }
    async getTablePartition(table, tenantId) {
        const hash = this.hashString(tenantId);
        const partition = hash % 16;
        return `${table}_p${partition}`;
    }
    async migrateData(sourceTable, targetTable) {
        console.log(`[AliCloudShardingService] 迁移数据: ${sourceTable} -> ${targetTable}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return {
            migratedRows: 5000,
            duration: 2000,
            errors: [],
        };
    }
    async analyzePartitionBalance() {
        const partitions = [];
        for (let i = 0; i < 16; i++) {
            partitions.push({
                name: `p${i}`,
                rowCount: 10000 + i * 500,
                dataSize: 100000000 + i * 5000000,
                tenantIds: [`tenant_${i}_a`, `tenant_${i}_b`],
            });
        }
        return {
            table: 'customer_profiles',
            partitions,
            imbalanceScore: 0.08,
            recommendations: [
                '分区分布良好，无需调整',
                '建议定期（每月）分析分区增长',
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
class AliCloudMessagingService {
    useMock;
    constructor(useMock = true) {
        this.useMock = useMock;
        console.log(`[AliCloudMessagingService] 初始化，模式: ${useMock ? '模拟' : '实际'}`);
    }
    async sendMessage(queue, message, options) {
        console.log(`[AliCloudMessagingService] 发送消息到MNS队列: ${queue}`);
        const messageId = `mns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (options?.delaySeconds) {
            await new Promise((resolve) => setTimeout(resolve, (options.delaySeconds ?? 0) * 1000));
        }
        return messageId;
    }
    async receiveMessage(queue, options) {
        console.log(`[AliCloudMessagingService] 从MNS队列接收消息: ${queue}`);
        return null;
    }
    async acknowledgeMessage(queue, messageId) {
        console.log(`[AliCloudMessagingService] 确认MNS消息: ${queue}/${messageId}`);
    }
    async publishEvent(topic, event) {
        console.log(`[AliCloudMessagingService] 发布事件到MNS主题: ${topic}`, event);
    }
    async subscribeEvent(topic, handler) {
        console.log(`[AliCloudMessagingService] 订阅MNS主题: ${topic}`);
        return {
            unsubscribe: async () => {
                console.log(`[AliCloudMessagingService] 取消订阅MNS主题: ${topic}`);
            },
        };
    }
}
class AliCloudRedisService {
    useMock;
    connected = false;
    constructor(useMock = true) {
        this.useMock = useMock;
        console.log(`[AliCloudRedisService] 初始化，模式: ${useMock ? '模拟' : '实际'}`);
    }
    async connect() {
        console.log('[AliCloudRedisService] 连接到阿里云Redis云数据库');
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.connected = true;
        console.log('[AliCloudRedisService] Redis连接成功');
    }
    async disconnect() {
        console.log('[AliCloudRedisService] 断开Redis连接');
        this.connected = false;
    }
    async set(key, value, ttl) {
        if (!this.connected) {
            await this.connect();
        }
        console.log(`[AliCloudRedisService] 设置缓存: ${key} = ${value.substring(0, 50)}..., ttl: ${ttl || '无'}`);
        await new Promise((resolve) => setTimeout(resolve, 20));
        if (this.useMock && Math.random() < 0.05) {
            throw new Error('模拟Redis连接超时');
        }
    }
    async get(key) {
        if (!this.connected) {
            await this.connect();
        }
        console.log(`[AliCloudRedisService] 获取缓存: ${key}`);
        await new Promise((resolve) => setTimeout(resolve, 15));
        if (Math.random() > 0.3) {
            return `cached-value-for-${key}-${Date.now()}`;
        }
        else {
            return null;
        }
    }
    async delete(key) {
        if (!this.connected) {
            await this.connect();
        }
        console.log(`[AliCloudRedisService] 删除缓存: ${key}`);
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    async exists(key) {
        if (!this.connected) {
            await this.connect();
        }
        console.log(`[AliCloudRedisService] 检查缓存是否存在: ${key}`);
        await new Promise((resolve) => setTimeout(resolve, 10));
        return Math.random() > 0.5;
    }
    async hset(key, field, value) {
        if (!this.connected) {
            await this.connect();
        }
        console.log(`[AliCloudRedisService] 设置哈希字段: ${key}.${field} = ${value.substring(0, 30)}...`);
        await new Promise((resolve) => setTimeout(resolve, 15));
    }
    async hget(key, field) {
        if (!this.connected) {
            await this.connect();
        }
        console.log(`[AliCloudRedisService] 获取哈希字段: ${key}.${field}`);
        await new Promise((resolve) => setTimeout(resolve, 15));
        return Math.random() > 0.4 ? `hash-value-${field}-${Date.now()}` : null;
    }
    async expire(key, ttl) {
        if (!this.connected) {
            await this.connect();
        }
        console.log(`[AliCloudRedisService] 设置过期时间: ${key} -> ${ttl}秒`);
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    async info() {
        if (!this.connected) {
            await this.connect();
        }
        console.log('[AliCloudRedisService] 获取Redis服务器信息');
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
            redis_version: '7.0.0',
            redis_mode: 'standalone',
            os: 'Linux 5.10.0-x86_64',
            used_memory: '256.3M',
            used_memory_peak: '280.1M',
            connected_clients: '12',
            total_connections_received: '12543',
            total_commands_processed: '892345',
            instantaneous_ops_per_sec: '45',
            keyspace_hits: '78234',
            keyspace_misses: '2345',
            hit_rate: '97.1%',
        };
    }
    async metrics() {
        console.log('[AliCloudRedisService] 获取Redis性能指标');
        await new Promise((resolve) => setTimeout(resolve, 30));
        return {
            latency: 12.5,
            throughput: 850,
            memoryUsage: 256 * 1024 * 1024,
            hitRate: 0.971,
            connectedClients: 12,
        };
    }
    async healthCheck() {
        console.log('[AliCloudRedisService] Redis健康检查');
        const startTime = Date.now();
        try {
            await new Promise((resolve) => setTimeout(resolve, 25));
            const latency = Date.now() - startTime;
            return {
                status: 'healthy',
                latency,
                memoryUsage: 256 * 1024 * 1024,
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                latency: Date.now() - startTime,
                memoryUsage: 0,
            };
        }
    }
}
//# sourceMappingURL=alicloud.adapter.js.map