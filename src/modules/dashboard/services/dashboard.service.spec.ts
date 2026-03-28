import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { User } from '../../../entities/user.entity';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { DataImportJob } from '../../../entities/data-import-job.entity';
import { CustomerSegment } from '../../../entities/customer-segment.entity';
import { UserBehavior } from '../../data-analytics/entities/user-behavior.entity';
import { MarketingCampaign } from '../../data-analytics/entities/marketing-campaign.entity';
import { MarketingStrategy } from '../../data-analytics/entities/marketing-strategy.entity';
import { CampaignStatus } from '../../../shared/enums/campaign-status.enum';
import { UserBehaviorEvent } from '../../../shared/enums/user-behavior-event.enum';
import {
  DashboardStats,
  CustomerOverview,
  MarketingPerformance,
  RealTimeMetrics,
  ChartData,
  DashboardReportRequest,
} from '../interfaces/dashboard.interface';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let userRepository: Repository<User>;
  let customerProfileRepository: Repository<CustomerProfile>;
  let dataImportJobRepository: Repository<DataImportJob>;
  let customerSegmentRepository: Repository<CustomerSegment>;
  let userBehaviorRepository: Repository<UserBehavior>;
  let marketingCampaignRepository: Repository<MarketingCampaign>;
  let marketingStrategyRepository: Repository<MarketingStrategy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CustomerProfile),
          useValue: {
            count: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DataImportJob),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CustomerSegment),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserBehavior),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MarketingCampaign),
          useValue: {
            count: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MarketingStrategy),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    customerProfileRepository = module.get<Repository<CustomerProfile>>(
      getRepositoryToken(CustomerProfile),
    );
    dataImportJobRepository = module.get<Repository<DataImportJob>>(
      getRepositoryToken(DataImportJob),
    );
    customerSegmentRepository = module.get<Repository<CustomerSegment>>(
      getRepositoryToken(CustomerSegment),
    );
    userBehaviorRepository = module.get<Repository<UserBehavior>>(
      getRepositoryToken(UserBehavior),
    );
    marketingCampaignRepository = module.get<Repository<MarketingCampaign>>(
      getRepositoryToken(MarketingCampaign),
    );
    marketingStrategyRepository = module.get<Repository<MarketingStrategy>>(
      getRepositoryToken(MarketingStrategy),
    );
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

      (userRepository.count as jest.Mock).mockResolvedValue(
        mockCounts.userCount,
      );
      (marketingCampaignRepository.count as jest.Mock)
        .mockResolvedValueOnce(mockCounts.campaignCount)
        .mockResolvedValueOnce(mockCounts.activeCampaignCount);
      (marketingStrategyRepository.count as jest.Mock).mockResolvedValue(
        mockCounts.strategyCount,
      );
      (customerProfileRepository.count as jest.Mock).mockResolvedValue(
        mockCounts.customerProfileCount,
      );

      // Mock the query builder for active users
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest
          .fn()
          .mockResolvedValue({ count: mockCounts.activeUserCount.toString() }),
      };
      (userBehaviorRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      const result = await dashboardService.getDashboardStats(mockQuery);

      expect(userRepository.count).toHaveBeenCalled();
      expect(userBehaviorRepository.createQueryBuilder).toHaveBeenCalledWith(
        'behavior',
      );
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
      (userRepository.count as jest.Mock).mockResolvedValue(0);
      (marketingCampaignRepository.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      (marketingStrategyRepository.count as jest.Mock).mockResolvedValue(0);
      (customerProfileRepository.count as jest.Mock).mockResolvedValue(0);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
      };
      (userBehaviorRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

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

      (customerProfileRepository.findOne as jest.Mock).mockResolvedValue(
        mockCustomerProfile,
      );
      (customerSegmentRepository.find as jest.Mock).mockResolvedValue(
        mockSegments,
      );

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
      (customerProfileRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await dashboardService.getCustomerOverview(profileId);

      expect(customerProfileRepository.findOne).toHaveBeenCalledWith({
        where: { id: profileId },
      });
      // Should return default mock data
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

      (customerProfileRepository.findOne as jest.Mock).mockResolvedValue(
        mockCustomerProfile,
      );
      (customerSegmentRepository.find as jest.Mock).mockResolvedValue([]);

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

      (marketingCampaignRepository.findOne as jest.Mock).mockResolvedValue(
        mockCampaign,
      );
      (marketingStrategyRepository.find as jest.Mock).mockResolvedValue(
        mockStrategies,
      );

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
      (marketingCampaignRepository.findOne as jest.Mock).mockResolvedValue(
        null,
      );

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
        { sessionId: 'session1', eventType: UserBehaviorEvent.PAGE_VIEW },
        { sessionId: 'session1', eventType: UserBehaviorEvent.CAMPAIGN_CREATE },
        {
          sessionId: 'session2',
          eventType: UserBehaviorEvent.STRATEGY_GENERATE,
        },
        { sessionId: 'session3', eventType: UserBehaviorEvent.CONTENT_CREATE },
        { sessionId: 'session3', eventType: UserBehaviorEvent.PUBLISH_TASK },
      ];

      (userBehaviorRepository.find as jest.Mock).mockResolvedValue(
        mockBehaviors,
      );

      const result = await dashboardService.getRealTimeMetrics(lastMinutes);

      expect(userBehaviorRepository.find).toHaveBeenCalledWith({
        where: { timestamp: MoreThanOrEqual(expect.any(Date)) },
      });

      expect(result.activeSessions).toBe(3); // 3 unique sessionIds
      expect(result.recentConversions).toBe(2); // CAMPAIGN_CREATE + STRATEGY_GENERATE
      expect(result.contentViews).toBe(1); // PAGE_VIEW
      expect(result.socialEngagements).toBe(2); // CONTENT_CREATE + PUBLISH_TASK
      expect(result.apiCalls).toBe(5); // total behaviors
      expect(result.timestamp).toBeDefined();
    });

    it('should handle empty behaviors', async () => {
      const lastMinutes = 5;
      (userBehaviorRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getRealTimeMetrics(lastMinutes);

      expect(result.activeSessions).toBe(0);
      expect(result.recentConversions).toBe(0);
      expect(result.contentViews).toBe(0);
      expect(result.socialEngagements).toBe(0);
      expect(result.apiCalls).toBe(0);
    });
  });

  // Note: Due to time constraints, we're adding basic tests for the main methods.
  // Additional tests can be added for other chart methods as needed.
});
