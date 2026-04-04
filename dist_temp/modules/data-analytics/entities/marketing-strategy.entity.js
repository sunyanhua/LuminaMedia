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
exports.MarketingStrategy = void 0;
const typeorm_1 = require("typeorm");
const marketing_campaign_entity_1 = require("./marketing-campaign.entity");
const customer_profile_entity_1 = require("../../../entities/customer-profile.entity");
const strategy_type_enum_1 = require("../../../shared/enums/strategy-type.enum");
const generation_method_enum_1 = require("../../../shared/enums/generation-method.enum");
const gemini_interface_1 = require("../interfaces/gemini.interface");
let MarketingStrategy = class MarketingStrategy {
    id;
    tenantId;
    campaignId;
    campaign;
    customerProfileId;
    customerProfile;
    strategyType;
    description;
    implementationPlan;
    expectedROI;
    confidenceScore;
    generatedBy;
    createdAt;
    campaignName;
    targetAudienceAnalysis;
    coreIdea;
    xhsContent;
    wechatFullPlan;
    recommendedExecutionTime;
    expectedPerformanceMetrics;
    executionSteps;
    riskAssessment;
    budgetAllocation;
    aiResponseRaw;
    aiEngine;
    generatedContentIds;
    contentPlatforms;
};
exports.MarketingStrategy = MarketingStrategy;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'campaign_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "campaignId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => marketing_campaign_entity_1.MarketingCampaign, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'campaign_id' }),
    __metadata("design:type", marketing_campaign_entity_1.MarketingCampaign)
], MarketingStrategy.prototype, "campaign", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'customer_profile_id',
        type: 'varchar',
        length: 36,
        nullable: true,
    }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "customerProfileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_profile_entity_1.CustomerProfile, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_profile_id' }),
    __metadata("design:type", customer_profile_entity_1.CustomerProfile)
], MarketingStrategy.prototype, "customerProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'strategy_type',
        type: 'enum',
        enum: strategy_type_enum_1.StrategyType,
    }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "strategyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text' }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'implementation_plan', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], MarketingStrategy.prototype, "implementationPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'expected_roi',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "expectedROI", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'confidence_score',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "confidenceScore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'generated_by',
        type: 'enum',
        enum: generation_method_enum_1.GenerationMethod,
        default: generation_method_enum_1.GenerationMethod.AI_GENERATED,
    }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "generatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MarketingStrategy.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'campaign_name',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "campaignName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_audience_analysis', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], MarketingStrategy.prototype, "targetAudienceAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'core_idea', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "coreIdea", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'xhs_content', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "xhsContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wechat_full_plan', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], MarketingStrategy.prototype, "wechatFullPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recommended_execution_time', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], MarketingStrategy.prototype, "recommendedExecutionTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'expected_performance_metrics',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Object)
], MarketingStrategy.prototype, "expectedPerformanceMetrics", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'execution_steps', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], MarketingStrategy.prototype, "executionSteps", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_assessment', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], MarketingStrategy.prototype, "riskAssessment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_allocation', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], MarketingStrategy.prototype, "budgetAllocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_response_raw', type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "aiResponseRaw", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'ai_engine',
        type: 'enum',
        enum: gemini_interface_1.AIEngine,
        nullable: true,
        default: gemini_interface_1.AIEngine.FALLBACK,
    }),
    __metadata("design:type", String)
], MarketingStrategy.prototype, "aiEngine", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'generated_content_ids',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Array)
], MarketingStrategy.prototype, "generatedContentIds", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'content_platforms',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Array)
], MarketingStrategy.prototype, "contentPlatforms", void 0);
exports.MarketingStrategy = MarketingStrategy = __decorate([
    (0, typeorm_1.Entity)('marketing_strategies'),
    (0, typeorm_1.Index)(['campaignId']),
    (0, typeorm_1.Index)(['customerProfileId']),
    (0, typeorm_1.Index)(['strategyType']),
    (0, typeorm_1.Index)(['confidenceScore']),
    (0, typeorm_1.Index)(['tenantId'])
], MarketingStrategy);
//# sourceMappingURL=marketing-strategy.entity.js.map