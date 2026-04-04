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
exports.GeoReportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const geo_analysis_service_1 = require("../services/geo-analysis.service");
let GeoReportController = class GeoReportController {
    geoAnalysisService;
    constructor(geoAnalysisService) {
        this.geoAnalysisService = geoAnalysisService;
    }
    async getReportSummary(analysisId) {
        const result = await this.geoAnalysisService.getAnalysisResult(analysisId);
        const summary = this.generateSummary(result);
        return {
            analysisId,
            generatedAt: new Date(),
            summary,
            keyFindings: result.keyFindings || [],
            recommendations: result.recommendations || [],
        };
    }
    async exportReport(analysisId, format = 'json', res) {
        const result = await this.geoAnalysisService.getAnalysisResult(analysisId);
        if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="geo-analysis-${analysisId}.pdf"`);
            res.send(JSON.stringify(result, null, 2));
        }
        else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="geo-analysis-${analysisId}.json"`);
            res.send(JSON.stringify(result, null, 2));
        }
    }
    async getRegionalInsights(tenantId, timeRangeStart, timeRangeEnd) {
        return {
            tenantId,
            timeRange: {
                start: timeRangeStart ||
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                end: timeRangeEnd || new Date().toISOString(),
            },
            regionalInsights: [
                {
                    region: '华东地区',
                    marketGrowth: 8.5,
                    digitalAdoption: 78,
                    competitiveIntensity: 65,
                    keyOpportunities: ['电商直播', '社区团购', '本地生活服务'],
                },
                {
                    region: '华南地区',
                    marketGrowth: 9.2,
                    digitalAdoption: 82,
                    competitiveIntensity: 72,
                    keyOpportunities: ['跨境电商', '智能制造', '数字娱乐'],
                },
                {
                    region: '华北地区',
                    marketGrowth: 7.8,
                    digitalAdoption: 75,
                    competitiveIntensity: 58,
                    keyOpportunities: ['企业服务', '科技创新', '文化创意'],
                },
            ],
            recommendations: [
                '重点关注数字化程度高的地区，如华南和华东',
                '针对不同地区的消费特点制定差异化营销策略',
                '加强在竞争强度较低地区的市场渗透',
            ],
        };
    }
    generateSummary(result) {
        if (!result) {
            return '分析结果尚未生成或数据不完整。';
        }
        const { regionalAnalysis, competitiveAnalysis, seoSuggestions, overallScore, } = result;
        let summary = `地理分析报告摘要（总体评分：${overallScore || 'N/A'}）\n\n`;
        if (regionalAnalysis) {
            summary += '📊 区域分析：\n';
            summary += `- 分析了${regionalAnalysis.demographicProfile?.data?.length || 0}个地区的人口、经济、文化和数字特征\n`;
            summary += `- 关键发现：${regionalAnalysis.demographicProfile?.keyInsights?.slice(0, 2).join('；') || '无'}\n\n`;
        }
        if (competitiveAnalysis) {
            summary += '🏆 竞争分析：\n';
            const competitorCount = competitiveAnalysis.competitorAnalysis?.competitors?.length || 0;
            summary += `- 识别了${competitorCount}个主要竞争对手\n`;
            summary += `- 市场概况：规模${competitiveAnalysis.marketOverview?.size ? Math.round(competitiveAnalysis.marketOverview.size / 100000000) : '未知'}亿元，增长率${competitiveAnalysis.marketOverview?.growth ? Math.round(competitiveAnalysis.marketOverview.growth * 100) : '未知'}%\n\n`;
        }
        if (seoSuggestions) {
            summary += '🔍 SEO优化建议：\n';
            const keywordCount = seoSuggestions.keywordOpportunities?.length || 0;
            summary += `- 发现了${keywordCount}个关键词机会\n`;
            summary += `- 提供了${seoSuggestions.contentLocalization?.culturalElements?.length || 0}个内容本地化建议\n\n`;
        }
        summary += '📈 实施建议：\n';
        summary += '- 优先实施高优先级的SEO优化建议\n';
        summary += '- 针对竞争较弱的地区加强市场推广\n';
        summary += '- 根据区域特征制定本地化营销策略\n';
        return summary;
    }
};
exports.GeoReportController = GeoReportController;
__decorate([
    (0, common_1.Get)(':analysisId/summary'),
    (0, swagger_1.ApiOperation)({
        summary: '获取分析报告摘要',
        description: '生成地理分析报告的文本摘要',
    }),
    (0, swagger_1.ApiParam)({ name: 'analysisId', description: '分析记录ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回报告摘要' }),
    __param(0, (0, common_1.Param)('analysisId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeoReportController.prototype, "getReportSummary", null);
__decorate([
    (0, common_1.Get)(':analysisId/export'),
    (0, swagger_1.ApiOperation)({
        summary: '导出分析报告',
        description: '将地理分析报告导出为指定格式',
    }),
    (0, swagger_1.ApiParam)({ name: 'analysisId', description: '分析记录ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'format',
        required: false,
        description: '导出格式（json/pdf）',
        enum: ['json', 'pdf'],
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回导出文件' }),
    __param(0, (0, common_1.Param)('analysisId')),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GeoReportController.prototype, "exportReport", null);
__decorate([
    (0, common_1.Get)('regional-insights'),
    (0, swagger_1.ApiOperation)({
        summary: '获取区域洞察报告',
        description: '基于多个分析结果生成区域洞察报告',
    }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: true, description: '租户ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'timeRangeStart',
        required: false,
        description: '时间范围开始',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'timeRangeEnd',
        required: false,
        description: '时间范围结束',
    }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('timeRangeStart')),
    __param(2, (0, common_1.Query)('timeRangeEnd')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GeoReportController.prototype, "getRegionalInsights", null);
exports.GeoReportController = GeoReportController = __decorate([
    (0, swagger_1.ApiTags)('GEO报告'),
    (0, common_1.Controller)('geo-reports'),
    __metadata("design:paramtypes", [geo_analysis_service_1.GeoAnalysisService])
], GeoReportController);
//# sourceMappingURL=geo-report.controller.js.map