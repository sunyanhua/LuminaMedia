import { ConfigService } from '@nestjs/config';
import { MetricsCollectorService } from '../../metrics/collectors/metrics-collector.service';
import { ScalingMetric } from '../interfaces/autoscaling.interface';
export declare class ScalingMetricsService {
    private readonly configService;
    private readonly metricsCollector?;
    private readonly logger;
    constructor(configService: ConfigService, metricsCollector?: MetricsCollectorService | undefined);
    getMetricValue(metric: ScalingMetric): Promise<number>;
    private getResourceMetric;
    private getPodMetric;
    private getObjectMetric;
    private getBusinessMetric;
    private getSimulatedCpuUsage;
    private getSimulatedMemoryUsage;
    private getSimulatedPodMetric;
    private getSimulatedObjectMetric;
    private getSimulatedActiveUsers;
    private getSimulatedQueueLength;
    private getSimulatedBusinessMetric;
    getMetricValues(metrics: ScalingMetric[]): Promise<Array<{
        metric: ScalingMetric;
        value: number;
    }>>;
    isMetricAvailable(metric: ScalingMetric): Promise<boolean>;
}
