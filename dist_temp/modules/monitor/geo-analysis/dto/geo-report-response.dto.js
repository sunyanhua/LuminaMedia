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
exports.GeoReportResponseDto = exports.GeoAnalysisResponseDto = exports.AnalysisMetadataDto = exports.GeoRecommendationDto = exports.GeoVisualizationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const geo_analysis_interface_1 = require("../interfaces/geo-analysis.interface");
class GeoVisualizationDto {
    id;
    type;
    title;
    description;
    data;
    format;
    interactive;
}
exports.GeoVisualizationDto = GeoVisualizationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '可视化ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoVisualizationDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['map', 'chart', 'table', 'heatmap', 'network'],
        description: '可视化类型',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(['map', 'chart', 'table', 'heatmap', 'network']),
    __metadata("design:type", String)
], GeoVisualizationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '标题' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoVisualizationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '描述' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoVisualizationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Object, description: '数据' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeoVisualizationDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['png', 'svg', 'html', 'json'], description: '格式' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(['png', 'svg', 'html', 'json']),
    __metadata("design:type", String)
], GeoVisualizationDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Boolean, description: '是否交互式' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Boolean)
], GeoVisualizationDto.prototype, "interactive", void 0);
class GeoRecommendationDto {
    id;
    category;
    title;
    description;
    priority;
    expectedImpact;
    implementationDifficulty;
    timeframe;
    estimatedCost;
    requiredResources;
    relatedRegions;
}
exports.GeoRecommendationDto = GeoRecommendationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '推荐ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoRecommendationDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['seo', 'content', 'marketing', 'product', 'partnership'],
        description: '类别',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(['seo', 'content', 'marketing', 'product', 'partnership']),
    __metadata("design:type", String)
], GeoRecommendationDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '标题' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoRecommendationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '描述' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoRecommendationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['low', 'medium', 'high', 'critical'],
        description: '优先级',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(['low', 'medium', 'high', 'critical']),
    __metadata("design:type", String)
], GeoRecommendationDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Number, description: '预期影响（0-100）' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GeoRecommendationDto.prototype, "expectedImpact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Number, description: '实施难度（0-100）' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GeoRecommendationDto.prototype, "implementationDifficulty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '时间框架' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoRecommendationDto.prototype, "timeframe", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Number, description: '预计成本' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GeoRecommendationDto.prototype, "estimatedCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: '所需资源' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GeoRecommendationDto.prototype, "requiredResources", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: '相关地区' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GeoRecommendationDto.prototype, "relatedRegions", void 0);
class AnalysisMetadataDto {
    processingTime;
    dataSourcesUsed;
    algorithmVersion;
    generatedAt;
}
exports.AnalysisMetadataDto = AnalysisMetadataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: Number, description: '处理时间（毫秒）' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AnalysisMetadataDto.prototype, "processingTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: '使用的数据源' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AnalysisMetadataDto.prototype, "dataSourcesUsed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '算法版本' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalysisMetadataDto.prototype, "algorithmVersion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Date, description: '生成时间' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], AnalysisMetadataDto.prototype, "generatedAt", void 0);
class GeoAnalysisResponseDto {
    analysisId;
    status;
    results;
    visualizations;
    recommendations;
    metadata;
}
exports.GeoAnalysisResponseDto = GeoAnalysisResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '分析ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoAnalysisResponseDto.prototype, "analysisId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: geo_analysis_interface_1.AnalysisStatus, description: '状态' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(geo_analysis_interface_1.AnalysisStatus),
    __metadata("design:type", String)
], GeoAnalysisResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Object, description: '分析结果' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeoAnalysisResponseDto.prototype, "results", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [GeoVisualizationDto],
        description: '可视化列表',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GeoVisualizationDto),
    __metadata("design:type", Array)
], GeoAnalysisResponseDto.prototype, "visualizations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [GeoRecommendationDto],
        description: '推荐列表',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GeoRecommendationDto),
    __metadata("design:type", Array)
], GeoAnalysisResponseDto.prototype, "recommendations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AnalysisMetadataDto, description: '元数据' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AnalysisMetadataDto),
    __metadata("design:type", AnalysisMetadataDto)
], GeoAnalysisResponseDto.prototype, "metadata", void 0);
class GeoReportResponseDto {
    reportId;
    tenantId;
    customerProfileId;
    generatedAt;
    timeframe;
    executiveSummary;
    regionalAnalysis;
    competitiveAnalysis;
    seoAnalysis;
    opportunityAnalysis;
    recommendations;
    implementationPlan;
    appendices;
}
exports.GeoReportResponseDto = GeoReportResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '报告ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoReportResponseDto.prototype, "reportId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '租户ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoReportResponseDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: String, description: '客户档案ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoReportResponseDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Date, description: '生成时间' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], GeoReportResponseDto.prototype, "generatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Object, description: '时间范围' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeoReportResponseDto.prototype, "timeframe", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Object, description: '执行摘要' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeoReportResponseDto.prototype, "executiveSummary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Object, description: '地区分析' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeoReportResponseDto.prototype, "regionalAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Object, description: '竞争分析' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeoReportResponseDto.prototype, "competitiveAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Object, description: 'SEO分析' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeoReportResponseDto.prototype, "seoAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Object, description: '机会分析' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeoReportResponseDto.prototype, "opportunityAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Object, description: '推荐建议' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeoReportResponseDto.prototype, "recommendations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Object, description: '实施计划' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeoReportResponseDto.prototype, "implementationPlan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Object, description: '附录' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GeoReportResponseDto.prototype, "appendices", void 0);
//# sourceMappingURL=geo-report-response.dto.js.map