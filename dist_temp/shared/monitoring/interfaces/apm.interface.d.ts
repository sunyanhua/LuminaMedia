export interface ApmService {
    start(): Promise<void>;
    stop(): Promise<void>;
    createCustomTrace(operation: string, tags?: Record<string, any>, logs?: Record<string, any>): void;
    recordError(error: Error, context?: Record<string, any>): void;
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;
}
export interface ApmConfig {
    serviceName: string;
    serviceInstance: string;
    oapServer: string;
    sampleRate?: number;
    enabled: boolean;
}
