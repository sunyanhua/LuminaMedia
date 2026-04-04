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
exports.GeoAnalysisResult = exports.AnalysisStatus = exports.AnalysisType = void 0;
const typeorm_1 = require("typeorm");
var AnalysisType;
(function (AnalysisType) {
    AnalysisType["REGIONAL_ANALYSIS"] = "regional_analysis";
    AnalysisType["COMPETITIVE_ANALYSIS"] = "competitive_analysis";
    AnalysisType["SEO_SUGGESTION"] = "seo_suggestion";
    AnalysisType["OPPORTUNITY_IDENTIFICATION"] = "opportunity_identification";
    AnalysisType["TREND_ANALYSIS"] = "trend_analysis";
})(AnalysisType || (exports.AnalysisType = AnalysisType = {}));
var AnalysisStatus;
(function (AnalysisStatus) {
    AnalysisStatus["PENDING"] = "pending";
    AnalysisStatus["PROCESSING"] = "processing";
    AnalysisStatus["COMPLETED"] = "completed";
    AnalysisStatus["FAILED"] = "failed";
})(AnalysisStatus || (exports.AnalysisStatus = AnalysisStatus = {}));
let GeoAnalysisResult = class GeoAnalysisResult {
    id;
    tenantId;
    customerProfileId;
    targetRegionId;
    targetRegionName;
    analysisType;
    status;
    inputParameters;
    regionalAnalysis;
    competitiveAnalysis;
    seoSuggestions;
    opportunityIdentification;
    trendAnalysis;
    overallScore;
    keyFindings;
    recommendations;
    visualizations;
    analysisStartedAt;
    analysisCompletedAt;
    processingTime;
    errorMessage;
    metadata;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
};
exports.GeoAnalysisResult = GeoAnalysisResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GeoAnalysisResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], GeoAnalysisResult.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], GeoAnalysisResult.prototype, "customerProfileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], GeoAnalysisResult.prototype, "targetRegionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GeoAnalysisResult.prototype, "targetRegionName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AnalysisType,
    }),
    __metadata("design:type", String)
], GeoAnalysisResult.prototype, "analysisType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AnalysisStatus,
        default: AnalysisStatus.PENDING,
    }),
    __metadata("design:type", String)
], GeoAnalysisResult.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoAnalysisResult.prototype, "inputParameters", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoAnalysisResult.prototype, "regionalAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoAnalysisResult.prototype, "competitiveAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoAnalysisResult.prototype, "seoSuggestions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoAnalysisResult.prototype, "opportunityIdentification", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoAnalysisResult.prototype, "trendAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], GeoAnalysisResult.prototype, "overallScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], GeoAnalysisResult.prototype, "keyFindings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], GeoAnalysisResult.prototype, "recommendations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], GeoAnalysisResult.prototype, "visualizations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], GeoAnalysisResult.prototype, "analysisStartedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], GeoAnalysisResult.prototype, "analysisCompletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GeoAnalysisResult.prototype, "processingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GeoAnalysisResult.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GeoAnalysisResult.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GeoAnalysisResult.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GeoAnalysisResult.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GeoAnalysisResult.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], GeoAnalysisResult.prototype, "updatedBy", void 0);
exports.GeoAnalysisResult = GeoAnalysisResult = __decorate([
    (0, typeorm_1.Entity)('geo_analysis_results'),
    (0, typeorm_1.Index)(['tenantId', 'customerProfileId', 'analysisType']),
    (0, typeorm_1.Index)(['tenantId', 'targetRegionId']),
    (0, typeorm_1.Index)(['tenantId', 'status']),
    (0, typeorm_1.Index)(['tenantId', 'createdAt'])
], GeoAnalysisResult);
//# sourceMappingURL=geo-analysis-result.entity.js.map