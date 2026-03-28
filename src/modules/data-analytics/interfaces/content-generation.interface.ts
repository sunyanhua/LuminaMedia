/**
 * AI内容生成服务接口定义
 */

import { Platform } from '../../../shared/enums/platform.enum';
import { CampaignSummary } from './gemini.interface';

/**
 * 生成的单一内容项
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

/**
 * 营销内容包（多平台）
 */
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
  generatedAt: Date;
}

/**
 * 内容生成选项
 */
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

/**
 * 营销内容生成选项
 */
export interface MarketingContentOptions {
  campaignSummary: CampaignSummary;
  targetPlatforms: Platform[];
  contentTypes?: string[]; // 例如 ["product_intro", "user_testimonial", "promotional"]
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';
  quantity?: number; // 每个平台生成的内容数量
}

/**
 * 内容模板
 */
export interface ContentTemplate {
  id: string;
  name: string;
  platform: Platform;
  templateType:
    | 'product_intro'
    | 'user_testimonial'
    | 'promotional'
    | 'educational'
    | 'announcement';
  promptTemplate: string;
  exampleOutput?: string;
  defaultTone?: string;
  suggestedHashtags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 内容质量评估结果
 */
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

/**
 * 内容生成结果
 */
export interface ContentGenerationResult {
  success: boolean;
  content?: GeneratedContent;
  marketingContent?: MarketingContent;
  qualityAssessment?: ContentQualityAssessment;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  processingTime?: number; // 毫秒
  modelUsed?: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
