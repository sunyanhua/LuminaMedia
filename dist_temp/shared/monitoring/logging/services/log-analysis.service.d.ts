import { ConfigService } from '@nestjs/config';
import { LogAnalysisResult, LogQueryOptions, LogAlertRule } from '../interfaces/log-analysis.interface';
export declare class LogAnalysisService {
    private readonly configService;
    private readonly indexPrefix;
    private readonly elasticsearchService;
    constructor(configService: ConfigService, elasticsearchService?: any);
    queryLogs(options: LogQueryOptions): Promise<any>;
    analyzeLogs(options: LogQueryOptions): Promise<LogAnalysisResult>;
    checkAlertRules(rules: LogAlertRule[]): Promise<Array<{
        rule: LogAlertRule;
        triggered: boolean;
        details?: any;
    }>>;
    getLogStats(timeRange: {
        from: string;
        to: string;
    }): Promise<any>;
    getErrorTrends(days?: number): Promise<any>;
    private queryElasticsearch;
    private queryMockData;
    private evaluateAlertCondition;
}
