import { DashboardService } from '../services/dashboard.service';
import { DashboardStatsQueryDto, CustomerOverviewQueryDto, MarketingPerformanceQueryDto, RealTimeMetricsQueryDto, ChartDataQueryDto, GenerateReportDto, ExportDashboardDto } from '../dto/dashboard.dto';
import { DashboardStats, CustomerOverview, MarketingPerformance, RealTimeMetrics, ChartData, DashboardReportResponse } from '../interfaces/dashboard.interface';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardStats(query: DashboardStatsQueryDto): Promise<DashboardStats>;
    getCustomerOverview(params: CustomerOverviewQueryDto): Promise<CustomerOverview>;
    getMarketingPerformance(params: MarketingPerformanceQueryDto, granularity?: string): Promise<MarketingPerformance>;
    getRealTimeMetrics(query: RealTimeMetricsQueryDto): Promise<RealTimeMetrics>;
    getUserActivityChart(query: ChartDataQueryDto): Promise<ChartData>;
    getConsumptionDistributionChart(query: ChartDataQueryDto): Promise<ChartData>;
    getGeographicDistributionChart(query: ChartDataQueryDto): Promise<ChartData>;
    getROITrendChart(query: ChartDataQueryDto): Promise<ChartData>;
    getCustomerScatterChart(query: ChartDataQueryDto): Promise<ChartData>;
    getCustomerRadarChart(query: ChartDataQueryDto): Promise<ChartData>;
    getHeatmapChart(query: ChartDataQueryDto): Promise<ChartData>;
    generateDashboardReport(body: GenerateReportDto): Promise<DashboardReportResponse>;
    exportDashboardData(query: ExportDashboardDto): Promise<{
        downloadUrl: string;
    }>;
    getParkingSpendingChart(profileId?: string): Promise<any[]>;
    getTrafficTimeSeriesChart(profileId?: string, days?: number): Promise<any[]>;
}
