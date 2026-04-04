import { CloudProvider, StorageService, AIService, DatabaseService, MessagingService } from '../cloud-provider.interface';
export declare class AliCloudAdapter implements CloudProvider {
    private useMock;
    storage: StorageService;
    ai: AIService;
    database: DatabaseService;
    messaging: MessagingService;
    private redis;
    constructor();
    getName(): string;
    getRedisService(): AliCloudRedisService;
    initialize(): Promise<void>;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details?: Record<string, any>;
    }>;
    cleanup(): Promise<void>;
}
declare class AliCloudRedisService {
    private useMock;
    private connected;
    constructor(useMock?: boolean);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    hset(key: string, field: string, value: string): Promise<void>;
    hget(key: string, field: string): Promise<string | null>;
    expire(key: string, ttl: number): Promise<void>;
    info(): Promise<Record<string, string>>;
    metrics(): Promise<{
        latency: number;
        throughput: number;
        memoryUsage: number;
        hitRate: number;
        connectedClients: number;
    }>;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        latency: number;
        memoryUsage: number;
    }>;
}
export {};
