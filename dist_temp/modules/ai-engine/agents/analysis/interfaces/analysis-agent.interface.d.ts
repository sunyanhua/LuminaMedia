export interface AnalysisAgentInput {
    customerData: UserProfile4D[];
    industryContext: string;
    businessGoals: string[];
    knowledgeBaseContext: string[];
}
export interface AnalysisAgentOutput {
    marketInsights: {
        trends: string[];
        opportunities: string[];
        threats: string[];
    };
    targetAudience: {
        segments: AudienceSegment[];
        persona: PersonaDescription;
        sizeEstimation: number;
    };
    competitorAnalysis: {
        mainCompetitors: CompetitorInfo[];
        competitiveAdvantage: string[];
        gaps: string[];
    };
    recommendations: string[];
}
export interface AudienceSegment {
    name: string;
    description: string;
    characteristics: string[];
    proportion: number;
    priority: number;
}
export interface PersonaDescription {
    name: string;
    demographics: {
        ageRange: string;
        gender: string;
        education: string;
        occupation: string;
        incomeLevel: string;
    };
    behaviors: string[];
    painPoints: string[];
    motivations: string[];
}
export interface CompetitorInfo {
    name: string;
    marketShare: number;
    strengths: string[];
    weaknesses: string[];
    strategies: string[];
}
export interface UserProfile4D {
    basicLifecycle: {
        ageGroup: '18-25' | '26-35' | '36-45' | '46+';
        education: 'high_school' | 'bachelor' | 'master' | 'phd';
        familyRole: 'single' | 'married_no_kids' | 'married_with_kids';
        potentialValue: 'low' | 'medium' | 'high';
    };
    consumptionPersonality: {
        consumptionLevel: 'low' | 'medium' | 'high' | 'premium';
        shoppingWidth: 'narrow' | 'medium' | 'wide';
        decisionSpeed: 'fast' | 'medium' | 'slow';
    };
    realtimeStatus: {
        activityLevel: number;
        growthTrend: 'declining' | 'stable' | 'growing' | 'fast_growing';
        engagementScore: number;
    };
    socialActivity: {
        fissionPotential: 'low' | 'medium' | 'high';
        activityPreference: string[];
        socialInfluence: number;
    };
}
