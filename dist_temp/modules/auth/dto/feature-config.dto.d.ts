export declare class CreateFeatureConfigDto {
    featureKey: string;
    featureName: string;
    description: string;
    isEnabled?: boolean;
    tenantType?: string;
    defaultQuota?: number;
    featureCategory?: string;
}
export declare class UpdateFeatureConfigDto {
    featureName?: string;
    description?: string;
    isEnabled?: boolean;
    tenantType?: string;
    defaultQuota?: number;
    featureCategory?: string;
}
