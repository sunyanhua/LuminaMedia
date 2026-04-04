"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureConfigService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feature_config_entity_1 = require("../../../entities/feature-config.entity");
let FeatureConfigService = class FeatureConfigService {
    featureConfigRepository;
    tenantFeatureToggleRepository;
    constructor(featureConfigRepository, tenantFeatureToggleRepository) {
        this.featureConfigRepository = featureConfigRepository;
        this.tenantFeatureToggleRepository = tenantFeatureToggleRepository;
    }
    async getAllFeatureConfigs(page = 1, pageSize = 20, where, sortBy, sortOrder) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const order = {};
        if (sortBy) {
            order[sortBy] = sortOrder || 'asc';
        }
        const [data, total] = await this.featureConfigRepository.findAndCount({
            where: where || {},
            skip,
            take,
            order,
        });
        return [data, total];
    }
    async getFeatureConfigByKey(featureKey) {
        return await this.featureConfigRepository.findOne({
            where: { featureKey },
        });
    }
    async createFeatureConfig(data) {
        const existing = await this.featureConfigRepository.findOne({
            where: { featureKey: data.featureKey },
        });
        if (existing) {
            throw new Error(`Feature with key ${data.featureKey} already exists`);
        }
        const featureConfig = this.featureConfigRepository.create(data);
        return await this.featureConfigRepository.save(featureConfig);
    }
    async updateFeatureConfig(featureKey, data) {
        const featureConfig = await this.getFeatureConfigByKey(featureKey);
        if (!featureConfig) {
            throw new Error(`Feature with key ${featureKey} not found`);
        }
        Object.assign(featureConfig, data);
        return await this.featureConfigRepository.save(featureConfig);
    }
    async deleteFeatureConfig(featureKey) {
        const result = await this.featureConfigRepository.delete({ featureKey });
        if (result.affected === 0) {
            throw new Error(`Feature with key ${featureKey} not found`);
        }
    }
    async initializeDefaultFeatures() {
        const defaultFeatures = [
            {
                featureKey: 'ai-analysis',
                featureName: 'AI数据分析',
                description: 'AI驱动的数据分析功能',
                isEnabled: true,
                tenantType: 'all',
            },
            {
                featureKey: 'ai-planning',
                featureName: 'AI智能策划',
                description: 'AI驱动的营销策划功能',
                isEnabled: true,
                tenantType: 'all',
            },
            {
                featureKey: 'ai-copywriting',
                featureName: 'AI智能文案',
                description: 'AI驱动的文案生成功能',
                isEnabled: true,
                tenantType: 'all',
            },
            {
                featureKey: 'matrix-publishing',
                featureName: '矩阵发布',
                description: '多渠道内容发布功能',
                isEnabled: true,
                tenantType: 'all',
            },
            {
                featureKey: 'customer-profile',
                featureName: '客户画像',
                description: '客户画像分析功能',
                isEnabled: true,
                tenantType: 'all',
            },
            {
                featureKey: 'social-monitoring',
                featureName: '舆情监测',
                description: '社交媒体舆情监测功能',
                isEnabled: true,
                tenantType: 'all',
            },
            {
                featureKey: 'data-visualization',
                featureName: '数据可视化',
                description: '数据可视化图表功能',
                isEnabled: true,
                tenantType: 'all',
            },
            {
                featureKey: 'workflow-management',
                featureName: '工作流管理',
                description: '内容审核工作流功能',
                isEnabled: true,
                tenantType: 'all',
            },
            {
                featureKey: 'government-content',
                featureName: '政务内容管理',
                description: '政务版专用内容管理功能',
                isEnabled: true,
                tenantType: 'government',
            },
        ];
        for (const featureData of defaultFeatures) {
            try {
                await this.createFeatureConfig(featureData);
            }
            catch (error) {
                if (error.message.includes('already exists')) {
                    continue;
                }
                throw error;
            }
        }
    }
    async canTenantUseFeature(tenantId, featureKey) {
        const globalFeature = await this.getFeatureConfigByKey(featureKey);
        if (!globalFeature || !globalFeature.isEnabled) {
            return false;
        }
        const tenantToggle = await this.tenantFeatureToggleRepository.findOne({
            where: {
                tenantId,
                featureKey,
            },
        });
        if (!tenantToggle) {
            if (globalFeature.tenantType && globalFeature.tenantType !== 'all') {
                return globalFeature.tenantType === (tenantId.includes('government') ? 'government' : 'business');
            }
            return true;
        }
        return tenantToggle.isEnabled;
    }
};
exports.FeatureConfigService = FeatureConfigService;
exports.FeatureConfigService = FeatureConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feature_config_entity_1.FeatureConfig)),
    __param(1, (0, typeorm_1.InjectRepository)(feature_config_entity_1.TenantFeatureToggle)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FeatureConfigService);
//# sourceMappingURL=feature-config.service.js.map