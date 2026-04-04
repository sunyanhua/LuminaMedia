export interface AnalysisPromptTemplate {
    id: string;
    name: string;
    industries: string[];
    depthLevel: number;
    generatePrompt: (params: AnalysisPromptParams) => string;
}
export interface AnalysisPromptParams {
    industryContext: string;
    businessGoals: string[];
    profileSummary: string;
    knowledgeContext: string[];
    customParams?: Record<string, any>;
}
export declare const standardAnalysisTemplate: AnalysisPromptTemplate;
export declare const deepIndustryAnalysisTemplate: AnalysisPromptTemplate;
export declare const quickScanTemplate: AnalysisPromptTemplate;
export declare const ecommerceAnalysisTemplate: AnalysisPromptTemplate;
export declare const b2bAnalysisTemplate: AnalysisPromptTemplate;
export declare function selectTemplate(industry: string, depthRequired?: number): AnalysisPromptTemplate;
export declare const allTemplates: AnalysisPromptTemplate[];
