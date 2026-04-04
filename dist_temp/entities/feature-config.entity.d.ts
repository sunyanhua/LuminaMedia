export declare class FeatureConfig {
    id: number;
    featureKey: string;
    featureName: string;
    description?: string;
    isEnabled: boolean;
    tenantType?: string;
    configData?: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TenantFeatureToggle {
    id: number;
    tenantId: string;
    featureKey: string;
    isEnabled: boolean;
    quotaConfig?: any;
    createdAt: Date;
    updatedAt: Date;
}
