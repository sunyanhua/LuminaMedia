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
exports.GeoAnalysisController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const feature_guard_1 = require("../../../auth/guards/feature.guard");
const feature_decorator_1 = require("../../../auth/decorators/feature.decorator");
const geo_analysis_service_1 = require("../services/geo-analysis.service");
const geo_analysis_request_dto_1 = require("../dto/geo-analysis-request.dto");
let GeoAnalysisController = class GeoAnalysisController {
    geoAnalysisService;
    constructor(geoAnalysisService) {
        this.geoAnalysisService = geoAnalysisService;
    }
    async analyze(request) {
        return this.geoAnalysisService.analyze(request);
    }
    async getAnalysisResult(analysisId) {
        return this.geoAnalysisService.getAnalysisResult(analysisId);
    }
    async getRegions(tenantId, regionLevel, regionType) {
        const filters = {};
        if (regionLevel)
            filters.regionLevel = regionLevel;
        if (regionType)
            filters.regionType = regionType;
        return this.geoAnalysisService.getRegions(tenantId, filters);
    }
    async getSeoSuggestions(tenantId, suggestionType, priority) {
        const filters = {};
        if (suggestionType)
            filters.suggestionType = suggestionType;
        if (priority)
            filters.priority = priority;
        return this.geoAnalysisService.getSeoSuggestions(tenantId, filters);
    }
};
exports.GeoAnalysisController = GeoAnalysisController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, swagger_1.ApiOperation)({
        summary: '发起地理分析',
        description: '根据请求参数发起地理分析，返回分析ID和初始状态',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '分析任务已创建', type: Object }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数无效' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: '分析过程中发生错误' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [geo_analysis_request_dto_1.GeoAnalysisRequestDto]),
    __metadata("design:returntype", Promise)
], GeoAnalysisController.prototype, "analyze", null);
__decorate([
    (0, common_1.Get)('results/:analysisId'),
    (0, swagger_1.ApiOperation)({
        summary: '获取分析结果',
        description: '根据分析ID获取地理分析结果',
    }),
    (0, swagger_1.ApiParam)({ name: 'analysisId', description: '分析记录ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回分析结果' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '分析结果不存在' }),
    __param(0, (0, common_1.Param)('analysisId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeoAnalysisController.prototype, "getAnalysisResult", null);
__decorate([
    (0, common_1.Get)('regions'),
    (0, swagger_1.ApiOperation)({
        summary: '获取地区列表',
        description: '根据租户ID和过滤条件获取地区列表',
    }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true, description: '租户ID' }),
    (0, swagger_1.ApiQuery)({ name: 'regionLevel', required: false, description: '地区级别' }),
    (0, swagger_1.ApiQuery)({ name: 'regionType', required: false, description: '地区类型' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回地区列表' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('regionLevel')),
    __param(2, (0, common_1.Query)('regionType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GeoAnalysisController.prototype, "getRegions", null);
__decorate([
    (0, common_1.Get)('seo-suggestions'),
    (0, swagger_1.ApiOperation)({
        summary: '获取SEO建议',
        description: '根据租户ID和过滤条件获取SEO优化建议',
    }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true, description: '租户ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'suggestionType',
        required: false,
        description: '建议类型',
    }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, description: '优先级' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回SEO建议列表' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('suggestionType')),
    __param(2, (0, common_1.Query)('priority')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GeoAnalysisController.prototype, "getSeoSuggestions", null);
exports.GeoAnalysisController = GeoAnalysisController = __decorate([
    (0, swagger_1.ApiTags)('GEO分析'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('geo-analysis'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, feature_decorator_1.Feature)('geo-analysis'),
    __metadata("design:paramtypes", [geo_analysis_service_1.GeoAnalysisService])
], GeoAnalysisController);
//# sourceMappingURL=geo-analysis.controller.js.map