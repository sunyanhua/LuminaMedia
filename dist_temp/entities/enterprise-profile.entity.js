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
exports.EnterpriseProfile = void 0;
const typeorm_1 = require("typeorm");
const customer_profile_entity_1 = require("./customer-profile.entity");
const user_entity_1 = require("./user.entity");
let EnterpriseProfile = class EnterpriseProfile {
    id;
    tenantId;
    customerProfileId;
    customerProfile;
    createdBy;
    creator;
    industry;
    scale;
    region;
    profileData;
    status;
    analysisProgress;
    errorMessage;
    analysisReport;
    version;
    isCurrent;
    previousVersionId;
    featureVector;
    featuresExtractedAt;
    createdAt;
    updatedAt;
};
exports.EnterpriseProfile = EnterpriseProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EnterpriseProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], EnterpriseProfile.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_profile_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], EnterpriseProfile.prototype, "customerProfileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_profile_entity_1.CustomerProfile, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_profile_id' }),
    __metadata("design:type", customer_profile_entity_1.CustomerProfile)
], EnterpriseProfile.prototype, "customerProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], EnterpriseProfile.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], EnterpriseProfile.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], EnterpriseProfile.prototype, "industry", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['small', 'medium', 'large'],
        default: 'medium',
    }),
    __metadata("design:type", String)
], EnterpriseProfile.prototype, "scale", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], EnterpriseProfile.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profile_data', type: 'json' }),
    __metadata("design:type", Object)
], EnterpriseProfile.prototype, "profileData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'analyzing', 'completed', 'failed'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], EnterpriseProfile.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], EnterpriseProfile.prototype, "analysisProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EnterpriseProfile.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'analysis_report', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], EnterpriseProfile.prototype, "analysisReport", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], EnterpriseProfile.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_current', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], EnterpriseProfile.prototype, "isCurrent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'previous_version_id',
        type: 'varchar',
        length: 36,
        nullable: true,
    }),
    __metadata("design:type", String)
], EnterpriseProfile.prototype, "previousVersionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'feature_vector', type: 'json', nullable: true }),
    __metadata("design:type", Array)
], EnterpriseProfile.prototype, "featureVector", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'features_extracted_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], EnterpriseProfile.prototype, "featuresExtractedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EnterpriseProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], EnterpriseProfile.prototype, "updatedAt", void 0);
exports.EnterpriseProfile = EnterpriseProfile = __decorate([
    (0, typeorm_1.Entity)('enterprise_profiles'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['customerProfileId']),
    (0, typeorm_1.Index)(['industry']),
    (0, typeorm_1.Index)(['createdAt'])
], EnterpriseProfile);
//# sourceMappingURL=enterprise-profile.entity.js.map