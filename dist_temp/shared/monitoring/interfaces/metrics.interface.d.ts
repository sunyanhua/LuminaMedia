export interface MetricValue {
    name: string;
    value: number;
    timestamp: Date;
    tags?: Record<string, string>;
    type: MetricType;
}
export declare enum MetricType {
    COUNTER = "counter",
    GAUGE = "gauge",
    HISTOGRAM = "histogram",
    SUMMARY = "summary"
}
export interface BusinessMetric {
    name: string;
    description: string;
    type: MetricType;
    defaultTags?: Record<string, string>;
    aggregationWindow?: number;
}
export interface MetricsCollector {
    record(metric: MetricValue): Promise<void>;
    recordBusinessMetric(name: string, value: number, tags?: Record<string, string>): Promise<void>;
    getMetric(name: string, tags?: Record<string, string>): Promise<MetricValue | null>;
    getTimeSeries(name: string, startTime: Date, endTime: Date, tags?: Record<string, string>): Promise<MetricValue[]>;
    getMetrics(): BusinessMetric[];
}
export declare const PREDEFINED_METRICS: BusinessMetric[];
