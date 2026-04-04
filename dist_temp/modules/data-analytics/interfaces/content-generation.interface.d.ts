import { Platform } from '../../../shared/enums/platform.enum';
import { CampaignSummary } from './gemini.interface';
export interface GeneratedContent {
    title: string;
    content: string;
    hashtags: string[];
    suggestedImages?: string[];
    platform: Platform;
    qualityScore?: number;
    wordCount?: number;
    estimatedReadingTime?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    tone?: 'formal' | 'casual' | 'friendly' | 'professional';
}
export interface MarketingContent {
    campaignId: string;
    campaignName: string;
    contents: GeneratedContent[];
    overallQualityScore: number;
    consistencyScore?: number;
    recommendedPostingSchedule: {
        platform: Platform;
        bestTimes: string[];
        frequency: string;
    }[];
    contentStrategySummary: string;
    generatedAt: Date;
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
    campaignSummary: CampaignSummary;
    targetPlatforms: Platform[];
    contentTypes?: string[];
    tone?: 'formal' | 'casual' | 'friendly' | 'professional';
    quantity?: number;
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
    createdAt: Date;
    updatedAt: Date;
}
export interface ContentQualityAssessment {
    score: number;
    metrics: {
        readability: number;
        engagement: number;
        relevance: number;
        originality: number;
        platformFit: number;
    };
    feedback: string;
    improvementSuggestions: string[];
}
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
    processingTime?: number;
    modelUsed?: string;
    tokenUsage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
