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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const tenant_feature_service_1 = require("../services/tenant-feature.service");
const feature_config_service_1 = require("../services/feature-config.service");
let FeatureGuard = class FeatureGuard {
    reflector;
    tenantFeatureService;
    featureConfigService;
    constructor(reflector, tenantFeatureService, featureConfigService) {
        this.reflector = reflector;
        this.tenantFeatureService = tenantFeatureService;
        this.featureConfigService = featureConfigService;
    }
    canActivate(context) {
        const requiredFeatures = this.reflector.getAllAndOverride('features', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredFeatures || requiredFeatures.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const tenantId = request.user?.tenantId || request.headers['x-tenant-id'];
        if (!tenantId) {
            return false;
        }
        return this.checkTenantFeatures(tenantId, requiredFeatures);
    }
    async checkTenantFeatures(tenantId, features) {
        for (const feature of features) {
            const hasAccess = await this.featureConfigService.canTenantUseFeature(tenantId, feature);
            if (!hasAccess) {
                return false;
            }
        }
        return true;
    }
};
exports.FeatureGuard = FeatureGuard;
exports.FeatureGuard = FeatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        tenant_feature_service_1.TenantFeatureService,
        feature_config_service_1.FeatureConfigService])
], FeatureGuard);
//# sourceMappingURL=feature.guard.js.map