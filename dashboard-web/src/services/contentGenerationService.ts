import apiClient from './apiClient';
import { Platform } from '../types/platform';

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
  targetPlatforms: Platform[];
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

/**
 * 内容生成服务
 */
export const contentGenerationService = {
  /**
   * 生成单条文案
   */
  generateText: (options: ContentGenerationOptions): Promise<ContentGenerationResult> => {
    return apiClient.post('/content-generation/generate/text', options);
  },

  /**
   * 生成营销内容包
   */
  generateMarketingContent: (options: MarketingContentOptions): Promise<MarketingContentGenerationResult> => {
    return apiClient.post('/content-generation/generate/marketing-content', options);
  },

  /**
   * 获取所有内容模板
   */
  getTemplates: (platform?: Platform): Promise<TemplatesResponse> => {
    const params = platform ? { platform } : {};
    return apiClient.get('/content-generation/templates', { params });
  },

  /**
   * 检查Gemini API可用性
   */
  getGeminiStatus: (): Promise<GeminiStatusResponse> => {
    return apiClient.get('/content-generation/status');
  },

  /**
   * 为特定平台生成内容（简化方法）
   */
  generateContentForPlatform: async (
    platform: Platform,
    prompt: string,
    tone: 'formal' | 'casual' | 'friendly' | 'professional' = 'casual'
  ): Promise<ContentGenerationResult> => {
    return apiClient.post('/content-generation/generate/text', {
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
    basePrompt: string,
    tone: 'formal' | 'casual' | 'friendly' | 'professional' = 'casual'
  ): Promise<MarketingContentGenerationResult> => {
    // 这里使用模拟的活动ID，实际应用中可能需要真实的campaignId
    const mockCampaignId = 'matrix-content-' + Date.now();

    return apiClient.post('/content-generation/generate/marketing-content', {
      campaignId: mockCampaignId,
      targetPlatforms: platforms,
      tone,
      contentTypes: ['promotional'],
      quantity: 1,
    });
  },
};

export default contentGenerationService;