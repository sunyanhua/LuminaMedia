import { CloudProvider } from './cloud-provider.interface';
export declare class CloudProviderFactory {
    private static instance;
    static getInstance(): Promise<CloudProvider>;
    private static createProvider;
    static destroyInstance(): void;
}
export declare function getCloudProvider(): Promise<CloudProvider>;
export declare function getStorageService(): Promise<import("./cloud-provider.interface").StorageService>;
export declare function getAIService(): Promise<import("./cloud-provider.interface").AIService>;
export declare function getDatabaseService(): Promise<import("./cloud-provider.interface").DatabaseService>;
export declare function getMessagingService(): Promise<import("./cloud-provider.interface").MessagingService>;
