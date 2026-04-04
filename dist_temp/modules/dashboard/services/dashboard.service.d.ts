import { Repository } from 'typeorm';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { DataImportJob } from '../../../entities/data-import-job.entity';
import { CustomerSegment } from '../../../entities/customer-segment.entity';
import { User } from '../../../entities/user.entity';
import { UserBehavior } from '../../data-analytics/entities/user-behavior.entity';
import { MarketingCampaign } from '../../data-analytics/entities/marketing-campaign.entity';
import { MarketingStrategy } from '../../data-analytics/entities/marketing-strategy.entity';
import { DashboardStats, CustomerOverview, MarketingPerformance, RealTimeMetrics, ChartData, DashboardReportRequest, DashboardReportResponse } from '../interfaces/dashboard.interface';
export declare class DashboardService {
    private userRepository;
    private customerProfileRepository;
    private dataImportJobRepository;
    private customerSegmentRepository;
    private userBehaviorRepository;
    private marketingCampaignRepository;
    private marketingStrategyRepository;
    constructor(userRepository: Repository<User>, customerProfileRepository: Repository<CustomerProfile>, dataImportJobRepository: Repository<DataImportJob>, customerSegmentRepository: Repository<CustomerSegment>, userBehaviorRepository: Repository<UserBehavior>, marketingCampaignRepository: Repository<MarketingCampaign>, marketingStrategyRepository: Repository<MarketingStrategy>);
    getDashboardStats(query: any): Promise<DashboardStats>;
    getCustomerOverview(profileId: string): Promise<CustomerOverview>;
    getMarketingPerformance(campaignId: string, granularity?: string): Promise<MarketingPerformance>;
    getRealTimeMetrics(lastMinutes?: number): Promise<RealTimeMetrics>;
    getUserActivityChart(days?: number, profileId?: string): Promise<ChartData>;
    getConsumptionDistributionChart(profileId?: string): Promise<ChartData>;
    getGeographicDistributionChart(profileId?: string): Promise<ChartData>;
    getROITrendChart(campaignId?: string): Promise<ChartData>;
    getCustomerScatterChart(profileId?: string): Promise<ChartData>;
    getCustomerRadarChart(profileId?: string): Promise<ChartData>;
    getHeatmapChart(days?: number, profileId?: string): Promise<ChartData>;
    generateDashboardReport(request: DashboardReportRequest): Promise<DashboardReportResponse>;
    exportDashboardData(format?: 'csv' | 'json'): Promise<{
        downloadUrl: string;
    }>;
    getParkingSpendingData(profileId?: string): Promise<any[]>;
    getTrafficTimeSeriesData(profileId?: string, days?: number): Promise<any[]>;
}
