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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_profile_entity_1 = require("../../../entities/customer-profile.entity");
const data_import_job_entity_1 = require("../../../entities/data-import-job.entity");
const customer_segment_entity_1 = require("../../../entities/customer-segment.entity");
const user_entity_1 = require("../../../entities/user.entity");
const user_behavior_entity_1 = require("../../data-analytics/entities/user-behavior.entity");
const marketing_campaign_entity_1 = require("../../data-analytics/entities/marketing-campaign.entity");
const marketing_strategy_entity_1 = require("../../data-analytics/entities/marketing-strategy.entity");
const campaign_status_enum_1 = require("../../../shared/enums/campaign-status.enum");
const user_behavior_event_enum_1 = require("../../../shared/enums/user-behavior-event.enum");
let DashboardService = class DashboardService {
    userRepository;
    customerProfileRepository;
    dataImportJobRepository;
    customerSegmentRepository;
    userBehaviorRepository;
    marketingCampaignRepository;
    marketingStrategyRepository;
    constructor(userRepository, customerProfileRepository, dataImportJobRepository, customerSegmentRepository, userBehaviorRepository, marketingCampaignRepository, marketingStrategyRepository) {
        this.userRepository = userRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.dataImportJobRepository = dataImportJobRepository;
        this.customerSegmentRepository = customerSegmentRepository;
        this.userBehaviorRepository = userBehaviorRepository;
        this.marketingCampaignRepository = marketingCampaignRepository;
        this.marketingStrategyRepository = marketingStrategyRepository;
    }
    async getDashboardStats(query) {
        const [totalUsers, activeUsers, totalCampaigns, activeCampaigns, totalStrategies, customerProfiles,] = await Promise.all([
            this.userRepository.count(),
            this.userBehaviorRepository
                .createQueryBuilder('behavior')
                .select('COUNT(DISTINCT behavior.userId)', 'count')
                .where('behavior.timestamp >= :date', {
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            })
                .getRawOne()
                .then((result) => parseInt(result?.count || '0', 10)),
            this.marketingCampaignRepository.count(),
            this.marketingCampaignRepository.count({
                where: { status: campaign_status_enum_1.CampaignStatus.ACTIVE },
            }),
            this.marketingStrategyRepository.count(),
            this.customerProfileRepository.count(),
        ]);
        const totalRevenue = 0;
        const avgSessionTime = 0;
        return {
            totalUsers,
            activeUsers,
            totalRevenue,
            avgSessionTime,
            totalCampaigns,
            activeCampaigns,
            totalStrategies,
            customerProfiles,
        };
    }
    async getCustomerOverview(profileId) {
        const customerProfile = await this.customerProfileRepository.findOne({
            where: { id: profileId },
        });
        if (!customerProfile) {
            return {
                demographicDistribution: {
                    ageGroups: {
                        '18-25': 25,
                        '26-35': 40,
                        '36-45': 20,
                        '46-55': 10,
                        '56+': 5,
                    },
                    gender: { male: 55, female: 45 },
                    location: { 北京: 30, 上海: 25, 广东: 20, 其他: 25 },
                },
                behaviorMetrics: {
                    averagePurchaseFrequency: 3.2,
                    averageOrderValue: 450,
                    customerLifetimeValue: 2500,
                    retentionRate: 0.72,
                },
                topSegments: [
                    { name: '高价值VIP客户', size: 150, revenueContribution: 0.45 },
                    { name: '年轻时尚族群', size: 280, revenueContribution: 0.3 },
                    { name: '家庭消费群体', size: 220, revenueContribution: 0.2 },
                    { name: '低频访问客户', size: 150, revenueContribution: 0.05 },
                ],
            };
        }
        const profileData = customerProfile.profileData || {};
        const behaviorInsights = customerProfile.behaviorInsights || {};
        const segments = await this.customerSegmentRepository.find({
            where: { customerProfileId: profileId },
            take: 5,
        });
        const topSegments = segments.map((segment) => ({
            name: segment.segmentName,
            size: segment.memberCount || 0,
            revenueContribution: segment.memberCount
                ? segment.memberCount / 1000
                : 0.1,
        }));
        if (topSegments.length === 0) {
            topSegments.push({ name: '高价值VIP客户', size: 150, revenueContribution: 0.45 }, { name: '年轻时尚族群', size: 280, revenueContribution: 0.3 }, { name: '家庭消费群体', size: 220, revenueContribution: 0.2 }, { name: '低频访问客户', size: 150, revenueContribution: 0.05 });
        }
        return {
            demographicDistribution: {
                ageGroups: profileData.ageGroups || {
                    '18-25': 25,
                    '26-35': 40,
                    '36-45': 20,
                    '46-55': 10,
                    '56+': 5,
                },
                gender: profileData.gender || { male: 55, female: 45 },
                location: profileData.location || {
                    北京: 30,
                    上海: 25,
                    广东: 20,
                    其他: 25,
                },
            },
            behaviorMetrics: {
                averagePurchaseFrequency: behaviorInsights.averagePurchaseFrequency || 3.2,
                averageOrderValue: behaviorInsights.averageOrderValue || 450,
                customerLifetimeValue: behaviorInsights.customerLifetimeValue || 2500,
                retentionRate: behaviorInsights.retentionRate || 0.72,
            },
            topSegments,
        };
    }
    async getMarketingPerformance(campaignId, granularity) {
        const campaign = await this.marketingCampaignRepository.findOne({
            where: { id: campaignId },
        });
        if (!campaign) {
            const timeline = [];
            const baseDate = new Date();
            for (let i = 0; i < 7; i++) {
                const date = new Date(baseDate);
                date.setDate(date.getDate() - i);
                timeline.push({
                    date: date.toISOString().split('T')[0],
                    metrics: {
                        reach: Math.floor(Math.random() * 10000) + 5000,
                        engagement: Math.floor(Math.random() * 1000) + 500,
                        conversion: Math.floor(Math.random() * 100) + 20,
                        spend: Math.floor(Math.random() * 5000) + 1000,
                        revenue: Math.floor(Math.random() * 20000) + 5000,
                    },
                });
            }
            return {
                campaignId,
                campaignName: '商场春季焕新购物节',
                metrics: {
                    reach: 24500,
                    engagement: 3200,
                    conversion: 420,
                    roi: 3.8,
                    spend: 125000,
                    revenue: 475000,
                },
                timeline: timeline.reverse(),
            };
        }
        const strategies = await this.marketingStrategyRepository.find({
            where: { campaignId },
        });
        const totalStrategies = strategies.length;
        const avgConfidence = totalStrategies > 0
            ? strategies.reduce((sum, s) => sum + (parseFloat(s.confidenceScore) || 0), 0) / totalStrategies
            : 0;
        const timeline = [];
        const baseDate = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() - i);
            timeline.push({
                date: date.toISOString().split('T')[0],
                metrics: {
                    reach: Math.floor(Math.random() * 10000) + 5000,
                    engagement: Math.floor(Math.random() * 1000) + 500,
                    conversion: Math.floor(Math.random() * 100) + 20,
                    spend: Math.floor(Math.random() * 5000) + 1000,
                    revenue: Math.floor(Math.random() * 20000) + 5000,
                },
            });
        }
        const budget = campaign.budget || 0;
        const reach = Math.floor(budget * 0.2) + 10000;
        const engagement = Math.floor(budget * 0.015) + 500;
        const conversion = Math.floor(budget * 0.001) + 20;
        const spend = budget * 0.8;
        const revenue = budget * 3.8;
        const roi = revenue / spend;
        return {
            campaignId,
            campaignName: campaign.name,
            metrics: {
                reach,
                engagement,
                conversion,
                roi,
                spend,
                revenue,
            },
            timeline: timeline.reverse(),
        };
    }
    async getRealTimeMetrics(lastMinutes = 5) {
        const threshold = new Date(Date.now() - lastMinutes * 60 * 1000);
        const behaviors = await this.userBehaviorRepository.find({
            where: { timestamp: (0, typeorm_2.MoreThanOrEqual)(threshold) },
        });
        const sessionIds = new Set(behaviors.map((b) => b.sessionId));
        const activeSessions = sessionIds.size;
        const recentConversions = behaviors.filter((b) => b.eventType === user_behavior_event_enum_1.UserBehaviorEvent.CAMPAIGN_CREATE ||
            b.eventType === user_behavior_event_enum_1.UserBehaviorEvent.STRATEGY_GENERATE).length;
        const contentViews = behaviors.filter((b) => b.eventType === user_behavior_event_enum_1.UserBehaviorEvent.PAGE_VIEW).length;
        const socialEngagements = behaviors.filter((b) => b.eventType === user_behavior_event_enum_1.UserBehaviorEvent.CONTENT_CREATE ||
            b.eventType === user_behavior_event_enum_1.UserBehaviorEvent.PUBLISH_TASK).length;
        const apiCalls = behaviors.length;
        return {
            activeSessions,
            recentConversions,
            contentViews,
            socialEngagements,
            apiCalls,
            timestamp: new Date().toISOString(),
        };
    }
    async getUserActivityChart(days = 7, profileId) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const dailyActivity = await this.userBehaviorRepository
            .createQueryBuilder('behavior')
            .select('DATE(behavior.timestamp) as date')
            .addSelect('COUNT(*) as count')
            .where('behavior.timestamp >= :startDate', { startDate })
            .groupBy('DATE(behavior.timestamp)')
            .orderBy('date', 'ASC')
            .getRawMany();
        const labels = [];
        const data = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            const dateStr = date.toISOString().split('T')[0];
            const formattedLabel = `${date.getMonth() + 1}/${date.getDate()}`;
            labels.push(formattedLabel);
            const activity = dailyActivity.find((a) => a.date === dateStr);
            data.push(activity ? parseInt(activity.count, 10) : 0);
        }
        return {
            labels,
            datasets: [
                {
                    label: '用户活跃度',
                    data,
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    borderColor: 'rgba(56, 189, 248, 1)',
                },
            ],
        };
    }
    async getConsumptionDistributionChart(profileId) {
        if (profileId) {
            const customerProfile = await this.customerProfileRepository.findOne({
                where: { id: profileId },
            });
            if (customerProfile?.behaviorInsights?.consumptionDistribution) {
                const distribution = customerProfile.behaviorInsights.consumptionDistribution;
                const categories = Object.keys(distribution);
                const data = Object.values(distribution);
                return {
                    labels: categories,
                    datasets: [
                        {
                            label: '消费频次分布',
                            data,
                            backgroundColor: [
                                'rgba(251, 191, 36, 0.7)',
                                'rgba(56, 189, 248, 0.7)',
                                'rgba(16, 185, 129, 0.7)',
                                'rgba(139, 92, 246, 0.7)',
                                'rgba(107, 114, 128, 0.7)',
                            ],
                            borderColor: [
                                'rgba(251, 191, 36, 1)',
                                'rgba(56, 189, 248, 1)',
                                'rgba(16, 185, 129, 1)',
                                'rgba(139, 92, 246, 1)',
                                'rgba(107, 114, 128, 1)',
                            ],
                        },
                    ],
                };
            }
        }
        const categories = [
            '高频消费',
            '中频消费',
            '低频消费',
            '潜在用户',
            '沉默用户',
        ];
        const data = [35, 25, 20, 15, 5];
        return {
            labels: categories,
            datasets: [
                {
                    label: '消费频次分布',
                    data,
                    backgroundColor: [
                        'rgba(251, 191, 36, 0.7)',
                        'rgba(56, 189, 248, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(107, 114, 128, 0.7)',
                    ],
                    borderColor: [
                        'rgba(251, 191, 36, 1)',
                        'rgba(56, 189, 248, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(107, 114, 128, 1)',
                    ],
                },
            ],
        };
    }
    async getGeographicDistributionChart(profileId) {
        if (profileId) {
            const customerProfile = await this.customerProfileRepository.findOne({
                where: { id: profileId },
            });
            if (customerProfile?.profileData?.geographicDistribution) {
                const distribution = customerProfile.profileData.geographicDistribution;
                const cities = Object.keys(distribution);
                const data = Object.values(distribution);
                return {
                    labels: cities,
                    datasets: [
                        {
                            label: '客户地域分布',
                            data,
                            backgroundColor: 'rgba(56, 189, 248, 0.6)',
                            borderColor: 'rgba(56, 189, 248, 1)',
                        },
                    ],
                };
            }
        }
        const cities = [
            '北京',
            '上海',
            '广东',
            '浙江',
            '江苏',
            '四川',
            '湖北',
            '陕西',
            '辽宁',
            '福建',
        ];
        const data = [2450, 2300, 2100, 1800, 1700, 1200, 950, 800, 750, 700];
        return {
            labels: cities,
            datasets: [
                {
                    label: '客户地域分布',
                    data,
                    backgroundColor: 'rgba(56, 189, 248, 0.6)',
                    borderColor: 'rgba(56, 189, 248, 1)',
                },
            ],
        };
    }
    async getROITrendChart(campaignId) {
        const labels = [];
        const data = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(`${date.getFullYear()}-${date.getMonth() + 1}`);
            data.push(Number((Math.random() * 3 + 1).toFixed(2)));
        }
        return {
            labels,
            datasets: [
                {
                    label: '营销ROI趋势',
                    data,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                },
            ],
        };
    }
    async getCustomerScatterChart(profileId) {
        const labels = [];
        const data = [];
        for (let i = 0; i < 50; i++) {
            labels.push(`客户${i + 1}`);
            data.push({
                x: Math.floor(Math.random() * 10000) + 1000,
                y: Math.floor(Math.random() * 50) + 1,
                r: Math.floor(Math.random() * 10) + 5,
            });
        }
        return {
            labels,
            datasets: [
                {
                    label: '客户价值 vs 消费频率',
                    data: data.map((d) => d.x),
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                },
            ],
        };
    }
    async getCustomerRadarChart(profileId) {
        const dimensions = [
            '消费能力',
            '忠诚度',
            '活跃度',
            '兴趣广度',
            '转化潜力',
            '社交影响力',
        ];
        const segment1 = [85, 70, 90, 75, 80, 65];
        const segment2 = [60, 50, 85, 90, 70, 95];
        const segment3 = [75, 85, 60, 65, 75, 50];
        return {
            labels: dimensions,
            datasets: [
                {
                    label: '高价值VIP客户',
                    data: segment1,
                    backgroundColor: 'rgba(251, 191, 36, 0.2)',
                    borderColor: 'rgba(251, 191, 36, 1)',
                },
                {
                    label: '年轻时尚族群',
                    data: segment2,
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    borderColor: 'rgba(56, 189, 248, 1)',
                },
                {
                    label: '家庭消费群体',
                    data: segment3,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                },
            ],
        };
    }
    async getHeatmapChart(days = 7, profileId) {
        const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        const dayLabels = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dayLabels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
        const data = [];
        for (let hour = 0; hour < 24; hour++) {
            const row = [];
            for (let day = 0; day < days; day++) {
                let value;
                if (hour >= 9 && hour <= 18) {
                    value = Math.floor(Math.random() * 80) + 40;
                }
                else if (hour >= 19 && hour <= 22) {
                    value = Math.floor(Math.random() * 60) + 30;
                }
                else {
                    value = Math.floor(Math.random() * 30) + 10;
                }
                row.push(value);
            }
            data.push(row);
        }
        return {
            labels: hours,
            datasets: [
                {
                    label: '用户活跃热力图',
                    data: data.flat(),
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                },
            ],
        };
    }
    async generateDashboardReport(request) {
        return {
            reportUrl: `https://api.lumina-media.com/reports/dashboard-${Date.now()}.pdf`,
        };
    }
    async exportDashboardData(format = 'json') {
        return {
            downloadUrl: `https://api.lumina-media.com/exports/dashboard-${Date.now()}.${format}`,
        };
    }
    async getParkingSpendingData(profileId) {
        const durations = ['<1小时', '1-2小时', '2-3小时', '3-4小时', '>4小时'];
        const data = durations.map((duration, index) => ({
            duration,
            avgSpending: Math.floor(Math.random() * 500) + 200 + index * 100,
            userCount: Math.floor(Math.random() * 300) + 100 + index * 50,
        }));
        return data;
    }
    async getTrafficTimeSeriesData(profileId, days) {
        const targetDays = days || 30;
        const data = [];
        const baseDate = new Date();
        for (let i = targetDays - 1; i >= 0; i--) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();
            let baseValue = 1000;
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                baseValue = 1500;
            }
            const value = Math.floor(Math.random() * 300) + baseValue;
            data.push({ date: dateStr, value });
        }
        return data;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_profile_entity_1.CustomerProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(data_import_job_entity_1.DataImportJob)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_segment_entity_1.CustomerSegment)),
    __param(4, (0, typeorm_1.InjectRepository)(user_behavior_entity_1.UserBehavior)),
    __param(5, (0, typeorm_1.InjectRepository)(marketing_campaign_entity_1.MarketingCampaign)),
    __param(6, (0, typeorm_1.InjectRepository)(marketing_strategy_entity_1.MarketingStrategy)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map