import apiClient from './apiClient';
import { Platform } from '../types/platform';
import { GenerateStrategyOptions, StrategyResponse } from './strategyService';

// 营销活动类型枚举 (与后端 CampaignType 枚举保持一致)
export enum CampaignType {
  ONLINE = 'ONLINE', // 线上活动
  OFFLINE = 'OFFLINE', // 线下活动
  HYBRID = 'HYBRID', // 混合活动
}

/**
 * 内容生成相关接口定义
 */

export interface GeneratedContent {
  title: string;
  content: string;
  hashtags: string[];
  suggestedImages?: string[];
  platform: Platform;
  qualityScore?: number; // 0-100
  wordCount?: number;
  estimatedReadingTime?: string; // 例如 "3分钟"
  sentiment?: 'positive' | 'neutral' | 'negative';
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';
}

export interface MarketingContent {
  campaignId: string;
  campaignName: string;
  contents: GeneratedContent[];
  overallQualityScore: number;
  consistencyScore?: number; // 跨平台内容一致性评分
  recommendedPostingSchedule: {
    platform: Platform;
    bestTimes: string[];
    frequency: string; // 例如 "每周3次"
  }[];
  contentStrategySummary: string;
  generatedAt: string;
}

export interface ContentGenerationOptions {
  prompt: string;
  platform: Platform;
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';
  wordCount?: number;
  includeHashtags?: boolean;
  includeImageSuggestions?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface MarketingContentOptions {
  campaignId: string;
  campaignName: string;
  campaignType: CampaignType;
  targetAudience: Record<string, any>;
  budget: number;
  userId: string;
  targetPlatforms: Platform[];
  startDate?: string;
  endDate?: string;
  contentTypes?: string[]; // 例如 ["product_intro", "user_testimonial", "promotional"]
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';
  quantity?: number; // 每个平台生成的内容数量
}

export interface ContentTemplate {
  id: string;
  name: string;
  platform: Platform;
  templateType: 'product_intro' | 'user_testimonial' | 'promotional' | 'educational' | 'announcement';
  promptTemplate: string;
  exampleOutput?: string;
  defaultTone?: string;
  suggestedHashtags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentQualityAssessment {
  score: number; // 0-100
  metrics: {
    readability: number;
    engagement: number;
    relevance: number;
    originality: number;
    platformFit: number; // 平台适配度
  };
  feedback: string;
  improvementSuggestions: string[];
}

export interface ContentGenerationResult {
  success: boolean;
  data?: GeneratedContent;
  qualityAssessment?: ContentQualityAssessment;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  processingTime?: number; // 毫秒
  modelUsed?: string;
}

export interface MarketingContentGenerationResult {
  success: boolean;
  marketingContent?: MarketingContent;
  processingTime?: number;
  modelUsed?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface TemplatesResponse {
  success: boolean;
  data: ContentTemplate[];
  count: number;
}

export interface GeminiStatusResponse {
  success: boolean;
  data: {
    geminiAvailable: boolean;
    timestamp: string;
  };
}

export interface GeminiHealthResponse {
  success: boolean;
  data: {
    geminiAvailable: boolean;
    timestamp: string;
    error?: string;
    details?: any;
  };
}

/**
 * 内容生成服务
 */
export const contentGenerationService = {
  /**
   * 生成单条文案
   */
  generateText: (options: ContentGenerationOptions): Promise<ContentGenerationResult> => {
    return apiClient.post('/api/v1/content-generation/generate/text', options);
  },

  /**
   * 生成营销内容包
   */
  generateMarketingContent: (options: MarketingContentOptions): Promise<MarketingContentGenerationResult> => {
    return apiClient.post('/api/v1/content-generation/generate/marketing-content', options);
  },

  /**
   * 获取所有内容模板
   */
  getTemplates: (platform?: Platform): Promise<TemplatesResponse> => {
    const params = platform ? { platform } : {};
    return apiClient.get('/api/v1/content-generation/templates', { params });
  },

  /**
   * 检查Gemini API可用性
   */
  getGeminiStatus: (): Promise<GeminiStatusResponse> => {
    return apiClient.get('/api/v1/content-generation/status');
  },

  /**
   * 检查Gemini API健康状态
   */
  getGeminiHealth: (): Promise<GeminiHealthResponse> => {
    return apiClient.get('/api/v1/content-generation/health');
  },

  /**
   * 为特定平台生成内容（简化方法）
   */
  generateContentForPlatform: async (
    platform: Platform,
    prompt: string,
    tone: 'formal' | 'casual' | 'friendly' | 'professional' = 'casual'
  ): Promise<ContentGenerationResult> => {
    return apiClient.post('/api/v1/content-generation/generate/text', {
      prompt,
      platform,
      tone,
      includeHashtags: true,
      includeImageSuggestions: true,
    });
  },

  /**
   * 为矩阵平台生成内容（批量生成）
   */
  generateContentForMatrix: async (
    platforms: Platform[],
    _basePrompt: string,
    tone: 'formal' | 'casual' | 'friendly' | 'professional' = 'casual'
  ): Promise<MarketingContentGenerationResult> => {
    // 这里使用模拟的活动ID，实际应用中可能需要真实的campaignId
    const mockCampaignId = 'matrix-content-' + Date.now();

    return apiClient.post('/api/v1/content-generation/generate/marketing-content', {
      campaignId: mockCampaignId,
      campaignName: '矩阵内容生成活动',
      campaignType: CampaignType.ONLINE,
      targetAudience: { ageGroup: '18-35', interests: ['科技', '时尚'] },
      budget: 5000,
      userId: 'demo-user-001',
      targetPlatforms: platforms,
      tone,
      contentTypes: ['promotional'],
      quantity: 1,
    });
  },

  /**
   * 生成营销策略（新接口包装）
   */
  generateStrategy: (options: GenerateStrategyOptions): Promise<StrategyResponse> => {
    // 直接调用策略服务
    return apiClient.post('/api/v1/analytics/strategies/generate', options);
  },
};

export default contentGenerationService;