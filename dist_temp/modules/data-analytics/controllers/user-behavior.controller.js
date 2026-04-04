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
exports.UserBehaviorController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("../services/analytics.service");
const track_behavior_dto_1 = require("../dto/track-behavior.dto");
let UserBehaviorController = class UserBehaviorController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async trackBehavior(trackBehaviorDto) {
        return {
            success: true,
            message: 'Behavior tracked successfully',
            data: {
                userId: trackBehaviorDto.userId,
                sessionId: trackBehaviorDto.sessionId,
                eventType: trackBehaviorDto.eventType,
                timestamp: new Date().toISOString(),
            },
        };
    }
    async getUserBehavior(userId, startDate, endDate) {
        const dateRange = {
            startDate: startDate
                ? new Date(startDate)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
        };
        const analysis = await this.analyticsService.analyzeUserBehavior(userId, dateRange);
        return {
            success: true,
            data: analysis,
        };
    }
    async getUserBehaviorSummary(userId) {
        const engagementMetrics = await this.analyticsService.calculateEngagementMetrics(userId);
        return {
            success: true,
            data: {
                userId,
                engagementMetrics,
                summary: this.generateSummaryText(engagementMetrics),
            },
        };
    }
    generateSummaryText(metrics) {
        const score = metrics.engagementScore;
        let summary = '';
        if (score >= 80) {
            summary = `用户参与度很高（${score}分），内容创作频率为每周${metrics.contentCreationRate.toFixed(1)}次，登录频率每周${metrics.loginFrequency.toFixed(1)}次。`;
        }
        else if (score >= 60) {
            summary = `用户参与度中等（${score}分），建议增加内容创作和任务完成频率以提高参与度。`;
        }
        else if (score >= 40) {
            summary = `用户参与度较低（${score}分），需要采取措施提高用户活跃度。`;
        }
        else {
            summary = `用户参与度很低（${score}分），建议联系用户了解使用障碍。`;
        }
        return summary;
    }
};
exports.UserBehaviorController = UserBehaviorController;
__decorate([
    (0, common_1.Post)('track'),
    (0, common_1.HttpCode)(201),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [track_behavior_dto_1.TrackBehaviorDto]),
    __metadata("design:returntype", Promise)
], UserBehaviorController.prototype, "trackBehavior", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UserBehaviorController.prototype, "getUserBehavior", null);
__decorate([
    (0, common_1.Get)(':userId/summary'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserBehaviorController.prototype, "getUserBehaviorSummary", null);
exports.UserBehaviorController = UserBehaviorController = __decorate([
    (0, common_1.Controller)('api/v1/analytics/behavior'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], UserBehaviorController);
//# sourceMappingURL=user-behavior.controller.js.map