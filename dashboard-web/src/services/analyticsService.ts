import apiClient from './apiClient';

export interface UserBehaviorSummary {
  totalEvents: number;
  uniqueUsers: number;
  avgSessionDuration: number;
  topEvents: Array<{ eventType: string; count: number }>;
  timelineData: Array<{ date: string; count: number }>;
}

export interface Campaign {
  id: string;
  name: string;
  campaignType: string;
  status: string;
  budget: number;
  startDate: string;
  endDate: string;
  expectedROI: number;
  actualROI?: number;
  createdBy: string;
  createdAt: string;
}

export interface MarketingStrategy {
  id: string;
  name: string;
  strategyType: string;
  description: string;
  targetAudience: string;
  expectedOutcome: string;
  confidenceScore: number;
  generatedBy: string;
  createdAt: string;
}

export interface GeneratedMarketingStrategy {
  id: string;
  campaignId: string;
  strategyType: string;
  description: string;
  implementationPlan: Record<string, any>;
  expectedROI: number;
  confidenceScore: number;
  generatedBy: string;
  campaignName?: string;
  targetAudienceAnalysis?: Record<string, any>;
  coreIdea?: string;
  xhsContent?: string | Record<string, any>;
  recommendedExecutionTime?: Record<string, any>;
  expectedPerformanceMetrics?: Record<string, any>;
  executionSteps?: Array<{ step: number; description: string; responsible: string; deadline: string }>;
  riskAssessment?: Array<{ risk: string; probability: string; impact: string; mitigationStrategy: string }>;
  budgetAllocation?: Array<{ category: string; amount: number; percentage: number; justification: string }>;
  aiResponseRaw?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockDataResponse {
  success: boolean;
  message: string;
  userId: string;
  dataCount: number;
}

export interface CustomerSegment {
  id: string;
  segmentName: string;
  memberCount: number;
  description?: string;
  criteria?: Record<string, any>;
  percentage?: number;
}

export interface ParkingSpendingData {
  duration: string;
  avgSpending: number;
  userCount: number;
}

export interface TrafficTimeSeries {
  date: string;
  value: number;
}

/**
 * 用户行为分析服务
 */
export const analyticsService = {
  /**
   * 获取用户行为摘要
   */
  getUserBehaviorSummary: (userId: string): Promise<UserBehaviorSummary> => {
    return apiClient.get(`/api/v1/analytics/behavior/${userId}/summary`);
  },

  /**
   * 获取营销活动列表
   */
  getCampaigns: (userId: string): Promise<Campaign[]> => {
    return apiClient.get(`/api/v1/analytics/campaigns`, { params: { userId } }).then(response => response.data.campaigns);
  },

  /**
   * 创建营销活动
   */
  createCampaign: (data: {
    userId: string;
    name: string;
    campaignType: string;
    budget: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Campaign> => {
    return apiClient.post(`/api/v1/analytics/campaigns`, data).then(response => response.data);
  },

  /**
   * 获取营销策略列表
   */
  getStrategies: (userId: string): Promise<MarketingStrategy[]> => {
    return apiClient.get(`/api/v1/analytics/strategies`, { params: { userId } });
  },

  /**
   * 生成营销策略 (向后兼容)
   */
  generateStrategy: (data: {
    userId: string;
    campaignId?: string;
    targetAudience?: string;
    budget?: number;
  }): Promise<MarketingStrategy> => {
    return apiClient.post(`/api/v1/analytics/strategies/generate`, data);
  },

  /**
   * 生成营销策略 (新版，匹配后端API)
   */
  generateMarketingStrategy: (data: {
    campaignId: string;
    strategyType?: string;
    generatedBy?: string;
    useGemini?: boolean;
  }): Promise<{ success: boolean; message: string; data: GeneratedMarketingStrategy; insights: any; aiGenerated: boolean }> => {
    return apiClient.post(`/api/v1/analytics/strategies/generate`, data);
  },

  /**
   * 获取活动策略列表
   */
  getCampaignStrategies: (campaignId: string): Promise<{ success: boolean; data: { campaignId: string; strategies: GeneratedMarketingStrategy[]; summary: string } }> => {
    return apiClient.get(`/api/v1/analytics/strategies/campaign/${campaignId}`);
  },

  /**
   * 评估策略
   */
  evaluateStrategy: (strategyId: string): Promise<{ success: boolean; message: string; data: { strategy: GeneratedMarketingStrategy; evaluation: { feasibilityScore: number; expectedImpact: string; risks: string[]; recommendations: string[] } } }> => {
    return apiClient.post(`/api/v1/analytics/strategies/${strategyId}/evaluate`, {});
  },

  /**
   * 获取推荐策略
   */
  getRecommendedStrategies: (userId: string): Promise<{ success: boolean; data: { userId: string; recommendations: GeneratedMarketingStrategy[]; summary: string } }> => {
    return apiClient.get(`/api/v1/analytics/strategies/recommendations/${userId}`);
  },

  /**
   * 为策略生成内容
   */
  generateStrategyContent: (strategyId: string, data: {
    targetPlatforms?: string[];
    contentTypes?: string[];
    tone?: string;
  }): Promise<{ success: boolean; message: string; data: { strategyId: string; generatedContent: any; contentPlatforms: string[] }; processingTime: number; modelUsed: string }> => {
    return apiClient.post(`/api/v1/analytics/strategies/${strategyId}/generate-content`, data);
  },

  /**
   * 生成模拟数据
   */
  generateMockData: (userId: string): Promise<MockDataResponse> => {
    return apiClient.post(`/api/v1/analytics/mock/generate`, { userId });
  },

  /**
   * 获取报告数据
   */
  getReport: (reportType: string, userId: string): Promise<any> => {
    return apiClient.get(`/api/v1/analytics/reports/${reportType}`, { params: { userId } });
  },

  /**
   * 获取客户分群数据（零售商场分析）
   */
  getCustomerSegments: (profileId?: string): Promise<CustomerSegment[]> => {
    const targetProfileId = profileId || 'demo';
    return apiClient.get(`/api/v1/customer-data/profiles/${targetProfileId}/segments`);
  },

  /**
   * 获取停车时长与消费金额关系数据
   */
  getParkingSpendingData: (profileId?: string): Promise<ParkingSpendingData[]> => {
    const targetProfileId = profileId || 'demo';
    return apiClient.get(`/api/v1/dashboard/charts/parking-spending`, { params: { profileId: targetProfileId } });
  },

  /**
   * 获取每日客流趋势数据
   */
  getTrafficTimeSeries: (profileId?: string, days?: number): Promise<TrafficTimeSeries[]> => {
    const targetProfileId = profileId || 'demo';
    const targetDays = days || 30;
    return apiClient.get(`/api/v1/dashboard/charts/traffic-timeseries`, { params: { profileId: targetProfileId, days: targetDays } });
  },
};

export default analyticsService;