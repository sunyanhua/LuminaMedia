import { ConfigService } from '@nestjs/config';
import { SkywalkingApmService } from '../../apm/skywalking/skywalking-apm.service';
import { MetricsCollector, MetricValue, BusinessMetric } from '../../interfaces/metrics.interface';
export declare class MetricsCollectorService implements MetricsCollector {
    private configService;
    private apmService;
    private readonly logger;
    private metrics;
    private businessMetrics;
    private readonly maxStoragePoints;
    constructor(configService: ConfigService, apmService: SkywalkingApmService);
    private initializeMetrics;
    record(metric: MetricValue): Promise<void>;
    recordBusinessMetric(name: string, value: number, tags?: Record<string, string>): Promise<void>;
    getMetric(name: string, tags?: Record<string, string>): Promise<MetricValue | null>;
    getTimeSeries(name: string, startTime: Date, endTime: Date, tags?: Record<string, string>): Promise<MetricValue[]>;
    getMetrics(): BusinessMetric[];
    registerBusinessMetric(metric: BusinessMetric): void;
    recordHttpRequest(method: string, path: string, statusCode: number, durationMs: number): Promise<void>;
    recordDatabaseQuery(operation: string, table: string, durationMs: number, success: boolean): Promise<void>;
    recordAiRequest(provider: string, model: string, durationMs: number, success: boolean): Promise<void>;
    private storeMetric;
    private matchTags;
    getMetricsStats(): {
        totalMetrics: number;
        metricNames: string[];
        totalDataPoints: number;
    };
}
