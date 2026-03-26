import { Injectable, Logger } from '@nestjs/common';

export interface ApiDataSourceConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  auth?: {
    type: 'basic' | 'bearer' | 'api_key';
    credentials: Record<string, string>;
  };
  pagination?: {
    type: 'offset' | 'cursor' | 'page';
    pageSize: number;
    totalField?: string;
  };
  rateLimit?: {
    requestsPerSecond: number;
    maxRetries: number;
  };
}

export interface ApiDataRecord {
  id?: string;
  data: Record<string, any>;
  receivedAt: Date;
  source: string;
  metadata?: Record<string, any>;
}

export interface ApiReceiveResult {
  totalReceived: number;
  successful: number;
  failed: number;
  errors: Array<{
    record: any;
    error: string;
    timestamp: Date;
  }>;
  summary: {
    startTime: Date;
    endTime: Date;
    durationMs: number;
    dataRate: number; // records per second
  };
}

@Injectable()
export class ApiDataReceiverService {
  private readonly logger = new Logger(ApiDataReceiverService.name);

  /**
   * 从API接收流式数据
   * @param config API配置
   * @param dataHandler 数据处理回调
   * @param options 接收选项
   */
  async receiveStreamingData(
    config: ApiDataSourceConfig,
    dataHandler: (record: ApiDataRecord) => Promise<boolean>,
    options: {
      maxRecords?: number;
      timeoutMs?: number;
      onProgress?: (progress: {
        received: number;
        successful: number;
        failed: number;
      }) => void;
    } = {},
  ): Promise<ApiReceiveResult> {
    const startTime = new Date();
    const maxRecords = options.maxRecords || 1000;
    const timeoutMs = options.timeoutMs || 30000;

    let totalReceived = 0;
    let successful = 0;
    let failed = 0;
    const errors: Array<{
      record: any;
      error: string;
      timestamp: Date;
    }> = [];

    this.logger.log(`开始从API接收数据: ${config.endpoint}`);
    this.logger.log(`配置: ${JSON.stringify(config, null, 2)}`);

    try {
      // TODO: 实现实际的API流式接收逻辑
      // 临时模拟实现
      const mockData = this.generateMockData(config, maxRecords);

      for (const record of mockData) {
        if (totalReceived >= maxRecords) {
          this.logger.log(`达到最大记录数: ${maxRecords}`);
          break;
        }

        const apiRecord: ApiDataRecord = {
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
          } else {
            failed++;
            errors.push({
              record: apiRecord.data,
              error: '数据处理失败',
              timestamp: new Date(),
            });
          }
        } catch (error) {
          failed++;
          errors.push({
            record: apiRecord.data,
            error: error instanceof Error ? error.message : '未知错误',
            timestamp: new Date(),
          });
        }

        totalReceived++;

        // 报告进度
        if (options.onProgress && totalReceived % 10 === 0) {
          options.onProgress({
            received: totalReceived,
            successful,
            failed,
          });
        }

        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      this.logger.error(`API数据接收失败: ${error.message}`, error.stack);
      throw error;
    }

    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    const result: ApiReceiveResult = {
      totalReceived,
      successful,
      failed,
      errors,
      summary: {
        startTime,
        endTime,
        durationMs,
        dataRate: durationMs > 0 ? (totalReceived / (durationMs / 1000)) : 0,
      },
    };

    this.logger.log(`API数据接收完成: ${JSON.stringify(result.summary, null, 2)}`);
    return result;
  }

  /**
   * 批量接收API数据
   * @param config API配置
   * @param batchSize 批量大小
   */
  async receiveBatchData(
    config: ApiDataSourceConfig,
    batchSize: number = 100,
  ): Promise<ApiDataRecord[]> {
    this.logger.log(`开始批量接收数据，批量大小: ${batchSize}`);

    // TODO: 实现实际的批量API调用
    // 临时模拟实现
    const mockData = this.generateMockData(config, batchSize);
    const records: ApiDataRecord[] = mockData.map((data, index) => ({
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

  /**
   * 测试API连接
   * @param config API配置
   */
  async testConnection(config: ApiDataSourceConfig): Promise<{
    success: boolean;
    statusCode?: number;
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // TODO: 实现实际的API连接测试
      // 临时模拟实现
      await new Promise(resolve => setTimeout(resolve, 100));

      const responseTime = Date.now() - startTime;

      // 模拟不同的测试结果
      const success = Math.random() > 0.2; // 80%成功率
      if (success) {
        return {
          success: true,
          statusCode: 200,
          responseTime,
        };
      } else {
        return {
          success: false,
          statusCode: 500,
          responseTime,
          error: '模拟API连接失败',
        };
      }
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 验证API数据格式
   * @param data 数据记录
   * @param schema 数据模式（JSON Schema格式）
   */
  validateDataFormat(
    data: Record<string, any>,
    schema: Record<string, any>,
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    // TODO: 实现完整的JSON Schema验证
    // 临时简单验证
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查必需字段
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (data[field] === undefined || data[field] === null) {
          errors.push(`缺少必需字段: ${field}`);
        }
      }
    }

    // 检查字段类型
    if (schema.properties) {
      for (const [field, fieldSchema] of Object.entries(schema.properties) as [string, any][]) {
        if (data[field] !== undefined) {
          const value = data[field];
          const expectedType = fieldSchema.type;

          if (expectedType === 'string' && typeof value !== 'string') {
            errors.push(`字段 ${field} 应为字符串类型`);
          } else if (expectedType === 'number' && typeof value !== 'number') {
            errors.push(`字段 ${field} 应为数字类型`);
          } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
            errors.push(`字段 ${field} 应为布尔类型`);
          } else if (expectedType === 'array' && !Array.isArray(value)) {
            errors.push(`字段 ${field} 应为数组类型`);
          } else if (expectedType === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
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

  /**
   * 生成模拟数据（临时）
   */
  private generateMockData(config: ApiDataSourceConfig, count: number): Record<string, any>[] {
    const data: Record<string, any>[] = [];

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

  /**
   * 获取API数据统计信息
   */
  getApiStats(config: ApiDataSourceConfig): {
    endpoint: string;
    method: string;
    estimatedRecords: number;
    estimatedSizeMB: number;
    recommendedBatchSize: number;
  } {
    // 模拟统计信息
    return {
      endpoint: config.endpoint,
      method: config.method,
      estimatedRecords: 10000,
      estimatedSizeMB: 5.2,
      recommendedBatchSize: config.pagination?.pageSize || 100,
    };
  }
}