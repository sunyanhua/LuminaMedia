import { StrategyAgentOutput } from '../../strategy/interfaces/strategy-agent.interface';
import { PlatformSpec, BrandGuideline } from '../interfaces/copywriting-agent.interface';
export interface CopywritingPromptTemplate {
    id: string;
    name: string;
    platforms: ('wechat' | 'xiaohongshu' | 'weibo' | 'douyin')[];
    contentType: 'article' | 'short_post' | 'video' | 'campaign' | 'brand';
    depthLevel: number;
    generatePrompt: (params: CopywritingPromptParams) => string;
}
export interface CopywritingPromptParams {
    strategyPlan: StrategyAgentOutput;
    platformSpecs: PlatformSpec[];
    brandGuidelines: BrandGuideline;
    forbiddenWords: string[];
    industryContext: string;
    targetAudience: string[];
    customParams?: Record<string, any>;
}
export declare const standardMultiPlatformTemplate: CopywritingPromptTemplate;
export declare const brandStorytellingTemplate: CopywritingPromptTemplate;
export declare const productPromotionTemplate: CopywritingPromptTemplate;
export declare const holidayMarketingTemplate: CopywritingPromptTemplate;
export declare const crisisCommunicationTemplate: CopywritingPromptTemplate;
export declare function selectCopywritingTemplate(platforms: ('wechat' | 'xiaohongshu' | 'weibo' | 'douyin')[], contentType: string, scenario?: string): CopywritingPromptTemplate;
export declare const allCopywritingTemplates: CopywritingPromptTemplate[];
