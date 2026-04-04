import { Repository } from 'typeorm';
import { FeatureConfig, TenantFeatureToggle } from '../../../entities/feature-config.entity';
export declare class FeatureConfigService {
    private featureConfigRepository;
    private tenantFeatureToggleRepository;
    constructor(featureConfigRepository: Repository<FeatureConfig>, tenantFeatureToggleRepository: Repository<TenantFeatureToggle>);
    getAllFeatureConfigs(page?: number, pageSize?: number, where?: any, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<[FeatureConfig[], number]>;
    getFeatureConfigByKey(featureKey: string): Promise<FeatureConfig | null>;
    createFeatureConfig(data: Partial<FeatureConfig>): Promise<FeatureConfig>;
    updateFeatureConfig(featureKey: string, data: Partial<FeatureConfig>): Promise<FeatureConfig>;
    deleteFeatureConfig(featureKey: string): Promise<void>;
    initializeDefaultFeatures(): Promise<void>;
    canTenantUseFeature(tenantId: string, featureKey: string): Promise<boolean>;
}
