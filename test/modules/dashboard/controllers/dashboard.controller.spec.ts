import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from '../../../../src/modules/dashboard/controllers/dashboard.controller';
import { DashboardService } from '../../../../src/modules/dashboard/services/dashboard.service';
import {
  DashboardStats,
  CustomerOverview,
  MarketingPerformance,
  RealTimeMetrics,
  ChartData,
  DashboardReportResponse,
} from '../interfaces/dashboard.interface';

describe('DashboardController', () => {
  let dashboardController: DashboardController;
  let dashboardService: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getDashboardStats: jest.fn(),
            getCustomerOverview: jest.fn(),
            getMarketingPerformance: jest.fn(),
            getRealTimeMetrics: jest.fn(),
            getUserActivityChart: jest.fn(),
            getConsumptionDistributionChart: jest.fn(),
            getGeographicDistributionChart: jest.fn(),
            getROITrendChart: jest.fn(),
            getCustomerScatterChart: jest.fn(),
            getCustomerRadarChart: jest.fn(),
            getHeatmapChart: jest.fn(),
            generateDashboardReport: jest.fn(),
            exportDashboardData: jest.fn(),
            getParkingSpendingData: jest.fn(),
            getTrafficTimeSeriesData: jest.fn(),
          },
        },
      ],
    }).compile();

    dashboardController = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockQuery = {};
      const mockStats: DashboardStats = {
        totalUsers: 100,
        activeUsers: 50,
        totalRevenue: 50000,
        avgSessionTime: 300,
        totalCampaigns: 20,
        activeCampaigns: 15,
        totalStrategies: 30,
        customerProfiles: 200,
      };

      (dashboardService.getDashboardStats as jest.Mock).mockResolvedValue(
        mockStats,
      );

      const result = await dashboardController.getDashboardStats(mockQuery);

      expect(dashboardService.getDashboardStats).toHaveBeenCalledWith(
        mockQuery,
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('getCustomerOverview', () => {
    it('should return customer overview for a profile', async () => {
      const profileId = 'profile-123';
      const mockParams = { profileId };
      const mockOverview: CustomerOverview = {
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
          { name: 'VIP客户', size: 150, revenueContribution: 0.45 },
        ],
      };

      (dashboardService.getCustomerOverview as jest.Mock).mockResolvedValue(
        mockOverview,
      );

      const result = await dashboardController.getCustomerOverview(mockParams);

      expect(dashboardService.getCustomerOverview).toHaveBeenCalledWith(
        profileId,
      );
      expect(result).toEqual(mockOverview);
    });
  });

  describe('getMarketingPerformance', () => {
    it('should return marketing performance for a campaign', async () => {
      const campaignId = 'campaign-123';
      const mockParams = { campaignId };
      const granularity = 'daily';
      const mockPerformance: MarketingPerformance = {
        campaignId,
        campaignName: 'Test Campaign',
        metrics: {
          reach: 24500,
          engagement: 3200,
          conversion: 420,
          roi: 3.8,
          spend: 125000,
          revenue: 475000,
        },
        timeline: [
          {
            date: '2026-03-28',
            metrics: {
              reach: 2500,
              engagement: 320,
              conversion: 42,
              spend: 12500,
              revenue: 47500,
            },
          },
        ],
      };

      (dashboardService.getMarketingPerformance as jest.Mock).mockResolvedValue(
        mockPerformance,
      );

      const result = await dashboardController.getMarketingPerformance(
        mockParams,
        granularity,
      );

      expect(dashboardService.getMarketingPerformance).toHaveBeenCalledWith(
        campaignId,
        granularity,
      );
      expect(result).toEqual(mockPerformance);
    });
  });

  describe('getRealTimeMetrics', () => {
    it('should return real-time metrics', async () => {
      const mockQuery = { lastMinutes: 5 };
      const mockMetrics: RealTimeMetrics = {
        activeSessions: 10,
        recentConversions: 5,
        contentViews: 20,
        socialEngagements: 15,
        apiCalls: 50,
        timestamp: '2026-03-28T10:00:00.000Z',
      };

      (dashboardService.getRealTimeMetrics as jest.Mock).mockResolvedValue(
        mockMetrics,
      );

      const result = await dashboardController.getRealTimeMetrics(mockQuery);

      expect(dashboardService.getRealTimeMetrics).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockMetrics);
    });

    it('should use default lastMinutes when not provided', async () => {
      const mockQuery = {};
      const mockMetrics: RealTimeMetrics = {
        activeSessions: 0,
        recentConversions: 0,
        contentViews: 0,
        socialEngagements: 0,
        apiCalls: 0,
        timestamp: '2026-03-28T10:00:00.000Z',
      };

      (dashboardService.getRealTimeMetrics as jest.Mock).mockResolvedValue(
        mockMetrics,
      );

      const result = await dashboardController.getRealTimeMetrics(mockQuery);

      expect(dashboardService.getRealTimeMetrics).toHaveBeenCalledWith(
        undefined,
      );
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('chart endpoints', () => {
    const mockChartData: ChartData = {
      labels: ['Label1', 'Label2'],
      datasets: [
        {
          label: 'Test Data',
          data: [10, 20],
          backgroundColor: 'rgba(56, 189, 248, 0.2)',
          borderColor: 'rgba(56, 189, 248, 1)',
        },
      ],
    };

    it('getUserActivityChart should return chart data', async () => {
      const mockQuery = { days: 7, profileId: 'profile-123' };
      (dashboardService.getUserActivityChart as jest.Mock).mockResolvedValue(
        mockChartData,
      );

      const result = await dashboardController.getUserActivityChart(mockQuery);

      expect(dashboardService.getUserActivityChart).toHaveBeenCalledWith(
        7,
        'profile-123',
      );
      expect(result).toEqual(mockChartData);
    });

    it('getConsumptionDistributionChart should return chart data', async () => {
      const mockQuery = { profileId: 'profile-123' };
      (
        dashboardService.getConsumptionDistributionChart as jest.Mock
      ).mockResolvedValue(mockChartData);

      const result =
        await dashboardController.getConsumptionDistributionChart(mockQuery);

      expect(
        dashboardService.getConsumptionDistributionChart,
      ).toHaveBeenCalledWith('profile-123');
      expect(result).toEqual(mockChartData);
    });

    it('getGeographicDistributionChart should return chart data', async () => {
      const mockQuery = { profileId: 'profile-123' };
      (
        dashboardService.getGeographicDistributionChart as jest.Mock
      ).mockResolvedValue(mockChartData);

      const result =
        await dashboardController.getGeographicDistributionChart(mockQuery);

      expect(
        dashboardService.getGeographicDistributionChart,
      ).toHaveBeenCalledWith('profile-123');
      expect(result).toEqual(mockChartData);
    });

    it('getROITrendChart should return chart data', async () => {
      const mockQuery = { campaignId: 'campaign-123' };
      (dashboardService.getROITrendChart as jest.Mock).mockResolvedValue(
        mockChartData,
      );

      const result = await dashboardController.getROITrendChart(mockQuery);

      expect(dashboardService.getROITrendChart).toHaveBeenCalledWith(
        'campaign-123',
      );
      expect(result).toEqual(mockChartData);
    });

    it('getCustomerScatterChart should return chart data', async () => {
      const mockQuery = { profileId: 'profile-123' };
      (dashboardService.getCustomerScatterChart as jest.Mock).mockResolvedValue(
        mockChartData,
      );

      const result =
        await dashboardController.getCustomerScatterChart(mockQuery);

      expect(dashboardService.getCustomerScatterChart).toHaveBeenCalledWith(
        'profile-123',
      );
      expect(result).toEqual(mockChartData);
    });

    it('getCustomerRadarChart should return chart data', async () => {
      const mockQuery = { profileId: 'profile-123' };
      (dashboardService.getCustomerRadarChart as jest.Mock).mockResolvedValue(
        mockChartData,
      );

      const result = await dashboardController.getCustomerRadarChart(mockQuery);

      expect(dashboardService.getCustomerRadarChart).toHaveBeenCalledWith(
        'profile-123',
      );
      expect(result).toEqual(mockChartData);
    });

    it('getHeatmapChart should return chart data', async () => {
      const mockQuery = { days: 7, profileId: 'profile-123' };
      (dashboardService.getHeatmapChart as jest.Mock).mockResolvedValue(
        mockChartData,
      );

      const result = await dashboardController.getHeatmapChart(mockQuery);

      expect(dashboardService.getHeatmapChart).toHaveBeenCalledWith(
        7,
        'profile-123',
      );
      expect(result).toEqual(mockChartData);
    });
  });

  describe('generateDashboardReport', () => {
    it('should generate dashboard report', async () => {
      const mockBody = { reportType: 'pdf', period: 'monthly' };
      const mockResponse: DashboardReportResponse = {
        reportUrl: 'https://api.lumina-media.com/reports/dashboard-123.pdf',
      };

      (dashboardService.generateDashboardReport as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result =
        await dashboardController.generateDashboardReport(mockBody);

      expect(dashboardService.generateDashboardReport).toHaveBeenCalledWith(
        mockBody,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('exportDashboardData', () => {
    it('should export dashboard data', async () => {
      const mockQuery = { format: 'csv' };
      const mockResponse = {
        downloadUrl: 'https://api.lumina-media.com/exports/dashboard-123.csv',
      };

      (dashboardService.exportDashboardData as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await dashboardController.exportDashboardData(mockQuery);

      expect(dashboardService.exportDashboardData).toHaveBeenCalledWith('csv');
      expect(result).toEqual(mockResponse);
    });

    it('should use default format when not provided', async () => {
      const mockQuery = {};
      const mockResponse = {
        downloadUrl: 'https://api.lumina-media.com/exports/dashboard-123.json',
      };

      (dashboardService.exportDashboardData as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await dashboardController.exportDashboardData(mockQuery);

      expect(dashboardService.exportDashboardData).toHaveBeenCalledWith(
        undefined,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getParkingSpendingChart', () => {
    it('should return parking spending data', async () => {
      const profileId = 'profile-123';
      const mockData = [
        { duration: '<1小时', avgSpending: 300, userCount: 100 },
        { duration: '1-2小时', avgSpending: 450, userCount: 150 },
      ];

      (dashboardService.getParkingSpendingData as jest.Mock).mockResolvedValue(
        mockData,
      );

      const result =
        await dashboardController.getParkingSpendingChart(profileId);

      expect(dashboardService.getParkingSpendingData).toHaveBeenCalledWith(
        profileId,
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('getTrafficTimeSeriesChart', () => {
    it('should return traffic time series data', async () => {
      const profileId = 'profile-123';
      const days = 30;
      const mockData = [
        { date: '2026-03-01', value: 1200 },
        { date: '2026-03-02', value: 1300 },
      ];

      (
        dashboardService.getTrafficTimeSeriesData as jest.Mock
      ).mockResolvedValue(mockData);

      const result = await dashboardController.getTrafficTimeSeriesChart(
        profileId,
        days,
      );

      expect(dashboardService.getTrafficTimeSeriesData).toHaveBeenCalledWith(
        profileId,
        days,
      );
      expect(result).toEqual(mockData);
    });
  });
});
