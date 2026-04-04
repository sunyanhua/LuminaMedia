export declare enum AnalysisType {
    REGIONAL_ANALYSIS = "regional_analysis",
    COMPETITIVE_ANALYSIS = "competitive_analysis",
    SEO_SUGGESTION = "seo_suggestion",
    OPPORTUNITY_IDENTIFICATION = "opportunity_identification",
    TREND_ANALYSIS = "trend_analysis"
}
export declare enum AnalysisStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class GeoAnalysisResult {
    id: string;
    tenantId: string;
    customerProfileId: string;
    targetRegionId: string;
    targetRegionName: string;
    analysisType: AnalysisType;
    status: AnalysisStatus;
    inputParameters: {
        timeRange?: {
            start: Date;
            end: Date;
        };
        competitors?: string[];
        industries?: string[];
        keywords?: string[];
        metrics?: string[];
        regionLevel?: string;
        dataSources?: string[];
    };
    regionalAnalysis: {
        demographicProfile: {
            populationDensity: number;
            ageStructure: Record<string, number>;
            educationLevel: Record<string, number>;
            incomeDistribution: Record<string, number>;
        };
        economicProfile: {
            gdpGrowth: number;
            industryStructure: Record<string, number>;
            consumptionLevel: number;
            investmentEnvironment: number;
        };
        culturalProfile: {
            languageDistribution: Record<string, number>;
            culturalCharacteristics: string[];
            consumerPreferences: string[];
            mediaHabits: Record<string, number>;
        };
        digitalProfile: {
            internetPenetration: number;
            mobileUsage: number;
            socialMediaActivity: Record<string, number>;
            ecommerceAdoption: number;
        };
    };
    competitiveAnalysis: {
        marketSize: number;
        marketGrowth: number;
        competitionIntensity: number;
        marketConcentration: number;
        competitors: {
            name: string;
            marketShare: number;
            strengths: string[];
            weaknesses: string[];
            strategies: string[];
            threatLevel: 'low' | 'medium' | 'high';
        }[];
        barriersToEntry: string[];
        competitiveAdvantages: string[];
    };
    seoSuggestions: {
        keywordOpportunities: {
            keyword: string;
            searchVolume: number;
            competition: 'low' | 'medium' | 'high';
            opportunityScore: number;
            suggestedActions: string[];
        }[];
        contentLocalization: {
            culturalElements: string[];
            languageAdaptations: string[];
            localReferences: string[];
            seasonalContent: string[];
        };
        channelRecommendations: {
            channel: string;
            reach: number;
            engagement: number;
            costEffectiveness: 'low' | 'medium' | 'high';
            recommendedActions: string[];
        }[];
        technicalOptimizations: {
            area: string;
            currentStatus: string;
            recommendation: string;
            priority: 'low' | 'medium' | 'high';
            expectedImpact: string;
        }[];
    };
    opportunityIdentification: {
        untappedMarkets: {
            region: string;
            marketSize: number;
            growthPotential: number;
            entryDifficulty: 'low' | 'medium' | 'high';
            suggestedStrategy: string;
        }[];
        productGaps: {
            productCategory: string;
            unmetNeeds: string[];
            potentialDemand: number;
            competitiveLandscape: string;
        }[];
        partnershipOpportunities: {
            partnerType: string;
            potentialPartners: string[];
            synergies: string[];
            contactStrategy: string;
        }[];
        innovationAreas: {
            area: string;
            technologyTrends: string[];
            customerNeeds: string[];
            competitiveAdvantage: string;
        }[];
    };
    trendAnalysis: {
        historicalTrends: {
            metric: string;
            values: {
                date: string;
                value: number;
            }[];
            trendDirection: 'up' | 'down' | 'stable';
            growthRate: number;
        }[];
        predictiveInsights: {
            metric: string;
            forecast: {
                date: string;
                value: number;
            }[];
            confidenceLevel: number;
            keyDrivers: string[];
        }[];
        seasonalityPatterns: {
            patternType: string;
            months: string[];
            impactLevel: 'low' | 'medium' | 'high';
            recommendations: string[];
        }[];
        emergingTrends: {
            trend: string;
            emergenceDate: string;
            adoptionRate: number;
            potentialImpact: 'low' | 'medium' | 'high';
        }[];
    };
    overallScore: number;
    keyFindings: string[];
    recommendations: {
        category: string;
        recommendation: string;
        priority: 'low' | 'medium' | 'high';
        expectedImpact: string;
        timeframe: string;
        resourcesNeeded: string[];
    }[];
    visualizations: {
        chartType: string;
        data: any;
        title: string;
        description: string;
    }[];
    analysisStartedAt: Date;
    analysisCompletedAt: Date;
    processingTime: number;
    errorMessage: string;
    metadata: {
        dataSourcesUsed: string[];
        algorithmVersion: string;
        modelParameters: Record<string, any>;
        confidenceScores: Record<string, number>;
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
