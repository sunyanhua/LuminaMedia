import { CampaignType } from '../../../shared/enums/campaign-type.enum';
export declare enum AIEngine {
    QWEN = "QWEN",
    GEMINI = "GEMINI",
    FALLBACK = "FALLBACK"
}
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
export interface GeminiStrategyResponse {
    campaignName?: string;
    targetAudienceAnalysis?: {
        demographics: string[];
        interests: string[];
        painPoints: string[];
        preferredChannels: string[];
        userPersonas?: Array<{
            name: string;
            description: string;
            behaviorTraits: string[];
            motivations: string[];
        }>;
    };
    coreIdea?: string;
    xhsContent?: {
        title: string;
        content: string;
        hashtags: string[];
        suggestedImages: string[];
    };
    wechatFullPlan?: {
        articleSeries?: Array<{
            title: string;
            theme: string;
            keyPoints: string[];
        }>;
        offlineDecoration?: string;
        membershipBenefits?: string;
    };
    recommendedExecutionTime?: {
        timeline: {
            phase: string;
            duration: string;
            activities: string[];
            milestones?: string[];
        }[];
        bestPostingTimes: string[];
        seasonalConsiderations: string[];
    };
    expectedPerformanceMetrics?: {
        engagementRate: number;
        conversionRate: number;
        expectedReach: number;
        estimatedCostPerClick?: number;
        estimatedROI: number;
    };
    executionSteps?: {
        step: number;
        description: string;
        responsible: string;
        deadline: string;
        dependencies?: number[];
        deliverables?: string[];
    }[];
    riskAssessment?: {
        risk: string;
        probability: '低' | '中' | '高';
        impact: '低' | '中' | '高';
        mitigationStrategy: string;
        contingencyPlan?: string;
    }[];
    budgetAllocation?: {
        category: string;
        amount: number;
        percentage: number;
        justification: string;
        costBreakdown?: string[];
    }[];
    engine?: AIEngine;
}
export interface GeminiConfig {
    apiKey?: string;
    apiKeys?: string[];
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
    timeout?: number;
}
export interface GeminiError {
    code: 'API_KEY_INVALID' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'CONTENT_BLOCKED' | 'UNKNOWN_ERROR';
    message: string;
    details?: any;
    fallbackUsed?: boolean;
}
export interface GeminiGenerateOptions {
    campaignSummary: CampaignSummary;
    strategyType?: string;
    useFallback?: boolean;
    timeout?: number;
    engine?: AIEngine;
}
