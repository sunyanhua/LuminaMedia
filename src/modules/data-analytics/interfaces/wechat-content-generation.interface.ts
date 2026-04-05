/**
 * 微信公众号内容生成服务接口定义
 */

import { Platform } from '../../../shared/enums/platform.enum';
import { TenantProfile } from '../../../entities/tenant-profile.entity';
import { Topic } from '../../../entities/topic.entity';
import { Material } from '../../../entities/material.entity';

/**
 * 内容生成请求
 */
export interface WechatContentGenerationRequest {
  topicId: string;
  tenantId: string;
  userId: string;
  options?: WechatContentGenerationOptions;
}

/**
 * 内容生成选项
 */
export interface WechatContentGenerationOptions {
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';
  wordCount?: number;
  includeImageSuggestions?: boolean;
  temperature?: number;
  maxTokens?: number;
  languageStyle?: string; // 语言风格覆盖
  visualPreference?: string; // 视觉偏好覆盖
}

/**
 * 生成的微信公众号文章
 */
export interface GeneratedWechatArticle {
  title: string;
  content: string;
  summary: string;
  titleOptions: string[]; // 3-5个标题选项
  imageSuggestions?: string[]; // 配图建议
  hashtags?: string[];
  estimatedReadingTime?: string;
  wordCount?: number;
  tone?: string;
  languageStyle?: string;
  visualSuggestions?: VisualSuggestion[];
  metadata: {
    topicId: string;
    tenantId: string;
    userId: string;
    generatedAt: Date;
    modelUsed: string;
    profileInfluenced: boolean; // 是否受单位画像影响
    materialsUsed: number; // 使用的素材数量
  };
}

/**
 * 视觉建议
 */
export interface VisualSuggestion {
  type: 'image' | 'layout' | 'color';
  description: string;
  suggestion: string;
  reason: string;
}

/**
 * 内容生成结果
 */
export interface WechatContentGenerationResult {
  success: boolean;
  article?: GeneratedWechatArticle;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  processingTime?: number;
  modelUsed?: string;
  qualityAssessment?: ContentQualityAssessment;
}

/**
 * 内容质量评估结果（复用现有接口）
 */
export interface ContentQualityAssessment {
  score: number; // 0-100
  metrics: {
    readability: number;
    engagement: number;
    relevance: number;
    originality: number;
    platformFit: number;
  };
  feedback: string;
  improvementSuggestions?: string[];
}

/**
 * 内容生成上下文（用于构建提示词）
 */
export interface ContentGenerationContext {
  topic: Topic | null;
  materials: Material[];
  tenantProfile?: TenantProfile | null;
  options: WechatContentGenerationOptions;
}

/**
 * 提示词构建器结果
 */
export interface PromptBuilderResult {
  systemPrompt: string;
  userPrompt: string;
  contextSummary: string;
}