import { UserBehaviorEvent } from '../../../shared/enums/user-behavior-event.enum';
export interface BehaviorAnalytics {
    userId: string;
    totalEvents: number;
    eventDistribution: Record<UserBehaviorEvent, number>;
    dailyActiveDays: number;
    averageEventsPerDay: number;
    mostActiveHour: number;
    mostCommonEvent: UserBehaviorEvent;
    sessionCount: number;
    averageSessionDuration: number;
}
export interface EngagementMetrics {
    userId: string;
    engagementScore: number;
    contentCreationRate: number;
    taskCompletionRate: number;
    loginFrequency: number;
    averageSessionTime: number;
}
export interface CampaignInsights {
    campaignId: string;
    totalStrategies: number;
    averageConfidenceScore: number;
    strategyTypeDistribution: Record<string, number>;
    estimatedTotalROI: number;
    completionRate: number;
}
