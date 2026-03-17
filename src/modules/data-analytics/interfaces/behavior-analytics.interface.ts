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
  averageSessionDuration: number; // in minutes
}

export interface EngagementMetrics {
  userId: string;
  engagementScore: number; // 0-100
  contentCreationRate: number; // per week
  taskCompletionRate: number; // percentage
  loginFrequency: number; // logins per week
  averageSessionTime: number; // minutes
}

export interface CampaignInsights {
  campaignId: string;
  totalStrategies: number;
  averageConfidenceScore: number;
  strategyTypeDistribution: Record<string, number>;
  estimatedTotalROI: number;
  completionRate: number;
}
