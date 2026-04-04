export interface CustomerAnalysisResult {
    profileId: string;
    profileName: string;
    industry: string;
    analysisTimestamp: string;
    dataSummary: {
        totalImportJobs: number;
        completedImports: number;
        totalRecords: number;
        dataFreshness: string;
        dataCompleteness: number;
    };
    demographicAnalysis: DemographicAnalysis;
    behavioralAnalysis: BehavioralAnalysis;
    consumptionAnalysis: ConsumptionAnalysis;
    segmentationAnalysis: SegmentationAnalysis;
    keyInsights: string[];
    recommendations: Recommendation[];
}
export interface DemographicAnalysis {
    customerBaseSize: number;
    genderDistribution: {
        male: number;
        female: number;
    };
    ageDistribution: Record<string, number>;
    geographicDistribution: Record<string, number>;
    insights: string[];
}
export interface BehavioralAnalysis {
    visitPatterns: {
        averageFrequency: number;
        averageDuration: number;
        peakHours: string[];
        peakDays: string[];
    };
    engagementMetrics: {
        memberPenetration: number;
        averageTenure: number;
        retentionRates: Record<string, number>;
    };
    channelPreferences: Record<string, number>;
    insights: string[];
}
export interface ConsumptionAnalysis {
    spendingPatterns: {
        averageMonthlySpend: number;
        averageTransactionValue: number;
        spendingDistribution: Array<{
            category: string;
            spend: number;
            frequency: number;
        }>;
    };
    paymentMethods: Record<string, number>;
    seasonality: {
        peakMonths: string[];
        lowMonths: string[];
        holidayImpact: number;
    };
    customerLifetimeValue: {
        averageCLV: number;
        highValueThreshold: number;
        highValuePercentage: number;
    };
    insights: string[];
}
export interface SegmentationAnalysis {
    segmentCount: number;
    totalMembers: number;
    segmentDetails: Array<{
        name: string;
        memberCount: number;
        percentage: number;
        description: string;
        criteria: Record<string, any>;
    }>;
    insights: string[];
}
export interface Recommendation {
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    expectedImpact: string;
    timeframe: string;
}
