export interface StructuredLog {
    timestamp: string;
    level: 'debug' | 'info' | 'warn' | 'error' | 'verbose';
    service: string;
    module: string;
    action: string;
    userId?: string;
    tenantId?: string;
    duration?: number;
    status: 'success' | 'failure' | 'partial';
    errorCode?: string;
    errorMessage?: string;
    requestId: string;
    extra?: Record<string, any>;
    environment: string;
    hostname?: string;
    version?: string;
}
