"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dashboard_service_1 = require("./dashboard.service");
const user_entity_1 = require("../../../entities/user.entity");
const customer_profile_entity_1 = require("../../../entities/customer-profile.entity");
const data_import_job_entity_1 = require("../../../entities/data-import-job.entity");
const customer_segment_entity_1 = require("../../../entities/customer-segment.entity");
const user_behavior_entity_1 = require("../../data-analytics/entities/user-behavior.entity");
const marketing_campaign_entity_1 = require("../../data-analytics/entities/marketing-campaign.entity");
const marketing_strategy_entity_1 = require("../../data-analytics/entities/marketing-strategy.entity");
const user_behavior_event_enum_1 = require("../../../shared/enums/user-behavior-event.enum");
describe('DashboardService', () => {
    let dashboardService;
    let userRepository;
    let customerProfileRepository;
    let dataImportJobRepository;
    let customerSegmentRepository;
    let userBehaviorRepository;
    let marketingCampaignRepository;
    let marketingStrategyRepository;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                dashboard_service_1.DashboardService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: {
                        count: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(customer_profile_entity_1.CustomerProfile),
                    useValue: {
                        count: jest.fn(),
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(data_import_job_entity_1.DataImportJob),
                    useValue: {
                        count: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(customer_segment_entity_1.CustomerSegment),
                    useValue: {
                        find: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_behavior_entity_1.UserBehavior),
                    useValue: {
                        count: jest.fn(),
                        find: jest.fn(),
                        createQueryBuilder: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(marketing_campaign_entity_1.MarketingCampaign),
                    useValue: {
                        count: jest.fn(),
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(marketing_strategy_entity_1.MarketingStrategy),
                    useValue: {
                        count: jest.fn(),
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();
        dashboardService = module.get(dashboard_service_1.DashboardService);
        userRepository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
        customerProfileRepository = module.get((0, typeorm_1.getRepositoryToken)(customer_profile_entity_1.CustomerProfile));
        dataImportJobRepository = module.get((0, typeorm_1.getRepositoryToken)(data_import_job_entity_1.DataImportJob));
        customerSegmentRepository = module.get((0, typeorm_1.getRepositoryToken)(customer_segment_entity_1.CustomerSegment));
        userBehaviorRepository = module.get((0, typeorm_1.getRepositoryToken)(user_behavior_entity_1.UserBehavior));
        marketingCampaignRepository = module.get((0, typeorm_1.getRepositoryToken)(marketing_campaign_entity_1.MarketingCampaign));
        marketingStrategyRepository = module.get((0, typeorm_1.getRepositoryToken)(marketing_strategy_entity_1.MarketingStrategy));
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('getDashboardStats', () => {
        it('should return dashboard statistics with all counts', async () => {
            const mockQuery = {};
            const mockCounts = {
                userCount: 10,
                activeUserCount: 5,
                campaignCount: 20,
                activeCampaignCount: 15,
                strategyCount: 30,
                customerProfileCount: 40,
            };
            userRepository.count.mockResolvedValue(mockCounts.userCount);
            marketingCampaignRepository.count
                .mockResolvedValueOnce(mockCounts.campaignCount)
                .mockResolvedValueOnce(mockCounts.activeCampaignCount);
            marketingStrategyRepository.count.mockResolvedValue(mockCounts.strategyCount);
            customerProfileRepository.count.mockResolvedValue(mockCounts.customerProfileCount);
            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawOne: jest
                    .fn()
                    .mockResolvedValue({ count: mockCounts.activeUserCount.toString() }),
            };
            userBehaviorRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            const result = await dashboardService.getDashboardStats(mockQuery);
            expect(userRepository.count).toHaveBeenCalled();
            expect(userBehaviorRepository.createQueryBuilder).toHaveBeenCalledWith('behavior');
            expect(marketingCampaignRepository.count).toHaveBeenCalledTimes(2);
            expect(marketingStrategyRepository.count).toHaveBeenCalled();
            expect(customerProfileRepository.count).toHaveBeenCalled();
            expect(result.totalUsers).toBe(mockCounts.userCount);
            expect(result.activeUsers).toBe(mockCounts.activeUserCount);
            expect(result.totalCampaigns).toBe(mockCounts.campaignCount);
            expect(result.activeCampaigns).toBe(mockCounts.activeCampaignCount);
            expect(result.totalStrategies).toBe(mockCounts.strategyCount);
            expect(result.customerProfiles).toBe(mockCounts.customerProfileCount);
            expect(result.totalRevenue).toBe(0);
            expect(result.avgSessionTime).toBe(0);
        });
        it('should handle zero counts gracefully', async () => {
            const mockQuery = {};
            userRepository.count.mockResolvedValue(0);
            marketingCampaignRepository.count
                .mockResolvedValueOnce(0)
                .mockResolvedValueOnce(0);
            marketingStrategyRepository.count.mockResolvedValue(0);
            customerProfileRepository.count.mockResolvedValue(0);
            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
            };
            userBehaviorRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            const result = await dashboardService.getDashboardStats(mockQuery);
            expect(result.totalUsers).toBe(0);
            expect(result.activeUsers).toBe(0);
            expect(result.totalCampaigns).toBe(0);
            expect(result.activeCampaigns).toBe(0);
            expect(result.totalStrategies).toBe(0);
            expect(result.customerProfiles).toBe(0);
        });
    });
    describe('getCustomerOverview', () => {
        it('should return customer overview with real data when profile exists', async () => {
            const profileId = 'profile-123';
            const mockCustomerProfile = {
                id: profileId,
                profileData: {
                    ageGroups: {
                        '18-25': 30,
                        '26-35': 35,
                        '36-45': 25,
                        '46-55': 8,
                        '56+': 2,
                    },
                    gender: { male: 60, female: 40 },
                    location: { 北京: 35, 上海: 30, 广东: 25, 其他: 10 },
                },
                behaviorInsights: {
                    averagePurchaseFrequency: 4.5,
                    averageOrderValue: 600,
                    customerLifetimeValue: 3000,
                    retentionRate: 0.8,
                },
            };
            const mockSegments = [
                { segmentName: 'VIP客户', memberCount: 100 },
                { segmentName: '普通客户', memberCount: 200 },
            ];
            customerProfileRepository.findOne.mockResolvedValue(mockCustomerProfile);
            customerSegmentRepository.find.mockResolvedValue(mockSegments);
            const result = await dashboardService.getCustomerOverview(profileId);
            expect(customerProfileRepository.findOne).toHaveBeenCalledWith({
                where: { id: profileId },
            });
            expect(customerSegmentRepository.find).toHaveBeenCalledWith({
                where: { customerProfileId: profileId },
                take: 5,
            });
            expect(result.demographicDistribution.ageGroups['18-25']).toBe(30);
            expect(result.demographicDistribution.gender.male).toBe(60);
            expect(result.behaviorMetrics.averagePurchaseFrequency).toBe(4.5);
            expect(result.behaviorMetrics.averageOrderValue).toBe(600);
            expect(result.topSegments).toHaveLength(2);
            expect(result.topSegments[0].name).toBe('VIP客户');
            expect(result.topSegments[0].size).toBe(100);
        });
        it('should return mock data when profile does not exist', async () => {
            const profileId = 'non-existent';
            customerProfileRepository.findOne.mockResolvedValue(null);
            const result = await dashboardService.getCustomerOverview(profileId);
            expect(customerProfileRepository.findOne).toHaveBeenCalledWith({
                where: { id: profileId },
            });
            expect(result.demographicDistribution.ageGroups['18-25']).toBe(25);
            expect(result.demographicDistribution.gender.male).toBe(55);
            expect(result.behaviorMetrics.averagePurchaseFrequency).toBe(3.2);
            expect(result.topSegments).toHaveLength(4);
        });
        it('should use default segments when no segments found', async () => {
            const profileId = 'profile-123';
            const mockCustomerProfile = {
                id: profileId,
                profileData: {},
                behaviorInsights: {},
            };
            customerProfileRepository.findOne.mockResolvedValue(mockCustomerProfile);
            customerSegmentRepository.find.mockResolvedValue([]);
            const result = await dashboardService.getCustomerOverview(profileId);
            expect(result.topSegments).toHaveLength(4);
            expect(result.topSegments[0].name).toBe('高价值VIP客户');
        });
    });
    describe('getMarketingPerformance', () => {
        it('should return marketing performance with real campaign data', async () => {
            const campaignId = 'campaign-123';
            const mockCampaign = {
                id: campaignId,
                name: 'Test Campaign',
                budget: 50000,
            };
            const mockStrategies = [
                { confidenceScore: '0.8' },
                { confidenceScore: '0.9' },
            ];
            marketingCampaignRepository.findOne.mockResolvedValue(mockCampaign);
            marketingStrategyRepository.find.mockResolvedValue(mockStrategies);
            const result = await dashboardService.getMarketingPerformance(campaignId);
            expect(marketingCampaignRepository.findOne).toHaveBeenCalledWith({
                where: { id: campaignId },
            });
            expect(marketingStrategyRepository.find).toHaveBeenCalledWith({
                where: { campaignId },
            });
            expect(result.campaignId).toBe(campaignId);
            expect(result.campaignName).toBe('Test Campaign');
            expect(result.metrics.reach).toBeGreaterThan(0);
            expect(result.metrics.roi).toBeGreaterThan(0);
            expect(result.timeline).toHaveLength(7);
        });
        it('should return mock data when campaign does not exist', async () => {
            const campaignId = 'non-existent';
            marketingCampaignRepository.findOne.mockResolvedValue(null);
            const result = await dashboardService.getMarketingPerformance(campaignId);
            expect(marketingCampaignRepository.findOne).toHaveBeenCalledWith({
                where: { id: campaignId },
            });
            expect(result.campaignId).toBe(campaignId);
            expect(result.campaignName).toBe('商场春季焕新购物节');
            expect(result.metrics.reach).toBe(24500);
            expect(result.timeline).toHaveLength(7);
        });
    });
    describe('getRealTimeMetrics', () => {
        it('should return real-time metrics for last 5 minutes', async () => {
            const lastMinutes = 5;
            const mockBehaviors = [
                { sessionId: 'session1', eventType: user_behavior_event_enum_1.UserBehaviorEvent.PAGE_VIEW },
                { sessionId: 'session1', eventType: user_behavior_event_enum_1.UserBehaviorEvent.CAMPAIGN_CREATE },
                {
                    sessionId: 'session2',
                    eventType: user_behavior_event_enum_1.UserBehaviorEvent.STRATEGY_GENERATE,
                },
                { sessionId: 'session3', eventType: user_behavior_event_enum_1.UserBehaviorEvent.CONTENT_CREATE },
                { sessionId: 'session3', eventType: user_behavior_event_enum_1.UserBehaviorEvent.PUBLISH_TASK },
            ];
            userBehaviorRepository.find.mockResolvedValue(mockBehaviors);
            const result = await dashboardService.getRealTimeMetrics(lastMinutes);
            expect(userBehaviorRepository.find).toHaveBeenCalledWith({
                where: { timestamp: (0, typeorm_2.MoreThanOrEqual)(expect.any(Date)) },
            });
            expect(result.activeSessions).toBe(3);
            expect(result.recentConversions).toBe(2);
            expect(result.contentViews).toBe(1);
            expect(result.socialEngagements).toBe(2);
            expect(result.apiCalls).toBe(5);
            expect(result.timestamp).toBeDefined();
        });
        it('should handle empty behaviors', async () => {
            const lastMinutes = 5;
            userBehaviorRepository.find.mockResolvedValue([]);
            const result = await dashboardService.getRealTimeMetrics(lastMinutes);
            expect(result.activeSessions).toBe(0);
            expect(result.recentConversions).toBe(0);
            expect(result.contentViews).toBe(0);
            expect(result.socialEngagements).toBe(0);
            expect(result.apiCalls).toBe(0);
        });
    });
});
//# sourceMappingURL=dashboard.service.spec.js.map