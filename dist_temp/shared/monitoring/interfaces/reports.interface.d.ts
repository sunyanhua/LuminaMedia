export declare enum ReportType {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    PERFORMANCE = "performance",
    SECURITY = "security",
    BUSINESS = "business"
}
export declare enum ReportStatus {
    PENDING = "pending",
    GENERATING = "generating",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum ReportFormat {
    HTML = "html",
    PDF = "pdf",
    JSON = "json",
    CSV = "csv",
    MARKDOWN = "markdown"
}
export interface PerformanceMetrics {
    responseTimeP95: number;
    responseTimeP99: number;
    responseTimeAvg: number;
    successRate: number;
    errorRate: number;
    throughput: number;
    concurrentUsers: number;
    cpuUsage: number;
    memoryUsage: number;
}
export interface BusinessMetrics {
    activeUsers: number;
    newUsers: number;
    contentPublished: number;
    aiRequests: number;
    databaseQueries: number;
    publishSuccessRate: number;
    userSatisfaction?: number;
}
export interface ReportContent {
    title: string;
    summary: string;
    period: {
        start: Date;
        end: Date;
    };
    performance: PerformanceMetrics;
    business: BusinessMetrics;
    alerts: {
        total: number;
        bySeverity: Record<string, number>;
        topRules: Array<{
            ruleId: string;
            count: number;
        }>;
    };
    issues: Array<{
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        recommendation: string;
        impact: string;
    }>;
    trends: Array<{
        metric: string;
        current: number;
        previous: number;
        change: number;
        changePercent: number;
    }>;
    recommendations: string[];
    rawData?: Record<string, any>;
}
export interface ReportDefinition {
    id: string;
    name: string;
    type: ReportType;
    description: string;
    schedule?: string;
    format: ReportFormat[];
    recipients?: string[];
    enabled: boolean;
    retentionDays?: number;
    templatePath?: string;
}
export interface ReportInstance {
    id: string;
    definitionId: string;
    name: string;
    type: ReportType;
    status: ReportStatus;
    format: ReportFormat;
    content?: ReportContent;
    generationStartedAt?: Date;
    generationCompletedAt?: Date;
    filePath?: string;
    fileSize?: number;
    errorMessage?: string;
    metadata?: Record<string, any>;
}
export declare const PREDEFINED_REPORTS: ReportDefinition[];
