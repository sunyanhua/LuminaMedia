import { ReportService } from '../services/report.service';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    generateBehaviorReport(userId: string): Promise<{
        success: boolean;
        message: string;
        data: import("../services/report.service").ReportData;
        exportOptions: {
            json: string;
            pdf: string;
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
        exportOptions?: undefined;
    }>;
    generateCampaignReport(campaignId: string): Promise<{
        success: boolean;
        message: string;
        data: import("../services/report.service").ReportData;
        exportOptions: {
            json: string;
            pdf: string;
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
        exportOptions?: undefined;
    }>;
    exportReport(reportType: 'behavior' | 'campaign', id: string, format?: 'json' | 'pdf'): Promise<{
        success: boolean;
        message: string;
        data: any;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getDailyActivityVisualization(userId: string, days?: number): Promise<{
        success: boolean;
        data: {
            type: string;
            title: string;
            labels: string[];
            datasets: {
                label: string;
                data: number[];
                borderColor: string;
            }[];
        };
    }>;
    getEventDistributionVisualization(userId: string): Promise<{
        success: boolean;
        data: {
            type: string;
            title: string;
            labels: string[];
            datasets: {
                data: number[];
                backgroundColor: string[];
            }[];
        };
    }>;
}
