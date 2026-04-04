export interface CustomerDashboardData {
    overview: {
        profileName: string;
        industry: string;
        customerType: string;
        dataSources: number;
    };
    metrics: {
        totalRecords: number;
        totalSegments: number;
        totalMembers: number;
        dataCompleteness: number;
        segmentationCoverage: number;
    };
    recentActivity: {
        lastImport: Date | null;
        lastAnalysis: Date;
        segmentUpdate: Date | null;
    };
    quickInsights: string[];
}
export interface ProfileStats {
    profileName: string;
    industry: string;
    totalImportJobs: number;
    completedImports: number;
    totalRecords: number;
    totalSegments: number;
    totalMembers: number;
    dataFreshness: Date;
    insightsCount: number;
}
