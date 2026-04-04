export interface IModuleService {
    initialize(): Promise<void>;
    getModuleName(): string;
    getModuleVersion(): string;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details?: Record<string, any>;
    }>;
    getDependencies(): string[];
    cleanup(): Promise<void>;
}
