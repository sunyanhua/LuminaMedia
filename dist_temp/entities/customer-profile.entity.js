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
exports.CustomerProfile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const customer_type_enum_1 = require("../shared/enums/customer-type.enum");
const industry_enum_1 = require("../shared/enums/industry.enum");
const data_import_job_entity_1 = require("./data-import-job.entity");
const customer_segment_entity_1 = require("./customer-segment.entity");
const marketing_campaign_entity_1 = require("../modules/data-analytics/entities/marketing-campaign.entity");
const marketing_strategy_entity_1 = require("../modules/data-analytics/entities/marketing-strategy.entity");
let CustomerProfile = class CustomerProfile {
    id;
    tenantId;
    userId;
    user;
    customerName;
    customerType;
    industry;
    dataSources;
    profileData;
    behaviorInsights;
    isPreset;
    demoScenario;
    createdAt;
    updatedAt;
    importJobs;
    segments;
    campaigns;
    strategies;
};
exports.CustomerProfile = CustomerProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomerProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], CustomerProfile.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], CustomerProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], CustomerProfile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], CustomerProfile.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'customer_type',
        type: 'enum',
        enum: customer_type_enum_1.CustomerType,
        default: customer_type_enum_1.CustomerType.ENTERPRISE,
    }),
    __metadata("design:type", String)
], CustomerProfile.prototype, "customerType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'industry',
        type: 'enum',
        enum: industry_enum_1.Industry,
        default: industry_enum_1.Industry.OTHER,
    }),
    __metadata("design:type", String)
], CustomerProfile.prototype, "industry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_sources', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], CustomerProfile.prototype, "dataSources", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profile_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], CustomerProfile.prototype, "profileData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'behavior_insights', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], CustomerProfile.prototype, "behaviorInsights", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CustomerProfile.prototype, "isPreset", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CustomerProfile.prototype, "demoScenario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CustomerProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', nullable: true }),
    __metadata("design:type", Date)
], CustomerProfile.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => data_import_job_entity_1.DataImportJob, (importJob) => importJob.customerProfile),
    __metadata("design:type", Array)
], CustomerProfile.prototype, "importJobs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => customer_segment_entity_1.CustomerSegment, (segment) => segment.customerProfile),
    __metadata("design:type", Array)
], CustomerProfile.prototype, "segments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => marketing_campaign_entity_1.MarketingCampaign, (campaign) => campaign.customerProfile),
    __metadata("design:type", Array)
], CustomerProfile.prototype, "campaigns", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => marketing_strategy_entity_1.MarketingStrategy, (strategy) => strategy.customerProfile),
    __metadata("design:type", Array)
], CustomerProfile.prototype, "strategies", void 0);
exports.CustomerProfile = CustomerProfile = __decorate([
    (0, typeorm_1.Entity)('customer_profiles'),
    (0, typeorm_1.Index)(['userId', 'customerType']),
    (0, typeorm_1.Index)(['industry', 'createdAt']),
    (0, typeorm_1.Index)(['tenantId'])
], CustomerProfile);
//# sourceMappingURL=customer-profile.entity.js.map