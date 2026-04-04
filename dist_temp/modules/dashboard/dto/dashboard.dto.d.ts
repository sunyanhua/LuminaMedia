export declare class DashboardStatsQueryDto {
    startDate?: string;
    endDate?: string;
}
export declare class CustomerOverviewQueryDto {
    profileId: string;
}
export declare class MarketingPerformanceQueryDto {
    campaignId: string;
    granularity?: string;
}
export declare class RealTimeMetricsQueryDto {
    lastMinutes?: number;
}
export declare class ChartDataQueryDto {
    days?: number;
    profileId?: string;
    campaignId?: string;
}
export declare class GenerateReportDto {
    profileId?: string;
    campaignId?: string;
    startDate?: string;
    endDate?: string;
}
export declare class ExportDashboardDto {
    format: 'csv' | 'json';
}
