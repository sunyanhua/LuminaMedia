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
exports.GeoAnalysisRequestDto = exports.AnalysisOptionsDto = exports.TimeRangeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const geo_analysis_interface_1 = require("../interfaces/geo-analysis.interface");
class TimeRangeDto {
    start;
    end;
}
exports.TimeRangeDto = TimeRangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: Date, description: '开始时间' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], TimeRangeDto.prototype, "start", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Date, description: '结束时间' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], TimeRangeDto.prototype, "end", void 0);
class AnalysisOptionsDto {
    includeVisualizations = true;
    includeRecommendations = true;
    language = 'zh-CN';
    depth = 'standard';
}
exports.AnalysisOptionsDto = AnalysisOptionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: Boolean,
        description: '是否包含可视化',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AnalysisOptionsDto.prototype, "includeVisualizations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: Boolean,
        description: '是否包含推荐建议',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AnalysisOptionsDto.prototype, "includeRecommendations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: String, description: '语言', default: 'zh-CN' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalysisOptionsDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['basic', 'standard', 'comprehensive'],
        description: '分析深度',
        default: 'standard',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['basic', 'standard', 'comprehensive']),
    __metadata("design:type", String)
], AnalysisOptionsDto.prototype, "depth", void 0);
class GeoAnalysisRequestDto {
    tenantId;
    customerProfileId;
    targetRegionIds;
    targetRegionNames;
    analysisTypes;
    timeRange;
    competitors;
    industries;
    keywords;
    metrics;
    regionLevel;
    dataSources;
    options;
}
exports.GeoAnalysisRequestDto = GeoAnalysisRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, description: '租户ID' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoAnalysisRequestDto.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: String, description: '客户档案ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GeoAnalysisRequestDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: '目标地区ID列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GeoAnalysisRequestDto.prototype, "targetRegionIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: '目标地区名称列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GeoAnalysisRequestDto.prototype, "targetRegionNames", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: geo_analysis_interface_1.AnalysisType,
        isArray: true,
        description: '分析类型列表',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(geo_analysis_interface_1.AnalysisType, { each: true }),
    __metadata("design:type", Array)
], GeoAnalysisRequestDto.prototype, "analysisTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: TimeRangeDto, description: '时间范围' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TimeRangeDto),
    __metadata("design:type", TimeRangeDto)
], GeoAnalysisRequestDto.prototype, "timeRange", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: '竞争对手列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GeoAnalysisRequestDto.prototype, "competitors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: '行业列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GeoAnalysisRequestDto.prototype, "industries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: '关键词列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GeoAnalysisRequestDto.prototype, "keywords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: '指标列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GeoAnalysisRequestDto.prototype, "metrics", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: geo_analysis_interface_1.RegionLevel, description: '地区级别' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(geo_analysis_interface_1.RegionLevel),
    __metadata("design:type", String)
], GeoAnalysisRequestDto.prototype, "regionLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: '数据源列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GeoAnalysisRequestDto.prototype, "dataSources", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: AnalysisOptionsDto, description: '分析选项' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AnalysisOptionsDto),
    __metadata("design:type", AnalysisOptionsDto)
], GeoAnalysisRequestDto.prototype, "options", void 0);
//# sourceMappingURL=geo-analysis-request.dto.js.map