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
exports.TenantFeatureToggle = exports.FeatureConfig = void 0;
const typeorm_1 = require("typeorm");
let FeatureConfig = class FeatureConfig {
    id;
    featureKey;
    featureName;
    description;
    isEnabled;
    tenantType;
    configData;
    createdAt;
    updatedAt;
};
exports.FeatureConfig = FeatureConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FeatureConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], FeatureConfig.prototype, "featureKey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FeatureConfig.prototype, "featureName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], FeatureConfig.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], FeatureConfig.prototype, "isEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], FeatureConfig.prototype, "tenantType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], FeatureConfig.prototype, "configData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FeatureConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FeatureConfig.prototype, "updatedAt", void 0);
exports.FeatureConfig = FeatureConfig = __decorate([
    (0, typeorm_1.Entity)('feature_configs')
], FeatureConfig);
let TenantFeatureToggle = class TenantFeatureToggle {
    id;
    tenantId;
    featureKey;
    isEnabled;
    quotaConfig;
    createdAt;
    updatedAt;
};
exports.TenantFeatureToggle = TenantFeatureToggle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TenantFeatureToggle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], TenantFeatureToggle.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], TenantFeatureToggle.prototype, "featureKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], TenantFeatureToggle.prototype, "isEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], TenantFeatureToggle.prototype, "quotaConfig", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TenantFeatureToggle.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TenantFeatureToggle.prototype, "updatedAt", void 0);
exports.TenantFeatureToggle = TenantFeatureToggle = __decorate([
    (0, typeorm_1.Entity)('tenant_feature_toggles')
], TenantFeatureToggle);
//# sourceMappingURL=feature-config.entity.js.map