export declare enum SuggestionType {
    KEYWORD = "keyword",
    CONTENT = "content",
    TECHNICAL = "technical",
    LOCAL = "local",
    LINK = "link"
}
export declare enum PriorityLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum ImplementationStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    DEFERRED = "deferred",
    CANCELLED = "cancelled"
}
export declare class SeoSuggestion {
    id: string;
    tenantId: string;
    customerProfileId: string;
    targetRegionId: string;
    targetRegionName: string;
    suggestionType: SuggestionType;
    title: string;
    description: string;
    details: {
        keyword?: string;
        searchVolume?: number;
        competitionLevel?: 'low' | 'medium' | 'high';
        keywordDifficulty?: number;
        relatedKeywords?: string[];
        searchIntent?: 'informational' | 'commercial' | 'transactional' | 'navigational';
        contentTopic?: string;
        targetAudience?: string;
        contentFormat?: 'article' | 'video' | 'infographic' | 'podcast' | 'social_media';
        wordCount?: number;
        keyMessages?: string[];
        callToAction?: string;
        technicalIssue?: string;
        currentStatus?: string;
        recommendedAction?: string;
        affectedPages?: string[];
        implementationSteps?: string[];
        localElement?: string;
        culturalContext?: string;
        languageVariation?: string;
        localReferences?: string[];
        regionalPreferences?: string[];
        linkType?: 'internal' | 'external';
        sourcePage?: string;
        targetPage?: string;
        anchorText?: string;
        linkPurpose?: 'authority' | 'relevance' | 'navigation';
    };
    rationale: {
        dataSource: string;
        analysisMethod: string;
        supportingData: any;
        assumptions: string[];
        limitations: string[];
    };
    expectedBenefits: {
        trafficIncrease?: number;
        rankingImprovement?: number;
        conversionIncrease?: number;
        brandVisibility?: string;
        competitiveAdvantage?: string;
        costSavings?: number;
    };
    implementationPlan: {
        steps: {
            step: number;
            action: string;
            responsibleTeam?: string;
            estimatedEffort: number;
            dependencies?: string[];
            deliverables?: string[];
        }[];
        totalEffort: number;
        estimatedCost?: number;
        requiredResources: string[];
        potentialRisks: {
            risk: string;
            probability: 'low' | 'medium' | 'high';
            impact: 'low' | 'medium' | 'high';
            mitigationStrategy: string;
        }[];
    };
    priority: PriorityLevel;
    expectedImpact: number;
    implementationDifficulty: number;
    roiScore: number;
    implementationStatus: ImplementationStatus;
    implementationStartDate: Date;
    implementationEndDate: Date;
    implementedBy: string;
    implementationNotes: string;
    actualResults: {
        actualTrafficIncrease?: number;
        actualRankingImprovement?: number;
        actualConversionIncrease?: number;
        userFeedback?: string;
        lessonsLearned?: string[];
    };
    actualRoi: number;
    isRecurring: boolean;
    recurrencePattern: string;
    nextRecurrenceDate: Date;
    tags: string[];
    isActive: boolean;
    relatedSuggestions: string[];
    attachments: {
        name: string;
        url: string;
        type: string;
        size: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
