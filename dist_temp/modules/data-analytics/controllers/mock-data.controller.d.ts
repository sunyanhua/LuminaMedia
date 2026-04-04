import { MockDataService } from '../services/mock-data.service';
export declare class MockDataController {
    private readonly mockDataService;
    constructor(mockDataService: MockDataService);
    generateMockData(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            behaviors: number;
            campaigns: number;
            strategies: number;
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    resetMockData(userId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            deleted: number;
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getMockDataStatus(): Promise<{
        success: boolean;
        data: {
            totalBehaviors: number;
            totalCampaigns: number;
            totalStrategies: number;
        };
        summary: string;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
        summary?: undefined;
    }>;
    private generateStatusSummary;
}
