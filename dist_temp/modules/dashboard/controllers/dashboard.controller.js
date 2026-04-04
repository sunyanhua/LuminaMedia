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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("../services/dashboard.service");
const dashboard_dto_1 = require("../dto/dashboard.dto");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getDashboardStats(query) {
        return this.dashboardService.getDashboardStats(query);
    }
    async getCustomerOverview(params) {
        return this.dashboardService.getCustomerOverview(params.profileId);
    }
    async getMarketingPerformance(params, granularity) {
        return this.dashboardService.getMarketingPerformance(params.campaignId, granularity);
    }
    async getRealTimeMetrics(query) {
        return this.dashboardService.getRealTimeMetrics(query.lastMinutes);
    }
    async getUserActivityChart(query) {
        return this.dashboardService.getUserActivityChart(query.days, query.profileId);
    }
    async getConsumptionDistributionChart(query) {
        return this.dashboardService.getConsumptionDistributionChart(query.profileId);
    }
    async getGeographicDistributionChart(query) {
        return this.dashboardService.getGeographicDistributionChart(query.profileId);
    }
    async getROITrendChart(query) {
        return this.dashboardService.getROITrendChart(query.campaignId);
    }
    async getCustomerScatterChart(query) {
        return this.dashboardService.getCustomerScatterChart(query.profileId);
    }
    async getCustomerRadarChart(query) {
        return this.dashboardService.getCustomerRadarChart(query.profileId);
    }
    async getHeatmapChart(query) {
        return this.dashboardService.getHeatmapChart(query.days, query.profileId);
    }
    async generateDashboardReport(body) {
        return this.dashboardService.generateDashboardReport(body);
    }
    async exportDashboardData(query) {
        return this.dashboardService.exportDashboardData(query.format);
    }
    async getParkingSpendingChart(profileId) {
        return this.dashboardService.getParkingSpendingData(profileId);
    }
    async getTrafficTimeSeriesChart(profileId, days) {
        return this.dashboardService.getTrafficTimeSeriesData(profileId, days);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取仪表板概览统计' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回仪表板统计信息' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.DashboardStatsQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('customer-overview/:profileId'),
    (0, swagger_1.ApiOperation)({ summary: '获取客户概览数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回客户概览数据' }),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.CustomerOverviewQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCustomerOverview", null);
__decorate([
    (0, common_1.Get)('marketing-performance/:campaignId'),
    (0, swagger_1.ApiOperation)({ summary: '获取营销活动表现数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回营销活动表现数据' }),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Query)('granularity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.MarketingPerformanceQueryDto, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getMarketingPerformance", null);
__decorate([
    (0, common_1.Get)('real-time-metrics'),
    (0, swagger_1.ApiOperation)({ summary: '获取实时指标' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回实时指标数据' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.RealTimeMetricsQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRealTimeMetrics", null);
__decorate([
    (0, common_1.Get)('charts/user-activity'),
    (0, swagger_1.ApiOperation)({ summary: '获取用户活跃度图表数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回用户活跃度图表数据' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.ChartDataQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getUserActivityChart", null);
__decorate([
    (0, common_1.Get)('charts/consumption-distribution'),
    (0, swagger_1.ApiOperation)({ summary: '获取消费频次分布图表数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回消费频次分布图表数据' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.ChartDataQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getConsumptionDistributionChart", null);
__decorate([
    (0, common_1.Get)('charts/geographic-distribution'),
    (0, swagger_1.ApiOperation)({ summary: '获取地理位置分布图表数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回地理位置分布图表数据' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.ChartDataQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getGeographicDistributionChart", null);
__decorate([
    (0, common_1.Get)('charts/roi-trend'),
    (0, swagger_1.ApiOperation)({ summary: '获取营销ROI趋势图表数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回营销ROI趋势图表数据' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.ChartDataQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getROITrendChart", null);
__decorate([
    (0, common_1.Get)('charts/customer-scatter'),
    (0, swagger_1.ApiOperation)({ summary: '获取客户散点图数据（新增图表类型）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回客户散点图数据' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.ChartDataQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCustomerScatterChart", null);
__decorate([
    (0, common_1.Get)('charts/customer-radar'),
    (0, swagger_1.ApiOperation)({ summary: '获取客户雷达图数据（新增图表类型）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回客户雷达图数据' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.ChartDataQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCustomerRadarChart", null);
__decorate([
    (0, common_1.Get)('charts/heatmap'),
    (0, swagger_1.ApiOperation)({ summary: '获取热力图数据（新增图表类型）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回热力图数据' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.ChartDataQueryDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getHeatmapChart", null);
__decorate([
    (0, common_1.Post)('generate-report'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '生成数据看板报告' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回报告URL' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.GenerateReportDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "generateDashboardReport", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({ summary: '导出数据看板数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回数据下载URL' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_dto_1.ExportDashboardDto]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "exportDashboardData", null);
__decorate([
    (0, common_1.Get)('charts/parking-spending'),
    (0, swagger_1.ApiOperation)({ summary: '获取停车时长与消费金额关系数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回停车时长与消费金额关系数据' }),
    __param(0, (0, common_1.Query)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getParkingSpendingChart", null);
__decorate([
    (0, common_1.Get)('charts/traffic-timeseries'),
    (0, swagger_1.ApiOperation)({ summary: '获取每日客流趋势数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '返回每日客流趋势数据' }),
    __param(0, (0, common_1.Query)('profileId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTrafficTimeSeriesChart", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Controller)('api/v1/dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map