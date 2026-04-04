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
exports.SentimentAnalysisController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const feature_guard_1 = require("../../../auth/guards/feature.guard");
const feature_decorator_1 = require("../../../auth/decorators/feature.decorator");
const sentiment_analysis_service_1 = require("../services/sentiment-analysis.service");
class SentimentAnalysisRequestDto {
    text;
    platform;
    industry;
    target;
}
class BatchSentimentAnalysisRequestDto {
    requests;
}
class SentimentTrendRequestDto {
    texts;
    timeInterval;
    industry;
}
class AlertCheckRequestDto {
    texts;
    rules;
}
let SentimentAnalysisController = class SentimentAnalysisController {
    sentimentService;
    constructor(sentimentService) {
        this.sentimentService = sentimentService;
    }
    async analyzeText(request) {
        try {
            return await this.sentimentService.analyzeText(request);
        }
        catch (error) {
            throw new common_1.HttpException(`情感分析失败: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async analyzeTexts(request) {
        try {
            return await this.sentimentService.analyzeTexts(request.requests);
        }
        catch (error) {
            throw new common_1.HttpException(`批量情感分析失败: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async analyzeTrend(request) {
        try {
            const textsWithDates = request.texts.map((item) => ({
                text: item.text,
                timestamp: new Date(item.timestamp),
            }));
            return await this.sentimentService.analyzeTrend(textsWithDates, {
                timeInterval: request.timeInterval,
                industry: request.industry,
            });
        }
        catch (error) {
            throw new common_1.HttpException(`情感趋势分析失败: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async checkAlerts(request) {
        try {
            const textsWithDates = request.texts.map((item) => ({
                text: item.text,
                timestamp: new Date(item.timestamp),
            }));
            return await this.sentimentService.checkAlerts(textsWithDates, request.rules);
        }
        catch (error) {
            throw new common_1.HttpException(`预警检查失败: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async healthCheck() {
        try {
            const providersHealth = await this.sentimentService.getProvidersHealth();
            const hasHealthyProvider = Object.values(providersHealth).some((health) => health.healthy);
            return {
                status: hasHealthyProvider ? 'healthy' : 'unhealthy',
                providers: providersHealth,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`健康检查失败: ${error.message}`, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    async getProviders() {
        return {
            providers: ['lexicon', 'gemini'],
        };
    }
    async testAnalysis(request) {
        try {
            const result = await this.sentimentService.analyzeText(request);
            return {
                success: true,
                result,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.SentimentAnalysisController = SentimentAnalysisController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, swagger_1.ApiOperation)({ summary: '分析单个文本的情感' }),
    (0, swagger_1.ApiBody)({ type: SentimentAnalysisRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: '情感分析结果',
        type: Object,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: '请求参数无效',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SentimentAnalysisRequestDto]),
    __metadata("design:returntype", Promise)
], SentimentAnalysisController.prototype, "analyzeText", null);
__decorate([
    (0, common_1.Post)('analyze-batch'),
    (0, swagger_1.ApiOperation)({ summary: '批量分析文本情感' }),
    (0, swagger_1.ApiBody)({ type: BatchSentimentAnalysisRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: '批量情感分析结果',
        type: Array,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BatchSentimentAnalysisRequestDto]),
    __metadata("design:returntype", Promise)
], SentimentAnalysisController.prototype, "analyzeTexts", null);
__decorate([
    (0, common_1.Post)('analyze-trend'),
    (0, swagger_1.ApiOperation)({ summary: '分析情感趋势' }),
    (0, swagger_1.ApiBody)({ type: SentimentTrendRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: '情感趋势分析结果',
        type: Object,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SentimentTrendRequestDto]),
    __metadata("design:returntype", Promise)
], SentimentAnalysisController.prototype, "analyzeTrend", null);
__decorate([
    (0, common_1.Post)('check-alerts'),
    (0, swagger_1.ApiOperation)({ summary: '检查情感预警' }),
    (0, swagger_1.ApiBody)({ type: AlertCheckRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: '情感预警检查结果',
        type: Array,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AlertCheckRequestDto]),
    __metadata("design:returntype", Promise)
], SentimentAnalysisController.prototype, "checkAlerts", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: '情感分析服务健康检查' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: '服务健康状态',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SentimentAnalysisController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('providers'),
    (0, swagger_1.ApiOperation)({ summary: '获取可用的情感分析提供商' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: '提供商列表',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SentimentAnalysisController.prototype, "getProviders", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, swagger_1.ApiOperation)({ summary: '测试情感分析功能' }),
    (0, swagger_1.ApiBody)({ type: SentimentAnalysisRequestDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SentimentAnalysisRequestDto]),
    __metadata("design:returntype", Promise)
], SentimentAnalysisController.prototype, "testAnalysis", null);
exports.SentimentAnalysisController = SentimentAnalysisController = __decorate([
    (0, swagger_1.ApiTags)('sentiment-analysis'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sentiment-analysis'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, feature_decorator_1.Feature)('sentiment-analysis'),
    __metadata("design:paramtypes", [sentiment_analysis_service_1.SentimentAnalysisService])
], SentimentAnalysisController);
//# sourceMappingURL=sentiment-analysis.controller.js.map