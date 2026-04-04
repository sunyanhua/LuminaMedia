import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MetricsCollectorService } from '../metrics/collectors/metrics-collector.service';
export declare class HttpMetricsInterceptor implements NestInterceptor {
    private metricsCollector;
    private readonly logger;
    private readonly excludedPaths;
    constructor(metricsCollector: MetricsCollectorService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private shouldExclude;
    private normalizePath;
}
