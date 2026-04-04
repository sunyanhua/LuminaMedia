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
exports.TenantFeatureService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feature_config_entity_1 = require("../../../entities/feature-config.entity");
let TenantFeatureService = class TenantFeatureService {
    tenantFeatureToggleRepository;
    constructor(tenantFeatureToggleRepository) {
        this.tenantFeatureToggleRepository = tenantFeatureToggleRepository;
    }
    async getTenantFeatures(tenantId) {
        return await this.tenantFeatureToggleRepository.find({
            where: { tenantId },
        });
    }
    async getTenantFeature(tenantId, featureKey) {
        return await this.tenantFeatureToggleRepository.findOne({
            where: { tenantId, featureKey },
        });
    }
    async enableFeatureForTenant(tenantId, featureKey, quotaConfig) {
        return await this.setFeatureForTenant(tenantId, featureKey, true, quotaConfig);
    }
    async disableFeatureForTenant(tenantId, featureKey) {
        return await this.setFeatureForTenant(tenantId, featureKey, false);
    }
    async setFeatureForTenant(tenantId, featureKey, isEnabled, quotaConfig) {
        let tenantFeature = await this.getTenantFeature(tenantId, featureKey);
        if (tenantFeature) {
            tenantFeature.isEnabled = isEnabled;
            if (quotaConfig) {
                tenantFeature.quotaConfig = quotaConfig;
            }
            tenantFeature.updatedAt = new Date();
        }
        else {
            tenantFeature = this.tenantFeatureToggleRepository.create({
                tenantId,
                featureKey,
                isEnabled,
                quotaConfig,
            });
        }
        return await this.tenantFeatureToggleRepository.save(tenantFeature);
    }
    async batchSetFeaturesForTenant(tenantId, features) {
        const results = [];
        for (const feature of features) {
            const result = await this.setFeatureForTenant(tenantId, feature.featureKey, feature.isEnabled, feature.quotaConfig);
            results.push(result);
        }
        return results;
    }
    async initializeTenantFeatures(tenantId, defaultEnabledFeatures) {
        const results = [];
        for (const featureKey of defaultEnabledFeatures) {
            const result = await this.enableFeatureForTenant(tenantId, featureKey);
            results.push(result);
        }
        return results;
    }
    async checkTenantFeatureAccess(tenantId, featureKey) {
        const tenantFeature = await this.getTenantFeature(tenantId, featureKey);
        if (!tenantFeature) {
            return true;
        }
        return tenantFeature.isEnabled;
    }
};
exports.TenantFeatureService = TenantFeatureService;
exports.TenantFeatureService = TenantFeatureService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feature_config_entity_1.TenantFeatureToggle)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TenantFeatureService);
//# sourceMappingURL=tenant-feature.service.js.map