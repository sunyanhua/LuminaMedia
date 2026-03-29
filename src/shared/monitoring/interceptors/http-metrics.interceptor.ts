import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsCollectorService } from '../metrics/collectors/metrics-collector.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpMetricsInterceptor.name);
  private readonly excludedPaths = ['/health', '/metrics', '/monitoring'];

  constructor(private metricsCollector: MetricsCollectorService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    // 检查是否排除路径
    if (this.shouldExclude(request.path)) {
      return next.handle();
    }

    const startTime = Date.now();
    const method = request.method;
    const path = this.normalizePath(request.path);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // 记录HTTP指标
          this.metricsCollector.recordHttpRequest(
            method,
            path,
            statusCode,
            duration,
          ).catch(error => {
            this.logger.error('Failed to record HTTP metrics', error);
          });

          // 记录到APM
          this.metricsCollector.recordBusinessMetric(
            'http_request_duration_ms',
            duration,
            { method, path, status_code: statusCode.toString() },
          ).catch(error => {
            this.logger.debug('Failed to record APM metric', error);
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // 即使出错也记录指标
          this.metricsCollector.recordHttpRequest(
            method,
            path,
            statusCode,
            duration,
          ).catch(err => {
            this.logger.error('Failed to record HTTP error metrics', err);
          });
        },
      }),
    );
  }

  /**
   * 检查是否应排除路径
   */
  private shouldExclude(path: string): boolean {
    return this.excludedPaths.some(excluded => path.startsWith(excluded));
  }

  /**
   * 规范化路径（移除ID等参数）
   */
  private normalizePath(path: string): string {
    // 将UUID替换为 :id
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    const numberRegex = /\d+/g;

    let normalized = path;
    normalized = normalized.replace(uuidRegex, ':id');
    normalized = normalized.replace(numberRegex, ':id');

    return normalized;
  }
}