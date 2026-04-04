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
exports.CustomerAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const feature_guard_1 = require("../../auth/guards/feature.guard");
const feature_decorator_1 = require("../../auth/decorators/feature.decorator");
const customer_analytics_service_1 = require("../services/customer-analytics.service");
const customer_segment_entity_1 = require("../../../entities/customer-segment.entity");
const segmentation_request_dto_1 = require("../dto/segmentation-request.dto");
let CustomerAnalyticsController = class CustomerAnalyticsController {
    customerAnalyticsService;
    constructor(customerAnalyticsService) {
        this.customerAnalyticsService = customerAnalyticsService;
    }
    async generateCustomerProfileAnalysis(profileId) {
        return await this.customerAnalyticsService.generateCustomerProfileAnalysis(profileId);
    }
    async getCustomerSegments(profileId) {
        return await this.customerAnalyticsService.getCustomerSegments(profileId);
    }
    async performCustomerSegmentation(profileId, segmentationRequest) {
        return await this.customerAnalyticsService.performCustomerSegmentation(profileId, segmentationRequest.segmentationRules);
    }
    async getDashboardData(profileId) {
        return await this.customerAnalyticsService.getDashboardData(profileId);
    }
    async refreshAnalysis(profileId) {
        return await this.customerAnalyticsService.generateCustomerProfileAnalysis(profileId);
    }
    async getSegmentDetail(profileId, segmentId) {
        return await this.customerAnalyticsService.getSegmentDetail(profileId, segmentId);
    }
    async updateSegment(profileId, segmentId, updates) {
        return await this.customerAnalyticsService.updateSegment(profileId, segmentId, updates);
    }
    async deleteSegment(profileId, segmentId) {
        await this.customerAnalyticsService.deleteSegment(profileId, segmentId);
    }
    async exportAnalysisReport(profileId) {
        const analysis = await this.customerAnalyticsService.generateCustomerProfileAnalysis(profileId);
        return {
            report: analysis,
            exportTimestamp: new Date().toISOString(),
            format: 'json',
            version: '1.0',
        };
    }
    async getRadarChartData(profileId) {
        return await this.customerAnalyticsService.getRadarChartData(profileId);
    }
    async getScatterChartData(profileId) {
        return await this.customerAnalyticsService.getScatterChartData(profileId);
    }
    async getHeatmapChartData(profileId) {
        return await this.customerAnalyticsService.getHeatmapChartData(profileId);
    }
    async getFunnelChartData(profileId) {
        return await this.customerAnalyticsService.getFunnelChartData(profileId);
    }
    async getSankeyChartData(profileId) {
        return await this.customerAnalyticsService.getSankeyChartData(profileId);
    }
    async getAllChartData(profileId) {
        return await this.customerAnalyticsService.getAllChartData(profileId);
    }
};
exports.CustomerAnalyticsController = CustomerAnalyticsController;
__decorate([
    (0, common_1.Get)('profiles/:profileId/analysis'),
    (0, swagger_1.ApiOperation)({
        summary: '获取客户画像分析报告',
        description: '获取指定客户档案的完整分析报告，包括人口统计、行为分析、消费分析和关键洞察',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                profileId: { type: 'string' },
                profileName: { type: 'string' },
                industry: { type: 'string' },
                analysisTimestamp: { type: 'string', format: 'date-time' },
                dataSummary: {
                    type: 'object',
                    properties: {
                        totalImportJobs: { type: 'number' },
                        completedImports: { type: 'number' },
                        totalRecords: { type: 'number' },
                        dataFreshness: { type: 'string' },
                        dataCompleteness: { type: 'number' },
                    },
                },
                demographicAnalysis: { type: 'object' },
                behavioralAnalysis: { type: 'object' },
                consumptionAnalysis: { type: 'object' },
                segmentationAnalysis: { type: 'object' },
                keyInsights: { type: 'array', items: { type: 'string' } },
                recommendations: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                            category: { type: 'string' },
                            recommendation: { type: 'string' },
                            expectedImpact: { type: 'string' },
                            timeframe: { type: 'string' },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "generateCustomerProfileAnalysis", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/segments'),
    (0, swagger_1.ApiOperation)({
        summary: '获取客户分群列表',
        description: '获取指定客户档案的所有客户分群列表',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        type: [customer_segment_entity_1.CustomerSegment],
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "getCustomerSegments", null);
__decorate([
    (0, common_1.Post)('profiles/:profileId/segments'),
    (0, swagger_1.ApiOperation)({
        summary: '执行客户分群',
        description: '根据规则对客户数据进行分群，生成客户分群结果',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiBody)({ type: segmentation_request_dto_1.SegmentationRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '分群执行成功',
        type: [customer_segment_entity_1.CustomerSegment],
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    __param(0, (0, common_1.Param)('profileId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, segmentation_request_dto_1.SegmentationRequestDto]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "performCustomerSegmentation", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/dashboard'),
    (0, swagger_1.ApiOperation)({
        summary: '获取客户分析仪表板数据',
        description: '获取客户档案的仪表板数据，用于前端可视化展示',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                overview: {
                    type: 'object',
                    properties: {
                        profileName: { type: 'string' },
                        industry: { type: 'string' },
                        customerType: { type: 'string' },
                        dataSources: { type: 'number' },
                    },
                },
                metrics: {
                    type: 'object',
                    properties: {
                        totalRecords: { type: 'number' },
                        totalSegments: { type: 'number' },
                        totalMembers: { type: 'number' },
                        dataCompleteness: { type: 'number' },
                        segmentationCoverage: { type: 'number' },
                    },
                },
                recentActivity: {
                    type: 'object',
                    properties: {
                        lastImport: { type: 'string', format: 'date-time' },
                        lastAnalysis: { type: 'string', format: 'date-time' },
                        segmentUpdate: { type: 'string', format: 'date-time' },
                    },
                },
                quickInsights: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "getDashboardData", null);
__decorate([
    (0, common_1.Post)('profiles/:profileId/analysis/refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '重新生成分析报告',
        description: '基于最新数据重新生成客户画像分析报告',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '报告重新生成成功',
        schema: {
            type: 'object',
            properties: {
                profileId: { type: 'string' },
                profileName: { type: 'string' },
                industry: { type: 'string' },
                analysisTimestamp: { type: 'string', format: 'date-time' },
                dataSummary: { type: 'object' },
                demographicAnalysis: { type: 'object' },
                behavioralAnalysis: { type: 'object' },
                consumptionAnalysis: { type: 'object' },
                segmentationAnalysis: { type: 'object' },
                keyInsights: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'object' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "refreshAnalysis", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/segments/:segmentId'),
    (0, swagger_1.ApiOperation)({
        summary: '获取客户分群详情',
        description: '获取指定客户分群的详细信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiParam)({ name: 'segmentId', description: '客户分群ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        type: customer_segment_entity_1.CustomerSegment,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户分群不存在' }),
    __param(0, (0, common_1.Param)('profileId')),
    __param(1, (0, common_1.Param)('segmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "getSegmentDetail", null);
__decorate([
    (0, common_1.Post)('profiles/:profileId/segments/:segmentId'),
    (0, swagger_1.ApiOperation)({
        summary: '更新客户分群',
        description: '更新指定客户分群的信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiParam)({ name: 'segmentId', description: '客户分群ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                segmentName: { type: 'string' },
                criteria: { type: 'object' },
                memberCount: { type: 'number' },
                description: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '更新成功',
        type: customer_segment_entity_1.CustomerSegment,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户分群不存在' }),
    __param(0, (0, common_1.Param)('profileId')),
    __param(1, (0, common_1.Param)('segmentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "updateSegment", null);
__decorate([
    (0, common_1.Post)('profiles/:profileId/segments/:segmentId/delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: '删除客户分群',
        description: '删除指定的客户分群',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiParam)({ name: 'segmentId', description: '客户分群ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户分群不存在' }),
    __param(0, (0, common_1.Param)('profileId')),
    __param(1, (0, common_1.Param)('segmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "deleteSegment", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/analysis/export'),
    (0, swagger_1.ApiOperation)({
        summary: '导出分析报告',
        description: '导出客户画像分析报告为JSON格式',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '导出成功',
        schema: {
            type: 'object',
            properties: {
                report: { type: 'object' },
                exportTimestamp: { type: 'string', format: 'date-time' },
                format: { type: 'string', enum: ['json'] },
                version: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "exportAnalysisReport", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/charts/radar'),
    (0, swagger_1.ApiOperation)({
        summary: '获取雷达图数据',
        description: '获取客户画像多维分析的雷达图数据',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                indicator: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            max: { type: 'number' },
                        },
                    },
                },
                seriesData: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            value: { type: 'array', items: { type: 'number' } },
                            name: { type: 'string' },
                        },
                    },
                },
                industryBenchmark: { type: 'object' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "getRadarChartData", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/charts/scatter'),
    (0, swagger_1.ApiOperation)({
        summary: '获取散点图数据',
        description: '获取消费频率与消费金额关系的散点图数据',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                dataPoints: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            visitFrequency: { type: 'number' },
                            spendingPerVisit: { type: 'number' },
                            totalSpending: { type: 'number' },
                            customerSegment: { type: 'string' },
                            customerId: { type: 'string' },
                        },
                    },
                },
                segments: { type: 'object' },
                correlation: { type: 'number' },
                insights: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "getScatterChartData", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/charts/heatmap'),
    (0, swagger_1.ApiOperation)({
        summary: '获取热力图数据',
        description: '获取时间与行为热度分布的热力图数据',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                xAxis: { type: 'array', items: { type: 'string' } },
                yAxis: { type: 'array', items: { type: 'string' } },
                data: {
                    type: 'array',
                    items: { type: 'array', items: { type: 'number' } },
                },
                peakPeriods: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            day: { type: 'string' },
                            hour: { type: 'string' },
                            value: { type: 'number' },
                        },
                    },
                },
                recommendations: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "getHeatmapChartData", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/charts/funnel'),
    (0, swagger_1.ApiOperation)({
        summary: '获取漏斗图数据',
        description: '获取客户转化路径的漏斗图数据',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                funnelStages: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            value: { type: 'number' },
                            description: { type: 'string' },
                        },
                    },
                },
                conversionRates: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            from: { type: 'string' },
                            to: { type: 'string' },
                            rate: { type: 'number' },
                        },
                    },
                },
                totalConversionRate: { type: 'number' },
                bottlenecks: { type: 'array', items: { type: 'string' } },
                optimizationSuggestions: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "getFunnelChartData", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/charts/sankey'),
    (0, swagger_1.ApiOperation)({
        summary: '获取桑基图数据',
        description: '获取客户分群流转关系的桑基图数据',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                nodes: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                        },
                    },
                },
                links: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            source: { type: 'string' },
                            target: { type: 'string' },
                            value: { type: 'number' },
                        },
                    },
                },
                totalFlowIn: { type: 'number' },
                totalFlowOut: { type: 'number' },
                netGrowth: { type: 'number' },
                retentionInsights: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "getSankeyChartData", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/charts/all'),
    (0, swagger_1.ApiOperation)({
        summary: '获取所有图表数据',
        description: '一次性获取所有类型的图表数据，用于仪表板展示',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                radar: { type: 'object' },
                scatter: { type: 'object' },
                heatmap: { type: 'object' },
                funnel: { type: 'object' },
                sankey: { type: 'object' },
                generatedAt: { type: 'string', format: 'date-time' },
                profileId: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAnalyticsController.prototype, "getAllChartData", null);
exports.CustomerAnalyticsController = CustomerAnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('customer-data'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/customer-data'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, feature_decorator_1.Feature)('customer-analytics'),
    __metadata("design:paramtypes", [customer_analytics_service_1.CustomerAnalyticsService])
], CustomerAnalyticsController);
//# sourceMappingURL=customer-analytics.controller.js.map