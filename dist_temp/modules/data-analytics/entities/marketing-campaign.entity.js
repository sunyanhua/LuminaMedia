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
exports.MarketingCampaign = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../../entities/user.entity");
const customer_profile_entity_1 = require("../../../entities/customer-profile.entity");
const campaign_type_enum_1 = require("../../../shared/enums/campaign-type.enum");
const campaign_status_enum_1 = require("../../../shared/enums/campaign-status.enum");
const marketing_strategy_entity_1 = require("./marketing-strategy.entity");
let MarketingCampaign = class MarketingCampaign {
    id;
    userId;
    user;
    customerProfileId;
    customerProfile;
    tenantId;
    name;
    campaignType;
    targetAudience;
    budget;
    status;
    startDate;
    endDate;
    createdAt;
    strategies;
};
exports.MarketingCampaign = MarketingCampaign;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MarketingCampaign.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], MarketingCampaign.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MarketingCampaign.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'customer_profile_id',
        type: 'varchar',
        length: 36,
        nullable: true,
    }),
    __metadata("design:type", String)
], MarketingCampaign.prototype, "customerProfileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_profile_entity_1.CustomerProfile, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_profile_id' }),
    __metadata("design:type", customer_profile_entity_1.CustomerProfile)
], MarketingCampaign.prototype, "customerProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], MarketingCampaign.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], MarketingCampaign.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'campaign_type',
        type: 'enum',
        enum: campaign_type_enum_1.CampaignType,
    }),
    __metadata("design:type", String)
], MarketingCampaign.prototype, "campaignType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_audience', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], MarketingCampaign.prototype, "targetAudience", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'budget',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", Number)
], MarketingCampaign.prototype, "budget", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: campaign_status_enum_1.CampaignStatus,
        default: campaign_status_enum_1.CampaignStatus.DRAFT,
    }),
    __metadata("design:type", String)
], MarketingCampaign.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], MarketingCampaign.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], MarketingCampaign.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MarketingCampaign.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => marketing_strategy_entity_1.MarketingStrategy, (strategy) => strategy.campaign),
    __metadata("design:type", Array)
], MarketingCampaign.prototype, "strategies", void 0);
exports.MarketingCampaign = MarketingCampaign = __decorate([
    (0, typeorm_1.Entity)('marketing_campaigns'),
    (0, typeorm_1.Index)(['userId', 'status']),
    (0, typeorm_1.Index)(['customerProfileId', 'status']),
    (0, typeorm_1.Index)(['startDate', 'endDate']),
    (0, typeorm_1.Index)(['tenantId'])
], MarketingCampaign);
//# sourceMappingURL=marketing-campaign.entity.js.map