import { PlatformAdapter, PlatformConfig, PlatformType } from '../interfaces/platform-adapter.interface';
export declare class PlatformAdapterFactory {
    private readonly logger;
    private readonly adapterRegistry;
    constructor();
    createAdapter(config: PlatformConfig): PlatformAdapter;
    createAdapters(configs: PlatformConfig[]): Map<PlatformType, PlatformAdapter>;
    getSupportedPlatformTypes(): PlatformType[];
    isPlatformSupported(platformType: PlatformType): boolean;
    getAdapterClass(platformType: PlatformType): new (config: PlatformConfig) => PlatformAdapter;
    registerAdapter(platformType: PlatformType, adapterClass: new (config: PlatformConfig) => PlatformAdapter): void;
    createDefaultAdapters(): Map<PlatformType, PlatformAdapter>;
    validateConfig(config: PlatformConfig): {
        valid: boolean;
        errors: string[];
    };
    private validateCredentials;
    initializeAdapters(adapters: Map<PlatformType, PlatformAdapter>): Promise<void>;
    cleanupAdapters(adapters: Map<PlatformType, PlatformAdapter>): Promise<void>;
}
