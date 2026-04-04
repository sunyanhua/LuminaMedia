export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    avgSessionTime: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalStrategies: number;
    customerProfiles: number;
}
export interface CustomerOverview {
    demographicDistribution: {
        ageGroups: Record<string, number>;
        gender: Record<string, number>;
        location: Record<string, number>;
    };
    behaviorMetrics: {
        averagePurchaseFrequency: number;
        averageOrderValue: number;
        customerLifetimeValue: number;
        retentionRate: number;
    };
    topSegments: Array<{
        name: string;
        size: number;
        revenueContribution: number;
    }>;
}
export interface MarketingPerformance {
    campaignId: string;
    campaignName: string;
    metrics: {
        reach: number;
        engagement: number;
        conversion: number;
        roi: number;
        spend: number;
        revenue: number;
    };
    timeline: Array<{
        date: string;
        metrics: Record<string, number>;
    }>;
}
export interface RealTimeMetrics {
    activeSessions: number;
    recentConversions: number;
    contentViews: number;
    socialEngagements: number;
    apiCalls: number;
    timestamp: string;
}
export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: any[];
        backgroundColor: string | string[];
        borderColor: string | string[];
    }>;
}
export interface DashboardReportRequest {
    profileId?: string;
    campaignId?: string;
    startDate?: string;
    endDate?: string;
}
export interface DashboardReportResponse {
    reportUrl: string;
}
export interface ExportDashboardRequest {
    format: 'csv' | 'json';
}
