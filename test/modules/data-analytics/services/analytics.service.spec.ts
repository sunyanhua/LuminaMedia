import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Between } from 'typeorm';
import { AnalyticsService } from '../../../../src/modules/data-analytics/services/analytics.service';
import { UserBehaviorRepository } from '../../../../src/shared/repositories/user-behavior.repository';
import { MarketingCampaignRepository } from '../../../../src/shared/repositories/marketing-campaign.repository';
import { MarketingStrategyRepository } from '../../../../src/shared/repositories/marketing-strategy.repository';
import { UserBehavior } from '../../../../src/modules/data-analytics/entities/user-behavior.entity';
import { MarketingCampaign } from '../../../../src/modules/data-analytics/entities/marketing-campaign.entity';
import { MarketingStrategy } from '../../../../src/modules/data-analytics/entities/marketing-strategy.entity';
import { DateRange } from '../../../../src/modules/data-analytics/interfaces/date-range.interface';
import { UserBehaviorEvent } from '../../../../src/shared/enums/user-behavior-event.enum';
import { CampaignStatus } from '../../../../src/shared/enums/campaign-status.enum';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let userBehaviorRepository: UserBehaviorRepository;
  let campaignRepository: MarketingCampaignRepository;
  let strategyRepository: MarketingStrategyRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(UserBehaviorRepository),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MarketingCampaignRepository),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MarketingStrategyRepository),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    analyticsService = module.get<AnalyticsService>(AnalyticsService);
    userBehaviorRepository = module.get<UserBehaviorRepository>(
      getRepositoryToken(UserBehaviorRepository),
    );
    campaignRepository = module.get<MarketingCampaignRepository>(
      getRepositoryToken(MarketingCampaignRepository),
    );
    strategyRepository = module.get<MarketingStrategyRepository>(
      getRepositoryToken(MarketingStrategyRepository),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeUserBehavior', () => {
    it('should return behavior analytics for a user with valid data', async () => {
      const userId = 'user-123';
      const dateRange: DateRange = {
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-31'),
      };

      const mockBehaviors = [
        {
          id: '1',
          userId,
          sessionId: 'session1',
          eventType: UserBehaviorEvent.PAGE_VIEW,
          timestamp: new Date('2026-03-15T10:00:00'),
        },
        {
          id: '2',
          userId,
          sessionId: 'session1',
          eventType: UserBehaviorEvent.CAMPAIGN_CREATE,
          timestamp: new Date('2026-03-15T10:05:00'),
        },
        {
          id: '3',
          userId,
          sessionId: 'session2',
          eventType: UserBehaviorEvent.STRATEGY_GENERATE,
          timestamp: new Date('2026-03-16T14:00:00'),
        },
      ];

      (userBehaviorRepository.find as jest.Mock).mockResolvedValue(
        mockBehaviors,
      );

      const result = await analyticsService.analyzeUserBehavior(
        userId,
        dateRange,
      );

      expect(userBehaviorRepository.find).toHaveBeenCalledWith({
        where: {
          userId,
          timestamp: Between(dateRange.startDate, dateRange.endDate),
        },
        order: { timestamp: 'ASC' },
      });

      expect(result.userId).toBe(userId);
      expect(result.totalEvents).toBe(3);
      expect(result.eventDistribution[UserBehaviorEvent.PAGE_VIEW]).toBe(1);
      expect(result.eventDistribution[UserBehaviorEvent.CAMPAIGN_CREATE]).toBe(
        1,
      );
      expect(
        result.eventDistribution[UserBehaviorEvent.STRATEGY_GENERATE],
      ).toBe(1);
      expect(result.sessionCount).toBe(2); // 2 unique sessionIds
      expect(result.dailyActiveDays).toBe(2); // 2 unique days
      expect(result.averageEventsPerDay).toBe(1.5); // 3 events / 2 days
      expect(result.mostActiveHour).toBeDefined();
      expect(result.mostCommonEvent).toBeDefined();
      expect(result.averageSessionDuration).toBeDefined();
    });

    it('should throw NotFoundException when no behavior data found', async () => {
      const userId = 'user-123';
      const dateRange: DateRange = {
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-31'),
      };

      (userBehaviorRepository.find as jest.Mock).mockResolvedValue([]);

      await expect(
        analyticsService.analyzeUserBehavior(userId, dateRange),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateCampaignInsights', () => {
    it('should return campaign insights for an existing campaign', async () => {
      const campaignId = 'campaign-123';
      const mockCampaign = {
        id: campaignId,
        name: 'Test Campaign',
        status: CampaignStatus.ACTIVE,
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

      (campaignRepository.findOne as jest.Mock).mockResolvedValue(mockCampaign);

      const result =
        await analyticsService.generateCampaignInsights(campaignId);

      expect(campaignRepository.findOne).toHaveBeenCalledWith({
        where: { id: campaignId },
        relations: ['strategies'],
      });

      expect(result.campaignId).toBe(campaignId);
      expect(result.totalStrategies).toBe(3);
      expect(result.averageConfidenceScore).toBeCloseTo(0.8); // (0.8 + 0.9 + 0.7) / 3 = 0.8
      expect(result.strategyTypeDistribution['social_media']).toBe(2);
      expect(result.strategyTypeDistribution['email_marketing']).toBe(1);
      expect(result.estimatedTotalROI).toBe(5000); // 1500 + 2500 + 1000
      expect(result.completionRate).toBe(0); // status is ACTIVE, not COMPLETED
    });

    it('should handle campaign with no strategies', async () => {
      const campaignId = 'campaign-123';
      const mockCampaign = {
        id: campaignId,
        name: 'Test Campaign',
        status: CampaignStatus.ACTIVE,
        strategies: [],
      };

      (campaignRepository.findOne as jest.Mock).mockResolvedValue(mockCampaign);

      const result =
        await analyticsService.generateCampaignInsights(campaignId);

      expect(result.totalStrategies).toBe(0);
      expect(result.averageConfidenceScore).toBe(0);
      expect(result.estimatedTotalROI).toBe(0);
      expect(result.completionRate).toBe(0);
    });

    it('should throw NotFoundException when campaign does not exist', async () => {
      const campaignId = 'non-existent';
      (campaignRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        analyticsService.generateCampaignInsights(campaignId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return completionRate 100 for COMPLETED campaign', async () => {
      const campaignId = 'campaign-123';
      const mockCampaign = {
        id: campaignId,
        name: 'Test Campaign',
        status: CampaignStatus.COMPLETED,
        strategies: [],
      };

      (campaignRepository.findOne as jest.Mock).mockResolvedValue(mockCampaign);

      const result =
        await analyticsService.generateCampaignInsights(campaignId);
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
          eventType: UserBehaviorEvent.CONTENT_CREATE,
          timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          userId,
          sessionId: 'session1',
          eventType: UserBehaviorEvent.PUBLISH_TASK,
          timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          id: '3',
          userId,
          sessionId: 'session1',
          eventType: UserBehaviorEvent.LOGIN,
          timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: '4',
          userId,
          sessionId: 'session2',
          eventType: UserBehaviorEvent.LOGIN,
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
      ];

      // Mock the main find call
      (userBehaviorRepository.find as jest.Mock).mockResolvedValue(
        mockBehaviors,
      );

      // Mock the private calculateSessionDurations method
      // We'll need to mock it indirectly by mocking the repository calls it makes
      // Since it's private, we'll rely on the public method's behavior
      // For simplicity, we'll assume the private method returns some durations
      // We'll need to mock the additional find call inside calculateSessionDurations
      // Let's mock it to return the same behaviors
      (userBehaviorRepository.find as jest.Mock).mockResolvedValue(
        mockBehaviors,
      );

      const result = await analyticsService.calculateEngagementMetrics(userId);

      expect(userBehaviorRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            timestamp: expect.any(Object), // Between operator
          }),
        }),
      );

      // 验证Between调用的大致时间范围
      const findCall = (userBehaviorRepository.find as jest.Mock).mock
        .calls[0][0];
      expect(findCall.where.timestamp).toBeInstanceOf(Object);
      expect(findCall.where.timestamp._type).toBe('between');
      expect(findCall.where.timestamp._value[0]).toBeInstanceOf(Date);
      expect(findCall.where.timestamp._value[1]).toBeInstanceOf(Date);

      // 检查日期是否在合理范围内（30天间隔）
      const startDate = findCall.where.timestamp._value[0];
      const endDate = findCall.where.timestamp._value[1];
      const timeDiff = endDate.getTime() - startDate.getTime();
      expect(timeDiff).toBeCloseTo(30 * 24 * 60 * 60 * 1000, -2); // 允许2位数字的误差

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
      (userBehaviorRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await analyticsService.calculateEngagementMetrics(userId);

      expect(result.userId).toBe(userId);
      expect(result.engagementScore).toBe(0);
      expect(result.contentCreationRate).toBe(0);
      expect(result.taskCompletionRate).toBe(0);
      expect(result.loginFrequency).toBe(0);
      expect(result.averageSessionTime).toBe(0);
    });
  });

  // Note: The calculateSessionDurations method is private, so we're not testing it directly.
  // It's tested indirectly through the public methods that call it.
});
