import { TenantFeatureService } from '../services/tenant-feature.service';
import { TenantFeatureToggle } from '../../../entities/feature-config.entity';
import { EnableFeatureForTenantDto, DisableFeatureForTenantDto, BatchEnableFeaturesDto, BatchDisableFeaturesDto } from '../dto/tenant-feature.dto';
export declare class TenantFeatureController {
    private readonly tenantFeatureService;
    constructor(tenantFeatureService: TenantFeatureService);
    getTenantFeatures(tenantId: string, featureKey?: string, isEnabled?: string): Promise<TenantFeatureToggle[]>;
    getTenantFeature(featureKey: string, tenantId: string): Promise<TenantFeatureToggle | null>;
    enableTenantFeature(featureKey: string, enableDto: EnableFeatureForTenantDto): Promise<TenantFeatureToggle>;
    disableTenantFeature(featureKey: string, disableDto: DisableFeatureForTenantDto): Promise<TenantFeatureToggle>;
    batchEnableFeatures(batchEnableDto: BatchEnableFeaturesDto): Promise<{
        success: boolean;
        updated: number;
    }>;
    batchDisableFeatures(batchDisableDto: BatchDisableFeaturesDto): Promise<{
        success: boolean;
        updated: number;
    }>;
}
