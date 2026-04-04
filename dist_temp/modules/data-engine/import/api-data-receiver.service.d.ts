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
        dataRate: number;
    };
}
export declare class ApiDataReceiverService {
    private readonly logger;
    receiveStreamingData(config: ApiDataSourceConfig, dataHandler: (record: ApiDataRecord) => Promise<boolean>, options?: {
        maxRecords?: number;
        timeoutMs?: number;
        onProgress?: (progress: {
            received: number;
            successful: number;
            failed: number;
        }) => void;
    }): Promise<ApiReceiveResult>;
    receiveBatchData(config: ApiDataSourceConfig, batchSize?: number): Promise<ApiDataRecord[]>;
    testConnection(config: ApiDataSourceConfig): Promise<{
        success: boolean;
        statusCode?: number;
        responseTime?: number;
        error?: string;
    }>;
    validateDataFormat(data: Record<string, any>, schema: Record<string, any>): {
        valid: boolean;
        errors: string[];
        warnings: string[];
    };
    private generateMockData;
    getApiStats(config: ApiDataSourceConfig): {
        endpoint: string;
        method: string;
        estimatedRecords: number;
        estimatedSizeMB: number;
        recommendedBatchSize: number;
    };
}
