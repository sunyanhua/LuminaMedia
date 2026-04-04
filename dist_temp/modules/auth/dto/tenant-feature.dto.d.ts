export declare class EnableFeatureForTenantDto {
    tenantId: string;
    featureKey?: string;
    quotaConfig?: any;
}
export declare class DisableFeatureForTenantDto {
    tenantId: string;
    featureKey?: string;
}
export declare class BatchEnableFeaturesDto {
    tenantId: string;
    featureKeys: string[];
    quotaConfig?: any;
}
export declare class BatchDisableFeaturesDto {
    tenantId: string;
    featureKeys: string[];
}
