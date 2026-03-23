import apiClient from './apiClient';
import { StrategyType } from '../types/strategy';
import { GenerationMethod } from '../types/generation-method';
import { AIEngine } from '../types/ai-engine';

/**
 * 策略生成相关接口定义
 */

export interface GenerateStrategyOptions {
  campaignId: string;
  strategyType?: StrategyType;
  generatedBy?: GenerationMethod;
  useGemini?: boolean;
}

export interface StrategyResponse {
  success: boolean;
  message: string;
  data: MarketingStrategy;
  insights: StrategyInsights;
  aiGenerated: boolean;
}

export interface MarketingStrategy {
  id: string;
  campaignId: string;
  strategyType: StrategyType;
  description: string;
  implementationPlan?: Record<string, any>;
  expectedROI?: number;
  confidenceScore: number;
  generatedBy: GenerationMethod;
  createdAt: string;
  campaignName?: string;
  targetAudienceAnalysis?: Record<string, any>;
  coreIdea?: string;
  xhsContent?: string;
  recommendedExecutionTime?: Record<string, any>;
  expectedPerformanceMetrics?: Record<string, any>;
  executionSteps?: Record<string, any>;
  riskAssessment?: Record<string, any>;
  budgetAllocation?: Record<string, any>;
  aiEngine: AIEngine;
  aiResponseRaw?: string;
  generatedContentIds?: string[];
  contentPlatforms?: string[];
}

export interface StrategyInsights {
  confidenceLevel: string;
  expectedImpact: string;
  implementationComplexity: string;
}

export interface CampaignStrategiesResponse {
  success: boolean;
  data: {
    campaignId: string;
    strategies: MarketingStrategy[];
    summary: string;
  };
}

export interface StrategyEvaluationResponse {
  success: boolean;
  message: string;
  data: {
    strategy: MarketingStrategy;
    evaluation: {
      feasibilityScore: number;
      expectedImpact: string;
      risks: string[];
      recommendations: string[];
    };
  };
}

export interface RecommendationsResponse {
  success: boolean;
  data: {
    userId: string;
    recommendations: MarketingStrategy[];
    summary: string;
  };
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

export interface CreateCampaignOptions {
  userId: string;
  name: string;
  campaignType: string;
  budget: number;
  startDate?: string;
  endDate?: string;
}

/**
 * 策略生成服务
 */
export const strategyService = {
  /**
   * 生成营销策略
   */
  generateStrategy: (options: GenerateStrategyOptions): Promise<StrategyResponse> => {
    return apiClient.post('/api/v1/analytics/strategies/generate', options);
  },

  /**
   * 创建营销活动
   */
  createCampaign: (options: CreateCampaignOptions): Promise<Campaign> => {
    return apiClient.post('/api/v1/analytics/campaigns', options).then(response => response.data);
  },

  /**
   * 获取活动的所有策略
   */
  getCampaignStrategies: (campaignId: string): Promise<CampaignStrategiesResponse> => {
    return apiClient.get(`/api/v1/analytics/strategies/campaign/${campaignId}`);
  },

  /**
   * 评估策略
   */
  evaluateStrategy: (strategyId: string): Promise<StrategyEvaluationResponse> => {
    return apiClient.post(`/api/v1/analytics/strategies/${strategyId}/evaluate`);
  },

  /**
   * 获取用户推荐策略
   */
  getRecommendedStrategies: (userId: string): Promise<RecommendationsResponse> => {
    return apiClient.get(`/api/v1/analytics/strategies/recommendations/${userId}`);
  },

  /**
   * 为策略生成内容
   */
  generateStrategyContent: (
    strategyId: string,
    targetPlatforms?: string[],
    contentTypes?: string[],
    tone?: string,
  ): Promise<any> => {
    return apiClient.post(`/api/v1/analytics/strategies/${strategyId}/generate-content`, {
      targetPlatforms,
      contentTypes,
      tone,
    });
  },
};

export default strategyService;