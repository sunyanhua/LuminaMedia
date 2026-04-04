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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_behavior_repository_1 = require("../../../shared/repositories/user-behavior.repository");
const marketing_campaign_repository_1 = require("../../../shared/repositories/marketing-campaign.repository");
const marketing_strategy_repository_1 = require("../../../shared/repositories/marketing-strategy.repository");
const user_behavior_event_enum_1 = require("../../../shared/enums/user-behavior-event.enum");
const campaign_status_enum_1 = require("../../../shared/enums/campaign-status.enum");
let AnalyticsService = class AnalyticsService {
    userBehaviorRepository;
    campaignRepository;
    strategyRepository;
    constructor(userBehaviorRepository, campaignRepository, strategyRepository) {
        this.userBehaviorRepository = userBehaviorRepository;
        this.campaignRepository = campaignRepository;
        this.strategyRepository = strategyRepository;
    }
    async analyzeUserBehavior(userId, dateRange) {
        const behaviors = await this.userBehaviorRepository.find({
            where: {
                userId,
                timestamp: (0, typeorm_2.Between)(dateRange.startDate, dateRange.endDate),
            },
            order: { timestamp: 'ASC' },
        });
        if (behaviors.length === 0) {
            throw new common_1.NotFoundException(`No behavior data found for user ${userId}`);
        }
        const eventDistribution = Object.values(user_behavior_event_enum_1.UserBehaviorEvent).reduce((acc, event) => {
            acc[event] = 0;
            return acc;
        }, {});
        const sessions = new Set();
        const hourlyCounts = new Array(24).fill(0);
        behaviors.forEach((behavior) => {
            eventDistribution[behavior.eventType] =
                (eventDistribution[behavior.eventType] || 0) + 1;
            sessions.add(behavior.sessionId);
            const hour = behavior.timestamp.getHours();
            hourlyCounts[hour]++;
        });
        const uniqueDays = new Set(behaviors.map((b) => b.timestamp.toISOString().split('T')[0])).size;
        const mostActiveHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));
        const mostCommonEventEntry = Object.entries(eventDistribution).reduce((maxEntry, entry) => (entry[1] > maxEntry[1] ? entry : maxEntry), ['', 0]);
        const mostCommonEvent = mostCommonEventEntry[0];
        const sessionDurations = await this.calculateSessionDurations(userId, dateRange);
        const averageSessionDuration = sessionDurations.length > 0
            ? sessionDurations.reduce((sum, dur) => sum + dur, 0) /
                sessionDurations.length
            : 0;
        return {
            userId,
            totalEvents: behaviors.length,
            eventDistribution,
            dailyActiveDays: uniqueDays,
            averageEventsPerDay: behaviors.length / Math.max(1, uniqueDays),
            mostActiveHour,
            mostCommonEvent,
            sessionCount: sessions.size,
            averageSessionDuration,
        };
    }
    async generateCampaignInsights(campaignId) {
        const campaign = await this.campaignRepository.findOne({
            where: { id: campaignId },
            relations: ['strategies'],
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign ${campaignId} not found`);
        }
        const strategies = campaign.strategies || [];
        const strategyTypeDistribution = {};
        strategies.forEach((strategy) => {
            const type = strategy.strategyType;
            strategyTypeDistribution[type] =
                (strategyTypeDistribution[type] || 0) + 1;
        });
        const averageConfidenceScore = strategies.length > 0
            ? strategies.reduce((sum, s) => sum + (parseFloat(s.confidenceScore) || 0), 0) / strategies.length
            : 0;
        const estimatedTotalROI = strategies.reduce((sum, s) => sum + (parseFloat(s.expectedROI) || 0), 0);
        const completionRate = campaign.status === campaign_status_enum_1.CampaignStatus.COMPLETED ? 100 : 0;
        return {
            campaignId,
            totalStrategies: strategies.length,
            averageConfidenceScore,
            strategyTypeDistribution,
            estimatedTotalROI,
            completionRate,
        };
    }
    async calculateEngagementMetrics(userId) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const behaviors = await this.userBehaviorRepository.find({
            where: {
                userId,
                timestamp: (0, typeorm_2.Between)(thirtyDaysAgo, now),
            },
        });
        const contentCreations = behaviors.filter((b) => b.eventType === user_behavior_event_enum_1.UserBehaviorEvent.CONTENT_CREATE).length;
        const publishTasks = behaviors.filter((b) => b.eventType === user_behavior_event_enum_1.UserBehaviorEvent.PUBLISH_TASK).length;
        const logins = behaviors.filter((b) => b.eventType === user_behavior_event_enum_1.UserBehaviorEvent.LOGIN).length;
        const sessions = new Set(behaviors.map((b) => b.sessionId));
        const sessionDurations = await this.calculateSessionDurations(userId, {
            startDate: thirtyDaysAgo,
            endDate: now,
        });
        const averageSessionTime = sessionDurations.length > 0
            ? sessionDurations.reduce((sum, dur) => sum + dur, 0) /
                sessionDurations.length
            : 0;
        const engagementScore = Math.min(100, (contentCreations * 10 +
            publishTasks * 15 +
            logins * 5 +
            sessions.size * 3 +
            averageSessionTime * 2) /
            10);
        return {
            userId,
            engagementScore,
            contentCreationRate: contentCreations / 4.3,
            taskCompletionRate: publishTasks > 0 ? 75 : 0,
            loginFrequency: logins / 4.3,
            averageSessionTime,
        };
    }
    async calculateSessionDurations(userId, dateRange) {
        const behaviors = await this.userBehaviorRepository.find({
            where: {
                userId,
                timestamp: (0, typeorm_2.Between)(dateRange.startDate, dateRange.endDate),
            },
            order: { timestamp: 'ASC' },
        });
        const sessions = {};
        behaviors.forEach((behavior) => {
            if (!sessions[behavior.sessionId]) {
                sessions[behavior.sessionId] = [];
            }
            sessions[behavior.sessionId].push(behavior.timestamp);
        });
        return Object.values(sessions)
            .map((timestamps) => {
            if (timestamps.length < 2)
                return 5;
            const duration = (timestamps[timestamps.length - 1].getTime() -
                timestamps[0].getTime()) /
                (1000 * 60);
            return Math.max(1, Math.min(duration, 120));
        })
            .filter((duration) => !isNaN(duration));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_behavior_repository_1.UserBehaviorRepository)),
    __param(1, (0, typeorm_1.InjectRepository)(marketing_campaign_repository_1.MarketingCampaignRepository)),
    __param(2, (0, typeorm_1.InjectRepository)(marketing_strategy_repository_1.MarketingStrategyRepository)),
    __metadata("design:paramtypes", [user_behavior_repository_1.UserBehaviorRepository,
        marketing_campaign_repository_1.MarketingCampaignRepository,
        marketing_strategy_repository_1.MarketingStrategyRepository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map