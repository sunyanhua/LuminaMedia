import { CloudProvider, StorageService, AIService, DatabaseService, MessagingService } from '../cloud-provider.interface';
export declare class PrivateDeployAdapter implements CloudProvider {
    storage: StorageService;
    ai: AIService;
    database: DatabaseService;
    messaging: MessagingService;
    constructor();
    getName(): string;
    initialize(): Promise<void>;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details?: Record<string, any>;
    }>;
    cleanup(): Promise<void>;
}
