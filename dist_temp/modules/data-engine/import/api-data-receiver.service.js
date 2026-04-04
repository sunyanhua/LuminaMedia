"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ApiDataReceiverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDataReceiverService = void 0;
const common_1 = require("@nestjs/common");
let ApiDataReceiverService = ApiDataReceiverService_1 = class ApiDataReceiverService {
    logger = new common_1.Logger(ApiDataReceiverService_1.name);
    async receiveStreamingData(config, dataHandler, options = {}) {
        const startTime = new Date();
        const maxRecords = options.maxRecords || 1000;
        const timeoutMs = options.timeoutMs || 30000;
        let totalReceived = 0;
        let successful = 0;
        let failed = 0;
        const errors = [];
        this.logger.log(`开始从API接收数据: ${config.endpoint}`);
        this.logger.log(`配置: ${JSON.stringify(config, null, 2)}`);
        try {
            const mockData = this.generateMockData(config, maxRecords);
            for (const record of mockData) {
                if (totalReceived >= maxRecords) {
                    this.logger.log(`达到最大记录数: ${maxRecords}`);
                    break;
                }
                const apiRecord = {
                    data: record,
                    receivedAt: new Date(),
                    source: config.endpoint,
                    metadata: {
                        batchId: `batch_${startTime.getTime()}`,
                        sequence: totalReceived + 1,
                    },
                };
                try {
                    const handled = await dataHandler(apiRecord);
                    if (handled) {
                        successful++;
                    }
                    else {
                        failed++;
                        errors.push({
                            record: apiRecord.data,
                            error: '数据处理失败',
                            timestamp: new Date(),
                        });
                    }
                }
                catch (error) {
                    failed++;
                    errors.push({
                        record: apiRecord.data,
                        error: error instanceof Error ? error.message : '未知错误',
                        timestamp: new Date(),
                    });
                }
                totalReceived++;
                if (options.onProgress && totalReceived % 10 === 0) {
                    options.onProgress({
                        received: totalReceived,
                        successful,
                        failed,
                    });
                }
                await new Promise((resolve) => setTimeout(resolve, 10));
            }
        }
        catch (error) {
            this.logger.error(`API数据接收失败: ${error.message}`, error.stack);
            throw error;
        }
        const endTime = new Date();
        const durationMs = endTime.getTime() - startTime.getTime();
        const result = {
            totalReceived,
            successful,
            failed,
            errors,
            summary: {
                startTime,
                endTime,
                durationMs,
                dataRate: durationMs > 0 ? totalReceived / (durationMs / 1000) : 0,
            },
        };
        this.logger.log(`API数据接收完成: ${JSON.stringify(result.summary, null, 2)}`);
        return result;
    }
    async receiveBatchData(config, batchSize = 100) {
        this.logger.log(`开始批量接收数据，批量大小: ${batchSize}`);
        const mockData = this.generateMockData(config, batchSize);
        const records = mockData.map((data, index) => ({
            data,
            receivedAt: new Date(),
            source: config.endpoint,
            metadata: {
                batchId: `batch_${Date.now()}`,
                sequence: index + 1,
            },
        }));
        this.logger.log(`批量接收完成，共 ${records.length} 条记录`);
        return records;
    }
    async testConnection(config) {
        const startTime = Date.now();
        try {
            await new Promise((resolve) => setTimeout(resolve, 100));
            const responseTime = Date.now() - startTime;
            const success = Math.random() > 0.2;
            if (success) {
                return {
                    success: true,
                    statusCode: 200,
                    responseTime,
                };
            }
            else {
                return {
                    success: false,
                    statusCode: 500,
                    responseTime,
                    error: '模拟API连接失败',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : '未知错误',
            };
        }
    }
    validateDataFormat(data, schema) {
        const errors = [];
        const warnings = [];
        if (schema.required && Array.isArray(schema.required)) {
            for (const field of schema.required) {
                if (data[field] === undefined || data[field] === null) {
                    errors.push(`缺少必需字段: ${field}`);
                }
            }
        }
        if (schema.properties) {
            for (const [field, fieldSchema] of Object.entries(schema.properties)) {
                if (data[field] !== undefined) {
                    const value = data[field];
                    const expectedType = fieldSchema.type;
                    if (expectedType === 'string' && typeof value !== 'string') {
                        errors.push(`字段 ${field} 应为字符串类型`);
                    }
                    else if (expectedType === 'number' && typeof value !== 'number') {
                        errors.push(`字段 ${field} 应为数字类型`);
                    }
                    else if (expectedType === 'boolean' && typeof value !== 'boolean') {
                        errors.push(`字段 ${field} 应为布尔类型`);
                    }
                    else if (expectedType === 'array' && !Array.isArray(value)) {
                        errors.push(`字段 ${field} 应为数组类型`);
                    }
                    else if (expectedType === 'object' &&
                        (typeof value !== 'object' || Array.isArray(value))) {
                        errors.push(`字段 ${field} 应为对象类型`);
                    }
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    generateMockData(config, count) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push({
                id: `record_${Date.now()}_${i}`,
                customer_id: `CUST${10000 + i}`,
                name: `测试客户${i}`,
                mobile: `138${String(10000000 + i).padStart(8, '0')}`,
                email: `customer${i}@example.com`,
                purchase_amount: (Math.random() * 1000).toFixed(2),
                purchase_time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                location: `城市${Math.floor(Math.random() * 10)}`,
                product_category: ['电子产品', '服装', '食品', '家居'][Math.floor(Math.random() * 4)],
                order_status: ['pending', 'completed', 'cancelled'][Math.floor(Math.random() * 3)],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
        }
        return data;
    }
    getApiStats(config) {
        return {
            endpoint: config.endpoint,
            method: config.method,
            estimatedRecords: 10000,
            estimatedSizeMB: 5.2,
            recommendedBatchSize: config.pagination?.pageSize || 100,
        };
    }
};
exports.ApiDataReceiverService = ApiDataReceiverService;
exports.ApiDataReceiverService = ApiDataReceiverService = ApiDataReceiverService_1 = __decorate([
    (0, common_1.Injectable)()
], ApiDataReceiverService);
//# sourceMappingURL=api-data-receiver.service.js.map