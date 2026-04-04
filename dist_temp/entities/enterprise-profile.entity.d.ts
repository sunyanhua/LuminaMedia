import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
import { CustomerProfile } from './customer-profile.entity';
import { User } from './user.entity';
export interface EnterpriseBasicInfo {
    industry: string;
    scale: 'small' | 'medium' | 'large';
    region: string;
    foundingYear: number;
    employeeCount?: number;
    annualRevenue?: string;
    website?: string;
    description?: string;
}
export interface EnterpriseBrandImage {
    tone: string[];
    values: string[];
    personality: string[];
    visualStyle: string[];
    tagline?: string;
    colorPalette?: string[];
    logoStyle?: string;
}
export interface EnterpriseContentPreference {
    topics: string[];
    formats: string[];
    frequency: string;
    peakHours: number[];
    contentLength: string;
    languageStyle: string;
    keyMessages: string[];
}
export interface EnterpriseRestrictions {
    forbiddenWords: string[];
    sensitiveTopics: string[];
    legalConstraints: string[];
    culturalTaboos: string[];
    competitorNames?: string[];
    politicalSensitivity?: string[];
}
export interface EnterpriseSuccessPattern {
    topic: string;
    engagementRate: number;
    format: string;
    timing: string;
    audienceReaction: string;
}
export interface TimingAnalysis {
    dayOfWeek: string;
    hourOfDay: number;
    engagementScore: number;
}
export interface ResponsePattern {
    audienceSegment: string;
    responseType: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    commonFeedback: string[];
}
export interface EnterpriseProfileData {
    basicInfo: EnterpriseBasicInfo;
    brandImage: EnterpriseBrandImage;
    contentPreference: EnterpriseContentPreference;
    restrictions: EnterpriseRestrictions;
    successPatterns: {
        highEngagementTopics: string[];
        effectiveFormats: string[];
        bestTiming: TimingAnalysis[];
        audienceResponse: ResponsePattern[];
    };
    analysisSummary?: string;
    confidenceScores: {
        basicInfo: number;
        brandImage: number;
        contentPreference: number;
        restrictions: number;
        successPatterns: number;
    };
    lastUpdated: string;
    version: number;
}
export declare class EnterpriseProfile implements TenantEntity {
    id: string;
    tenantId: string;
    customerProfileId: string;
    customerProfile: CustomerProfile;
    createdBy: string;
    creator: User;
    industry: string;
    scale: 'small' | 'medium' | 'large';
    region: string;
    profileData: EnterpriseProfileData;
    status: 'pending' | 'analyzing' | 'completed' | 'failed';
    analysisProgress: number;
    errorMessage: string;
    analysisReport: Record<string, any>;
    version: number;
    isCurrent: boolean;
    previousVersionId: string;
    featureVector: number[];
    featuresExtractedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
