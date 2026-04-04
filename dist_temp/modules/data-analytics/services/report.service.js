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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_behavior_repository_1 = require("../../../shared/repositories/user-behavior.repository");
const marketing_campaign_repository_1 = require("../../../shared/repositories/marketing-campaign.repository");
const marketing_strategy_repository_1 = require("../../../shared/repositories/marketing-strategy.repository");
const campaign_status_enum_1 = require("../../../shared/enums/campaign-status.enum");
let ReportService = class ReportService {
    userBehaviorRepository;
    campaignRepository;
    strategyRepository;
    constructor(userBehaviorRepository, campaignRepository, strategyRepository) {
        this.userBehaviorRepository = userBehaviorRepository;
        this.campaignRepository = campaignRepository;
        this.strategyRepository = strategyRepository;
    }
    async generateBehaviorReport(userId) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const behaviors = await this.userBehaviorRepository.find({
            where: {
                userId,
                timestamp: (0, typeorm_2.Between)(thirtyDaysAgo, now),
            },
            order: { timestamp: 'ASC' },
        });
        const campaigns = await this.campaignRepository.find({
            where: { userId },
            relations: ['strategies'],
        });
        const allStrategies = campaigns.flatMap((c) => c.strategies || []);
        return this.buildReportData(behaviors, campaigns, allStrategies, thirtyDaysAgo, now, userId);
    }
    async generateCampaignReport(campaignId) {
        const campaign = await this.campaignRepository.findOne({
            where: { id: campaignId },
            relations: ['strategies', 'user'],
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign ${campaignId} not found`);
        }
        const userId = campaign.userId;
        const now = new Date();
        const startDate = campaign.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const endDate = campaign.endDate || now;
        const behaviors = await this.userBehaviorRepository.find({
            where: {
                userId,
                timestamp: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        return this.buildReportData(behaviors, [campaign], campaign.strategies || [], startDate, endDate, userId);
    }
    async exportReport(reportId, format = 'json') {
        if (format === 'json') {
            const mockReport = {
                id: reportId,
                generatedAt: new Date().toISOString(),
                format: 'json',
                data: {
                    message: 'This is a mock exported report',
                    downloadUrl: `/api/v1/analytics/reports/${reportId}/download`,
                },
            };
            return mockReport;
        }
        return {
            success: false,
            message: 'PDF export not implemented in demo version',
            suggestion: 'Use JSON format for now',
        };
    }
    buildReportData(behaviors, campaigns, strategies, startDate, endDate, userId) {
        const dailyActivity = this.calculateDailyActivity(behaviors, startDate, endDate);
        const eventDistribution = this.calculateEventDistribution(behaviors);
        const campaignStatus = this.calculateCampaignStatus(campaigns);
        const strategyTypes = this.calculateStrategyTypes(strategies);
        const engagementRate = this.calculateEngagementRate(behaviors);
        const campaignCompletionRate = this.calculateCampaignCompletionRate(campaigns);
        const averageStrategyConfidence = this.calculateAverageStrategyConfidence(strategies);
        const averageROI = this.calculateAverageROI(strategies);
        const recommendations = this.generateRecommendations(engagementRate, campaignCompletionRate, averageStrategyConfidence, strategies.length);
        return {
            summary: {
                totalCampaigns: campaigns.length,
                totalStrategies: strategies.length,
                totalBehaviors: behaviors.length,
                timeRange: {
                    start: startDate,
                    end: endDate,
                },
            },
            metrics: {
                engagementRate,
                campaignCompletionRate,
                averageStrategyConfidence,
                averageROI,
            },
            charts: {
                dailyActivity,
                eventDistribution,
                campaignStatus,
                strategyTypes,
            },
            recommendations,
        };
    }
    calculateDailyActivity(behaviors, startDate, endDate) {
        const dailyCounts = {};
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            dailyCounts[dateStr] = 0;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        behaviors.forEach((behavior) => {
            const dateStr = behavior.timestamp.toISOString().split('T')[0];
            if (dailyCounts[dateStr] !== undefined) {
                dailyCounts[dateStr]++;
            }
        });
        return Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    calculateEventDistribution(behaviors) {
        const distribution = {};
        behaviors.forEach((behavior) => {
            const event = behavior.eventType;
            distribution[event] = (distribution[event] || 0) + 1;
        });
        return Object.entries(distribution).map(([event, count]) => ({
            event,
            count,
        }));
    }
    calculateCampaignStatus(campaigns) {
        const statusCounts = {};
        campaigns.forEach((campaign) => {
            const status = campaign.status;
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
        }));
    }
    calculateStrategyTypes(strategies) {
        const typeCounts = {};
        strategies.forEach((strategy) => {
            const type = strategy.strategyType;
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        return Object.entries(typeCounts).map(([type, count]) => ({
            type,
            count,
        }));
    }
    calculateEngagementRate(behaviors) {
        if (behaviors.length === 0)
            return 0;
        const uniqueDays = new Set(behaviors.map((b) => b.timestamp.toISOString().split('T')[0])).size;
        const totalDays = 30;
        const dayRatio = uniqueDays / totalDays;
        const avgDailyEvents = behaviors.length / Math.max(1, uniqueDays);
        return Math.min(100, (dayRatio * 100 + avgDailyEvents) / 2);
    }
    calculateCampaignCompletionRate(campaigns) {
        if (campaigns.length === 0)
            return 0;
        const completed = campaigns.filter((c) => c.status === campaign_status_enum_1.CampaignStatus.COMPLETED).length;
        return Math.round((completed / campaigns.length) * 100);
    }
    calculateAverageStrategyConfidence(strategies) {
        if (strategies.length === 0)
            return 0;
        const total = strategies.reduce((sum, s) => sum + (parseFloat(s.confidenceScore) || 0), 0);
        return Math.round(total / strategies.length);
    }
    calculateAverageROI(strategies) {
        if (strategies.length === 0)
            return 0;
        const strategiesWithROI = strategies.filter((s) => s.expectedROI != null);
        if (strategiesWithROI.length === 0)
            return 0;
        const total = strategiesWithROI.reduce((sum, s) => sum + (parseFloat(s.expectedROI) || 0), 0);
        return Math.round((total / strategiesWithROI.length) * 100) / 100;
    }
    generateRecommendations(engagementRate, completionRate, confidenceScore, strategyCount) {
        const recommendations = [];
        if (engagementRate < 50) {
            recommendations.push('用户参与度较低，建议增加互动内容和提醒机制');
        }
        if (completionRate < 60) {
            recommendations.push('活动完成率不高，建议设置更明确的里程碑和激励机制');
        }
        if (confidenceScore < 70) {
            recommendations.push('策略置信度有待提高，建议进行更多数据分析和测试');
        }
        if (strategyCount === 0) {
            recommendations.push('尚未创建营销策略，建议为活动制定具体策略');
        }
        else if (strategyCount < 3) {
            recommendations.push('策略数量较少，建议为每个活动制定多维度策略');
        }
        if (recommendations.length === 0) {
            recommendations.push('整体表现良好，继续保持当前策略');
        }
        return recommendations;
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_behavior_repository_1.UserBehaviorRepository)),
    __param(1, (0, typeorm_1.InjectRepository)(marketing_campaign_repository_1.MarketingCampaignRepository)),
    __param(2, (0, typeorm_1.InjectRepository)(marketing_strategy_repository_1.MarketingStrategyRepository)),
    __metadata("design:paramtypes", [user_behavior_repository_1.UserBehaviorRepository,
        marketing_campaign_repository_1.MarketingCampaignRepository,
        marketing_strategy_repository_1.MarketingStrategyRepository])
], ReportService);
//# sourceMappingURL=report.service.js.map