import { FeatureConfigService } from '../services/feature-config.service';
import { FeatureConfig } from '../../../entities/feature-config.entity';
import { CreateFeatureConfigDto, UpdateFeatureConfigDto } from '../dto/feature-config.dto';
export declare class FeatureConfigController {
    private readonly featureConfigService;
    constructor(featureConfigService: FeatureConfigService);
    getFeatureConfigs(page?: number, pageSize?: number, isEnabled?: string, tenantType?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: FeatureConfig[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getFeatureConfig(featureKey: string): Promise<FeatureConfig | null>;
    createFeatureConfig(createFeatureConfigDto: CreateFeatureConfigDto): Promise<FeatureConfig>;
    updateFeatureConfig(featureKey: string, updateFeatureConfigDto: UpdateFeatureConfigDto): Promise<FeatureConfig>;
    deleteFeatureConfig(featureKey: string): Promise<void>;
    batchEnableFeatures(body: {
        featureKeys: string[];
    }): Promise<{
        success: boolean;
        updated: number;
    }>;
    batchDisableFeatures(body: {
        featureKeys: string[];
    }): Promise<{
        success: boolean;
        updated: number;
    }>;
}
