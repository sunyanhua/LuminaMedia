import { AnalyticsService } from '../services/analytics.service';
import { TrackBehaviorDto } from '../dto/track-behavior.dto';
export declare class UserBehaviorController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    trackBehavior(trackBehaviorDto: TrackBehaviorDto): Promise<{
        success: boolean;
        message: string;
        data: {
            userId: string;
            sessionId: string;
            eventType: import("../../../shared/enums/user-behavior-event.enum").UserBehaviorEvent;
            timestamp: string;
        };
    }>;
    getUserBehavior(userId: string, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: import("../interfaces/behavior-analytics.interface").BehaviorAnalytics;
    }>;
    getUserBehaviorSummary(userId: string): Promise<{
        success: boolean;
        data: {
            userId: string;
            engagementMetrics: import("../interfaces/behavior-analytics.interface").EngagementMetrics;
            summary: string;
        };
    }>;
    private generateSummaryText;
}
