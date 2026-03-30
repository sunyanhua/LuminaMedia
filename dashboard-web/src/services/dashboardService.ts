import apiClient from './apiClient';
import { executeWithDemoWrapper, generateMockData } from './demoModeService';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  avgSessionTime: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalStrategies: number;
  customerProfiles: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor: string | string[];
  }>;
}

export interface CustomerOverview {
  demographicDistribution: {
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
    location: Record<string, number>;
  };
  behaviorMetrics: {
    averagePurchaseFrequency: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    retentionRate: number;
  };
  topSegments: Array<{
    name: string;
    size: number;
    revenueContribution: number;
  }>;
}

export interface MarketingPerformance {
  campaignId: string;
  campaignName: string;
  metrics: {
    reach: number;
    engagement: number;
    conversion: number;
    roi: number;
    spend: number;
    revenue: number;
  };
  timeline: Array<{
    date: string;
    metrics: Record<string, number>;
  }>;
}

export interface RealTimeMetrics {
  activeSessions: number;
  recentConversions: number;
  contentViews: number;
  socialEngagements: number;
  apiCalls: number;
  timestamp: string;
}

/**
 * 数据看板服务
 */
export const dashboardService = {
  /**
   * 获取仪表板概览统计
   */
  getDashboardStats: (): Promise<DashboardStats> => {
    return executeWithDemoWrapper(
      () => apiClient.get(`/api/v1/dashboard/stats`),
      () => Promise.resolve(generateMockData.dashboardStats())
    );
  },

  /**
   * 获取客户概览数据
   */
  getCustomerOverview: (profileId: string): Promise<CustomerOverview> => {
    return apiClient.get(`/api/v1/dashboard/customer-overview/${profileId}`);
  },

  /**
   * 获取营销活动表现数据
   */
  getMarketingPerformance: (campaignId: string): Promise<MarketingPerformance> => {
    return apiClient.get(`/api/v1/dashboard/marketing-performance/${campaignId}`);
  },

  /**
   * 获取实时指标
   */
  getRealTimeMetrics: (): Promise<RealTimeMetrics> => {
    return executeWithDemoWrapper(
      () => apiClient.get(`/api/v1/dashboard/real-time-metrics`),
      () => Promise.resolve(generateMockData.realTimeMetrics())
    );
  },

  /**
   * 获取用户活跃度图表数据
   */
  getUserActivityChart: (days: number = 7): Promise<ChartData> => {
    return apiClient.get(`/api/v1/dashboard/charts/user-activity`, { params: { days } });
  },

  /**
   * 获取消费频次分布图表数据
   */
  getConsumptionDistributionChart: (): Promise<ChartData> => {
    return apiClient.get(`/api/v1/dashboard/charts/consumption-distribution`);
  },

  /**
   * 获取地理位置分布图表数据
   */
  getGeographicDistributionChart: (): Promise<ChartData> => {
    return apiClient.get(`/api/v1/dashboard/charts/geographic-distribution`);
  },

  /**
   * 获取营销ROI趋势图表数据
   */
  getROITrendChart: (campaignId?: string): Promise<ChartData> => {
    return apiClient.get(`/api/v1/dashboard/charts/roi-trend`, { params: { campaignId } });
  },

  /**
   * 获取客户散点图数据（新增图表类型）
   */
  getCustomerScatterChart: (profileId?: string): Promise<ChartData> => {
    return apiClient.get(`/api/v1/dashboard/charts/customer-scatter`, { params: { profileId } });
  },

  /**
   * 获取客户雷达图数据（新增图表类型）
   */
  getCustomerRadarChart: (profileId?: string): Promise<ChartData> => {
    return apiClient.get(`/api/v1/dashboard/charts/customer-radar`, { params: { profileId } });
  },

  /**
   * 获取热力图数据（新增图表类型）
   */
  getHeatmapChart: (days: number = 7, profileId?: string): Promise<ChartData> => {
    return apiClient.get(`/api/v1/dashboard/charts/heatmap`, { params: { days, profileId } });
  },

  /**
   * 生成数据看板报告
   */
  generateDashboardReport: (data: {
    profileId?: string;
    campaignId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ reportUrl: string }> => {
    return apiClient.post(`/api/v1/dashboard/generate-report`, data);
  },

  /**
   * 导出数据看板数据
   */
  exportDashboardData: (format: 'csv' | 'json' = 'json'): Promise<{ downloadUrl: string }> => {
    return apiClient.get(`/api/v1/dashboard/export`, { params: { format } });
  },
};

export default dashboardService;