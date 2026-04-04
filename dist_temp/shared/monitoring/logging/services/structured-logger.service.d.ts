import { OnModuleDestroy } from '@nestjs/common';
import { StructuredLog } from '../interfaces/structured-log.interface';
import { LogWriter } from '../interfaces/log-writer.interface';
interface LogOptions {
    userId?: string;
    tenantId?: string;
    duration?: number;
    errorCode?: string;
    errorMessage?: string;
    extra?: Record<string, any>;
    requestId?: string;
    status?: 'success' | 'failure' | 'partial';
}
export declare class StructuredLoggerService implements OnModuleDestroy {
    private readonly writers;
    private readonly requestIdMap;
    private readonly serviceName;
    private readonly environment;
    constructor(writers?: LogWriter[]);
    generateRequestId(): string;
    setRequestId(requestId: string): void;
    getCurrentRequestId(): string;
    private createBaseLog;
    log(level: StructuredLog['level'], module: string, action: string, status: StructuredLog['status'], options?: {
        userId?: string;
        tenantId?: string;
        duration?: number;
        errorCode?: string;
        errorMessage?: string;
        extra?: Record<string, any>;
        requestId?: string;
    }): Promise<void>;
    info(module: string, action: string, options?: LogOptions & {
        status?: 'success' | 'failure' | 'partial';
    }): Promise<void>;
    error(module: string, action: string, error: Error | string, options?: LogOptions): Promise<void>;
    warn(module: string, action: string, message: string, options?: LogOptions): Promise<void>;
    debug(module: string, action: string, options?: LogOptions & {
        status?: 'success' | 'failure' | 'partial';
    }): Promise<void>;
    verbose(module: string, action: string, options?: LogOptions & {
        status?: 'success' | 'failure' | 'partial';
    }): Promise<void>;
    measure<T>(module: string, action: string, operation: () => Promise<T> | T, options?: LogOptions): Promise<T>;
    onModuleDestroy(): Promise<void>;
}
export {};
