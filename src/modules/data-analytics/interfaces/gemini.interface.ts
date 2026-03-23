/**
 * Google Gemini API 集成接口定义
 */

import { CampaignType } from '../../../shared/enums/campaign-type.enum';

/**
 * AI引擎类型枚举
 */
export enum AIEngine {
  QWEN = 'QWEN',
  GEMINI = 'GEMINI',
  FALLBACK = 'FALLBACK'
}

/**
 * 营销活动摘要信息
 */
export interface CampaignSummary {
  id: string;
  name: string;
  campaignType: CampaignType;
  targetAudience: Record<string, any>;
  budget: number;
  startDate?: Date;
  endDate?: Date;
  userId: string;
  insights?: {
    totalStrategies: number;
    averageConfidenceScore: number;
    strategyTypeDistribution: Record<string, number>;
    estimatedTotalROI: number;
    completionRate: number;
  };
}

/**
 * Gemini API 返回的营销策略方案结构
 */
export interface GeminiStrategyResponse {
  campaignName?: string;
  targetAudienceAnalysis?: {
    demographics: string[];
    interests: string[];
    painPoints: string[];
    preferredChannels: string[];
  };
  coreIdea?: string;
  xhsContent?: {
    title: string;
    content: string;
    hashtags: string[];
    suggestedImages: string[];
  };
  recommendedExecutionTime?: {
    timeline: {
      phase: string;
      duration: string;
      activities: string[];
    }[];
    bestPostingTimes: string[];
    seasonalConsiderations: string[];
  };
  expectedPerformanceMetrics?: {
    engagementRate: number; // 互动率 (0-100)
    conversionRate: number; // 转化率 (0-100)
    expectedReach: number; // 预期覆盖人数
    estimatedCostPerClick?: number; // 预估每次点击成本
    estimatedROI: number; // 预估投资回报率
  };
  executionSteps?: {
    step: number;
    description: string;
    responsible: string;
    deadline: string;
    dependencies?: number[];
  }[];
  riskAssessment?: {
    risk: string;
    probability: '低' | '中' | '高';
    impact: '低' | '中' | '高';
    mitigationStrategy: string;
  }[];
  budgetAllocation?: {
    category: string;
    amount: number;
    percentage: number;
    justification: string;
  }[];
  engine?: AIEngine;
}

/**
 * Gemini API 配置
 */
export interface GeminiConfig {
  apiKey?: string; // 单个API Key（向后兼容）
  apiKeys?: string[]; // 多个API Key数组（逗号分隔）
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  timeout?: number;
}

/**
 * Gemini API 错误类型
 */
export interface GeminiError {
  code:
    | 'API_KEY_INVALID'
    | 'QUOTA_EXCEEDED'
    | 'NETWORK_ERROR'
    | 'PARSE_ERROR'
    | 'CONTENT_BLOCKED'
    | 'UNKNOWN_ERROR';
  message: string;
  details?: any;
  fallbackUsed?: boolean;
}

/**
 * Gemini 生成选项
 */
export interface GeminiGenerateOptions {
  campaignSummary: CampaignSummary;
  strategyType?: string;
  useFallback?: boolean;
  timeout?: number;
  engine?: AIEngine;
}
