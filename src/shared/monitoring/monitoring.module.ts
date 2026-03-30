import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingModule } from './logging/logging.module';
import { AutoscalingModule } from './autoscaling/autoscaling.module';
import { SkywalkingApmService } from './apm/skywalking/skywalking-apm.service';
import { MetricsCollectorService } from './metrics/collectors/metrics-collector.service';
import { AlertRuleService } from './alerts/rules/alert-rule.service';
import { PerformanceReportService } from './reports/performance-report.service';
import { MonitoringController } from './controllers/monitoring.controller';
import { HttpMetricsInterceptor } from './interceptors/http-metrics.interceptor';
import { DatabaseMetricsSubscriber } from './subscribers/database-metrics.subscriber';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    LoggingModule,
    AutoscalingModule,
  ],
  controllers: [MonitoringController],
  providers: [
    SkywalkingApmService,
    MetricsCollectorService,
    AlertRuleService,
    PerformanceReportService,
    DatabaseMetricsSubscriber,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
  exports: [
    SkywalkingApmService,
    MetricsCollectorService,
    AlertRuleService,
    PerformanceReportService,
    LoggingModule,
    AutoscalingModule,
  ],
})
export class MonitoringModule {}
