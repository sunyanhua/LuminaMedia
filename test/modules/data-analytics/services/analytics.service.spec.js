"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
const analytics_service_1 = require("../../../../src/modules/data-analytics/services/analytics.service");
const user_behavior_repository_1 = require("../../../../src/shared/repositories/user-behavior.repository");
const marketing_campaign_repository_1 = require("../../../../src/shared/repositories/marketing-campaign.repository");
const marketing_strategy_repository_1 = require("../../../../src/shared/repositories/marketing-strategy.repository");
const user_behavior_event_enum_1 = require("../../../../src/shared/enums/user-behavior-event.enum");
const campaign_status_enum_1 = require("../../../../src/shared/enums/campaign-status.enum");
describe('AnalyticsService', () => {
    let analyticsService;
    let userBehaviorRepository;
    let campaignRepository;
    let strategyRepository;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                analytics_service_1.AnalyticsService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_behavior_repository_1.UserBehaviorRepository),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(marketing_campaign_repository_1.MarketingCampaignRepository),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(marketing_strategy_repository_1.MarketingStrategyRepository),
                    useValue: {
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();
        analyticsService = module.get(analytics_service_1.AnalyticsService);
        userBehaviorRepository = module.get((0, typeorm_1.getRepositoryToken)(user_behavior_repository_1.UserBehaviorRepository));
        campaignRepository = module.get((0, typeorm_1.getRepositoryToken)(marketing_campaign_repository_1.MarketingCampaignRepository));
        strategyRepository = module.get((0, typeorm_1.getRepositoryToken)(marketing_strategy_repository_1.MarketingStrategyRepository));
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('analyzeUserBehavior', () => {
        it('should return behavior analytics for a user with valid data', async () => {
            const userId = 'user-123';
            const dateRange = {
                startDate: new Date('2026-03-01'),
                endDate: new Date('2026-03-31'),
            };
            const mockBehaviors = [
                {
                    id: '1',
                    userId,
                    sessionId: 'session1',
                    eventType: user_behavior_event_enum_1.UserBehaviorEvent.PAGE_VIEW,
                    timestamp: new Date('2026-03-15T10:00:00'),
                },
                {
                    id: '2',
                    userId,
                    sessionId: 'session1',
                    eventType: user_behavior_event_enum_1.UserBehaviorEvent.CAMPAIGN_CREATE,
                    timestamp: new Date('2026-03-15T10:05:00'),
                },
                {
                    id: '3',
                    userId,
                    sessionId: 'session2',
                    eventType: user_behavior_event_enum_1.UserBehaviorEvent.STRATEGY_GENERATE,
                    timestamp: new Date('2026-03-16T14:00:00'),
                },
            ];
            userBehaviorRepository.find.mockResolvedValue(mockBehaviors);
            const result = await analyticsService.analyzeUserBehavior(userId, dateRange);
            expect(userBehaviorRepository.find).toHaveBeenCalledWith({
                where: {
                    userId,
                    timestamp: (0, typeorm_2.Between)(dateRange.startDate, dateRange.endDate),
                },
                order: { timestamp: 'ASC' },
            });
            expect(result.userId).toBe(userId);
            expect(result.totalEvents).toBe(3);
            expect(result.eventDistribution[user_behavior_event_enum_1.UserBehaviorEvent.PAGE_VIEW]).toBe(1);
            expect(result.eventDistribution[user_behavior_event_enum_1.UserBehaviorEvent.CAMPAIGN_CREATE]).toBe(1);
            expect(result.eventDistribution[user_behavior_event_enum_1.UserBehaviorEvent.STRATEGY_GENERATE]).toBe(1);
            expect(result.sessionCount).toBe(2);
            expect(result.dailyActiveDays).toBe(2);
            expect(result.averageEventsPerDay).toBe(1.5);
            expect(result.mostActiveHour).toBeDefined();
            expect(result.mostCommonEvent).toBeDefined();
            expect(result.averageSessionDuration).toBeDefined();
        });
        it('should throw NotFoundException when no behavior data found', async () => {
            const userId = 'user-123';
            const dateRange = {
                startDate: new Date('2026-03-01'),
                endDate: new Date('2026-03-31'),
            };
            userBehaviorRepository.find.mockResolvedValue([]);
            await expect(analyticsService.analyzeUserBehavior(userId, dateRange)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('generateCampaignInsights', () => {
        it('should return campaign insights for an existing campaign', async () => {
            const campaignId = 'campaign-123';
            const mockCampaign = {
                id: campaignId,
                name: 'Test Campaign',
                status: campaign_status_enum_1.CampaignStatus.ACTIVE,
                strategies: [
                    {
                        id: 'strategy-1',
                        strategyType: 'social_media',
                        confidenceScore: '0.8',
                        expectedROI: '1500',
                    },
                    {
                        id: 'strategy-2',
                        strategyType: 'email_marketing',
                        confidenceScore: '0.9',
                        expectedROI: '2500',
                    },
                    {
                        id: 'strategy-3',
                        strategyType: 'social_media',
                        confidenceScore: '0.7',
                        expectedROI: '1000',
                    },
                ],
            };
            campaignRepository.findOne.mockResolvedValue(mockCampaign);
            const result = await analyticsService.generateCampaignInsights(campaignId);
            expect(campaignRepository.findOne).toHaveBeenCalledWith({
                where: { id: campaignId },
                relations: ['strategies'],
            });
            expect(result.campaignId).toBe(campaignId);
            expect(result.totalStrategies).toBe(3);
            expect(result.averageConfidenceScore).toBeCloseTo(0.8);
            expect(result.strategyTypeDistribution['social_media']).toBe(2);
            expect(result.strategyTypeDistribution['email_marketing']).toBe(1);
            expect(result.estimatedTotalROI).toBe(5000);
            expect(result.completionRate).toBe(0);
        });
        it('should handle campaign with no strategies', async () => {
            const campaignId = 'campaign-123';
            const mockCampaign = {
                id: campaignId,
                name: 'Test Campaign',
                status: campaign_status_enum_1.CampaignStatus.ACTIVE,
                strategies: [],
            };
            campaignRepository.findOne.mockResolvedValue(mockCampaign);
            const result = await analyticsService.generateCampaignInsights(campaignId);
            expect(result.totalStrategies).toBe(0);
            expect(result.averageConfidenceScore).toBe(0);
            expect(result.estimatedTotalROI).toBe(0);
            expect(result.completionRate).toBe(0);
        });
        it('should throw NotFoundException when campaign does not exist', async () => {
            const campaignId = 'non-existent';
            campaignRepository.findOne.mockResolvedValue(null);
            await expect(analyticsService.generateCampaignInsights(campaignId)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should return completionRate 100 for COMPLETED campaign', async () => {
            const campaignId = 'campaign-123';
            const mockCampaign = {
                id: campaignId,
                name: 'Test Campaign',
                status: campaign_status_enum_1.CampaignStatus.COMPLETED,
                strategies: [],
            };
            campaignRepository.findOne.mockResolvedValue(mockCampaign);
            const result = await analyticsService.generateCampaignInsights(campaignId);
            expect(result.completionRate).toBe(100);
        });
    });
    describe('calculateEngagementMetrics', () => {
        it('should calculate engagement metrics for a user', async () => {
            const userId = 'user-123';
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const mockBehaviors = [
                {
                    id: '1',
                    userId,
                    sessionId: 'session1',
                    eventType: user_behavior_event_enum_1.UserBehaviorEvent.CONTENT_CREATE,
                    timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
                },
                {
                    id: '2',
                    userId,
                    sessionId: 'session1',
                    eventType: user_behavior_event_enum_1.UserBehaviorEvent.PUBLISH_TASK,
                    timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
                },
                {
                    id: '3',
                    userId,
                    sessionId: 'session1',
                    eventType: user_behavior_event_enum_1.UserBehaviorEvent.LOGIN,
                    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
                },
                {
                    id: '4',
                    userId,
                    sessionId: 'session2',
                    eventType: user_behavior_event_enum_1.UserBehaviorEvent.LOGIN,
                    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
                },
            ];
            userBehaviorRepository.find.mockResolvedValue(mockBehaviors);
            userBehaviorRepository.find.mockResolvedValue(mockBehaviors);
            const result = await analyticsService.calculateEngagementMetrics(userId);
            expect(userBehaviorRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    userId,
                    timestamp: expect.any(Object),
                }),
            }));
            const findCall = userBehaviorRepository.find.mock
                .calls[0][0];
            expect(findCall.where.timestamp).toBeInstanceOf(Object);
            expect(findCall.where.timestamp._type).toBe('between');
            expect(findCall.where.timestamp._value[0]).toBeInstanceOf(Date);
            expect(findCall.where.timestamp._value[1]).toBeInstanceOf(Date);
            const startDate = findCall.where.timestamp._value[0];
            const endDate = findCall.where.timestamp._value[1];
            const timeDiff = endDate.getTime() - startDate.getTime();
            expect(timeDiff).toBeCloseTo(30 * 24 * 60 * 60 * 1000, -2);
            expect(result.userId).toBe(userId);
            expect(result.engagementScore).toBeGreaterThanOrEqual(0);
            expect(result.engagementScore).toBeLessThanOrEqual(100);
            expect(result.contentCreationRate).toBeDefined();
            expect(result.taskCompletionRate).toBeDefined();
            expect(result.loginFrequency).toBeDefined();
            expect(result.averageSessionTime).toBeDefined();
        });
        it('should handle user with no behaviors', async () => {
            const userId = 'user-123';
            userBehaviorRepository.find.mockResolvedValue([]);
            const result = await analyticsService.calculateEngagementMetrics(userId);
            expect(result.userId).toBe(userId);
            expect(result.engagementScore).toBe(0);
            expect(result.contentCreationRate).toBe(0);
            expect(result.taskCompletionRate).toBe(0);
            expect(result.loginFrequency).toBe(0);
            expect(result.averageSessionTime).toBe(0);
        });
    });
});
//# sourceMappingURL=analytics.service.spec.js.map