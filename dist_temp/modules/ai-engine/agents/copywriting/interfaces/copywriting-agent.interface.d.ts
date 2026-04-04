import { StrategyAgentOutput } from '../../strategy/interfaces/strategy-agent.interface';
export interface PlatformSpec {
    platform: 'wechat' | 'xiaohongshu' | 'weibo' | 'douyin' | 'other';
    description: string;
    contentType: 'article' | 'short_post' | 'video' | 'image' | 'carousel';
    wordLimit?: number;
    imageRequirements?: {
        count: number;
        dimensions: string[];
        formats: string[];
        styleSuggestions: string[];
    };
    videoRequirements?: {
        durationLimit: number;
        dimensions: string;
        formats: string[];
        contentRequirements: string[];
    };
    hashtagRequirements?: {
        count: number;
        trendingSuggestions: string[];
        brandHashtags: string[];
    };
    postingTimeSuggestions: string[];
    engagementSuggestions: string[];
    complianceRequirements: string[];
}
export interface BrandGuideline {
    brandName: string;
    tagline: string;
    brandValues: string[];
    brandPersonality: {
        adjectives: string[];
        toneOfVoice: 'formal' | 'casual' | 'enthusiastic' | 'professional' | 'friendly' | 'authoritative';
        communicationStyle: string[];
    };
    visualGuidelines: {
        brandColors: string[];
        typography: string[];
        imageStyle: string[];
        logoUsage: string[];
    };
    contentGuidelines: {
        keywords: string[];
        forbiddenTopics: string[];
        recommendedTopics: string[];
        successStories: string[];
    };
    customerPersonas: {
        name: string;
        characteristics: string[];
        communicationPreferences: string[];
    }[];
}
export interface WechatContent {
    title: string;
    subtitle?: string;
    author?: string;
    coverImageDescription: string;
    summary: string;
    body: string;
    sections: {
        heading: string;
        content: string;
        imageDescription?: string;
    }[];
    callToAction: {
        text: string;
        link?: string;
        qrCodeDescription?: string;
    };
    tags: string[];
    originalDeclaration: boolean;
    enableAppreciation: boolean;
}
export interface XHSContent {
    title: string;
    content: string;
    imageDescriptions: string[];
    hashtags: string[];
    location?: string;
    mentions: string[];
    productTags: {
        name: string;
        price?: number;
        link?: string;
    }[];
    engagementPrompt: string;
}
export interface WeiboContent {
    content: string;
    imageDescriptions: string[];
    videoDescription?: string;
    hashtags: string[];
    mentions: string[];
    poll?: {
        question: string;
        options: string[];
        endTime: string;
    };
    location?: string;
    engagementPrompt: string;
}
export interface DouyinContent {
    title: string;
    videoScript: {
        scenes: {
            sequence: number;
            description: string;
            shotType: string;
            duration: number;
            dialogue?: string;
            bgmSuggestion?: string;
        }[];
        totalDuration: number;
    };
    caption: string;
    hashtags: string[];
    mentions: string[];
    engagementPrompt: string;
    shoppingProducts?: {
        name: string;
        price: number;
        link: string;
        sellingPoints: string[];
    }[];
}
export interface ImageSuggestion {
    type: 'cover' | 'content' | 'product' | 'lifestyle' | 'infographic';
    theme: string;
    style: 'realistic' | 'cartoon' | 'minimal' | 'vibrant' | 'professional' | 'casual';
    colorPalette: string[];
    elements: string[];
    textOverlay?: string;
    dimensions: string[];
    referenceDescription?: string;
}
export interface VideoScript {
    type: 'tutorial' | 'testimonial' | 'product_demo' | 'storytelling' | 'entertainment';
    theme: string;
    targetAudience: string[];
    duration: number;
    scenes: VideoScene[];
    voiceoverScript: string;
    bgmSuggestions: string[];
    subtitlePoints: string[];
}
export interface VideoScene {
    sequence: number;
    description: string;
    shotType: 'wide' | 'medium' | 'closeup' | 'extreme_closeup' | 'overhead' | 'pov';
    duration: number;
    visualElements: string[];
    textOverlay?: string;
    transition: 'cut' | 'fade' | 'wipe' | 'zoom' | 'none';
}
export interface PublishSlot {
    platform: 'wechat' | 'xiaohongshu' | 'weibo' | 'douyin';
    date: string;
    time: string;
    contentType: string;
    priority: 'high' | 'medium' | 'low';
    dependencies?: string[];
    notes?: string;
}
export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime?: string;
    platform: string;
    contentSummary: string;
    status: 'scheduled' | 'published' | 'pending' | 'cancelled';
    assignedTo: string;
}
export interface ComplianceItem {
    name: string;
    platformRule: string;
    status: 'pass' | 'fail' | 'warning';
    issueDescription?: string;
    suggestedFix?: string;
}
export interface LegalItem {
    name: string;
    relevantRegulations: string[];
    riskLevel: 'low' | 'medium' | 'high';
    status: 'approved' | 'needs_review' | 'rejected';
    comments?: string;
}
export interface CopywritingAgentInput {
    strategyPlan: StrategyAgentOutput;
    platformSpecs: PlatformSpec[];
    brandGuidelines: BrandGuideline;
    forbiddenWords: string[];
    customParams?: Record<string, any>;
}
export interface CopywritingAgentOutput {
    platformContents: {
        wechat: WechatContent;
        xiaohongshu: XHSContent;
        weibo: WeiboContent;
        douyin: DouyinContent;
    };
    visualSuggestions: {
        coverImages: ImageSuggestion[];
        contentImages: ImageSuggestion[];
        videoScripts: VideoScript[];
        colorPalette: string[];
    };
    schedulingPlan: {
        publishSchedule: PublishSlot[];
        contentCalendar: CalendarEvent[];
        optimizationTips: string[];
    };
    complianceCheck: {
        platformRules: ComplianceItem[];
        legalReview: LegalItem[];
        riskAssessment: 'low' | 'medium' | 'high';
        overallCompliance: 'compliant' | 'needs_revision' | 'non_compliant';
    };
    metadata: {
        generatedAt: string;
        templateUsed: string;
        qualityScore: number;
        estimatedEngagement: {
            estimatedViews: number;
            estimatedLikes: number;
            estimatedComments: number;
            estimatedShares: number;
        };
    };
}
export type RiskLevel = 'low' | 'medium' | 'high';
