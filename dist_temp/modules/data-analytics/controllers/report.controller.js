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
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const report_service_1 = require("../services/report.service");
let ReportController = class ReportController {
    reportService;
    constructor(reportService) {
        this.reportService = reportService;
    }
    async generateBehaviorReport(userId) {
        try {
            const report = await this.reportService.generateBehaviorReport(userId);
            return {
                success: true,
                message: 'Behavior report generated successfully',
                data: report,
                exportOptions: {
                    json: `/api/v1/analytics/reports/behavior/${userId}/export?format=json`,
                    pdf: `/api/v1/analytics/reports/behavior/${userId}/export?format=pdf`,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to generate behavior report',
            };
        }
    }
    async generateCampaignReport(campaignId) {
        try {
            const report = await this.reportService.generateCampaignReport(campaignId);
            return {
                success: true,
                message: 'Campaign report generated successfully',
                data: report,
                exportOptions: {
                    json: `/api/v1/analytics/reports/campaign/${campaignId}/export?format=json`,
                    pdf: `/api/v1/analytics/reports/campaign/${campaignId}/export?format=pdf`,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to generate campaign report',
            };
        }
    }
    async exportReport(reportType, id, format = 'json') {
        try {
            const reportId = `${reportType}-${id}-${Date.now()}`;
            const exportResult = await this.reportService.exportReport(reportId, format);
            return {
                success: true,
                message: `Report exported as ${format.toUpperCase()}`,
                data: exportResult,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to export report',
            };
        }
    }
    async getDailyActivityVisualization(userId, days = 30) {
        const now = new Date();
        const data = [];
        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            data.push({
                date: dateStr,
                activity: Math.floor(Math.random() * 50) + 10,
                events: Math.floor(Math.random() * 20) + 5,
            });
        }
        return {
            success: true,
            data: {
                type: 'line',
                title: `最近${days}天活跃度趋势`,
                labels: data.map((d) => d.date),
                datasets: [
                    {
                        label: '活跃度',
                        data: data.map((d) => d.activity),
                        borderColor: 'rgb(75, 192, 192)',
                    },
                    {
                        label: '事件数',
                        data: data.map((d) => d.events),
                        borderColor: 'rgb(255, 99, 132)',
                    },
                ],
            },
        };
    }
    async getEventDistributionVisualization(userId) {
        const events = [
            { event: 'PAGE_VIEW', count: 45, color: '#FF6384' },
            { event: 'CONTENT_CREATE', count: 25, color: '#36A2EB' },
            { event: 'PUBLISH_TASK', count: 15, color: '#FFCE56' },
            { event: 'LOGIN', count: 30, color: '#4BC0C0' },
            { event: 'LOGOUT', count: 30, color: '#9966FF' },
            { event: 'CAMPAIGN_CREATE', count: 5, color: '#FF9F40' },
        ];
        return {
            success: true,
            data: {
                type: 'pie',
                title: '事件类型分布',
                labels: events.map((e) => e.event),
                datasets: [
                    {
                        data: events.map((e) => e.count),
                        backgroundColor: events.map((e) => e.color),
                    },
                ],
            },
        };
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, common_1.Get)('behavior/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "generateBehaviorReport", null);
__decorate([
    (0, common_1.Get)('campaign/:campaignId'),
    __param(0, (0, common_1.Param)('campaignId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "generateCampaignReport", null);
__decorate([
    (0, common_1.Post)('export/:reportType/:id'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('reportType')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "exportReport", null);
__decorate([
    (0, common_1.Get)('visualization/daily-activity'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getDailyActivityVisualization", null);
__decorate([
    (0, common_1.Get)('visualization/event-distribution'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getEventDistributionVisualization", null);
exports.ReportController = ReportController = __decorate([
    (0, common_1.Controller)('api/v1/analytics/reports'),
    __metadata("design:paramtypes", [report_service_1.ReportService])
], ReportController);
//# sourceMappingURL=report.controller.js.map