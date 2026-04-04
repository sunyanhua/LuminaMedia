import { Repository } from 'typeorm';
import { TenantFeatureToggle } from '../../../entities/feature-config.entity';
export declare class TenantFeatureService {
    private tenantFeatureToggleRepository;
    constructor(tenantFeatureToggleRepository: Repository<TenantFeatureToggle>);
    getTenantFeatures(tenantId: string): Promise<TenantFeatureToggle[]>;
    getTenantFeature(tenantId: string, featureKey: string): Promise<TenantFeatureToggle | null>;
    enableFeatureForTenant(tenantId: string, featureKey: string, quotaConfig?: any): Promise<TenantFeatureToggle>;
    disableFeatureForTenant(tenantId: string, featureKey: string): Promise<TenantFeatureToggle>;
    setFeatureForTenant(tenantId: string, featureKey: string, isEnabled: boolean, quotaConfig?: any): Promise<TenantFeatureToggle>;
    batchSetFeaturesForTenant(tenantId: string, features: Array<{
        featureKey: string;
        isEnabled: boolean;
        quotaConfig?: any;
    }>): Promise<TenantFeatureToggle[]>;
    initializeTenantFeatures(tenantId: string, defaultEnabledFeatures: string[]): Promise<TenantFeatureToggle[]>;
    checkTenantFeatureAccess(tenantId: string, featureKey: string): Promise<boolean>;
}
