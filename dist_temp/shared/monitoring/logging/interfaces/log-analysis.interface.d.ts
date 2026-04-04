export interface LogAnalysisResult {
    timeRange: {
        from: string;
        to: string;
    };
    statistics: {
        totalLogs: number;
        byLevel: Record<string, number>;
        byModule: Record<string, number>;
        byStatus: Record<string, number>;
        errors: number;
        warnings: number;
    };
    trends: {
        hourly: Array<{
            hour: string;
            count: number;
            errors: number;
        }>;
        daily: Array<{
            day: string;
            count: number;
            errors: number;
        }>;
    };
    errorAnalysis: {
        topErrors: Array<{
            errorCode: string;
            errorMessage: string;
            count: number;
            lastOccurred: string;
        }>;
        errorRate: number;
    };
    performanceAnalysis: {
        averageDuration: number;
        p95Duration: number;
        p99Duration: number;
        slowOperations: Array<{
            module: string;
            action: string;
            averageDuration: number;
            count: number;
        }>;
    };
    recommendations: Array<{
        type: 'error' | 'performance' | 'security' | 'usage';
        priority: 'high' | 'medium' | 'low';
        description: string;
        suggestion: string;
    }>;
}
export interface LogQueryOptions {
    from?: string;
    to?: string;
    filters?: {
        level?: string | string[];
        module?: string | string[];
        status?: string | string[];
        userId?: string;
        tenantId?: string;
        errorCode?: string;
    };
    pagination?: {
        page: number;
        pageSize: number;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    aggregations?: string[];
}
export interface LogAlertRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    condition: LogAlertCondition;
    actions: LogAlertAction[];
    notificationChannels: string[];
    cooldownPeriod: number;
    lastTriggered?: string;
}
export interface LogAlertCondition {
    type: 'threshold' | 'pattern' | 'anomaly' | 'absence';
    field: string;
    operator: 'gt' | 'lt' | 'eq' | 'neq' | 'contains' | 'regex';
    value: any;
    window: string;
    occurrences: number;
}
export interface LogAlertAction {
    type: 'notification' | 'webhook' | 'script' | 'log';
    target: string;
    parameters: Record<string, any>;
}
