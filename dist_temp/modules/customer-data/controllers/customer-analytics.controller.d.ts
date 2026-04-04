import { CustomerAnalyticsService } from '../services/customer-analytics.service';
import { CustomerSegment } from '../../../entities/customer-segment.entity';
import { SegmentationRequestDto } from '../dto/segmentation-request.dto';
export declare class CustomerAnalyticsController {
    private readonly customerAnalyticsService;
    constructor(customerAnalyticsService: CustomerAnalyticsService);
    generateCustomerProfileAnalysis(profileId: string): Promise<Record<string, any>>;
    getCustomerSegments(profileId: string): Promise<CustomerSegment[]>;
    performCustomerSegmentation(profileId: string, segmentationRequest: SegmentationRequestDto): Promise<CustomerSegment[]>;
    getDashboardData(profileId: string): Promise<Record<string, any>>;
    refreshAnalysis(profileId: string): Promise<Record<string, any>>;
    getSegmentDetail(profileId: string, segmentId: string): Promise<CustomerSegment>;
    updateSegment(profileId: string, segmentId: string, updates: Partial<CustomerSegment>): Promise<CustomerSegment>;
    deleteSegment(profileId: string, segmentId: string): Promise<void>;
    exportAnalysisReport(profileId: string): Promise<Record<string, any>>;
    getRadarChartData(profileId: string): Promise<Record<string, any>>;
    getScatterChartData(profileId: string): Promise<Record<string, any>>;
    getHeatmapChartData(profileId: string): Promise<Record<string, any>>;
    getFunnelChartData(profileId: string): Promise<Record<string, any>>;
    getSankeyChartData(profileId: string): Promise<Record<string, any>>;
    getAllChartData(profileId: string): Promise<Record<string, any>>;
}
