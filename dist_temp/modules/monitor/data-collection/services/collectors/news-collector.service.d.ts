import { PlatformCollector } from '../interfaces/platform-collector.interface';
import { PlatformType, CollectionMethod, CollectedDataItem } from '../../interfaces/data-collection.interface';
export declare class NewsCollectorService implements PlatformCollector {
    getPlatform(): PlatformType;
    getSupportedMethods(): CollectionMethod[];
    validateCredentials(credentials: any): Promise<boolean>;
    collect(data: {
        credentials: any;
        config: any;
    }): Promise<CollectedDataItem[]>;
    testConnection(credentials: any): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }>;
}
