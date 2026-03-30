import { Injectable, Logger } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  QueryRunner,
  BeforeQueryEvent,
  AfterQueryEvent,
} from 'typeorm';
import { MetricsCollectorService } from '../metrics/collectors/metrics-collector.service';

@Injectable()
@EventSubscriber()
export class DatabaseMetricsSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(DatabaseMetricsSubscriber.name);
  private queryStartTimes = new WeakMap<QueryRunner, number>();

  constructor(private metricsCollector: MetricsCollectorService) {}

  /**
   * 查询开始前
   */
  beforeQuery(event: BeforeQueryEvent<any>): void {
    if (event.queryRunner) {
      this.queryStartTimes.set(event.queryRunner, Date.now());
    }
  }

  /**
   * 查询完成后
   */
  afterQuery(event: AfterQueryEvent<any>): void {
    const queryRunner = event.queryRunner;
    const startTime = queryRunner
      ? this.queryStartTimes.get(queryRunner)
      : undefined;
    if (startTime) {
      const duration = Date.now() - startTime;

      // 记录数据库查询指标
      this.metricsCollector
        .recordDatabaseQuery('query', 'unknown', duration, true)
        .catch((error) => {
          this.logger.error('Failed to record database query metric', error);
        });

      if (queryRunner) {
        this.queryStartTimes.delete(queryRunner);
      }
    }
  }

  /**
   * 插入操作前
   */
  beforeInsert(event: InsertEvent<any>): void {
    this.queryStartTimes.set(event.queryRunner, Date.now());
  }

  /**
   * 插入操作后
   */
  afterInsert(event: InsertEvent<any>): void {
    this.recordOperationMetric(
      event.queryRunner,
      'insert',
      event.metadata.tableName,
    );
  }

  /**
   * 更新操作前
   */
  beforeUpdate(event: UpdateEvent<any>): void {
    this.queryStartTimes.set(event.queryRunner, Date.now());
  }

  /**
   * 更新操作后
   */
  afterUpdate(event: UpdateEvent<any>): void {
    this.recordOperationMetric(
      event.queryRunner,
      'update',
      event.metadata.tableName,
    );
  }

  /**
   * 删除操作前
   */
  beforeRemove(event: RemoveEvent<any>): void {
    this.queryStartTimes.set(event.queryRunner, Date.now());
  }

  /**
   * 删除操作后
   */
  afterRemove(event: RemoveEvent<any>): void {
    this.recordOperationMetric(
      event.queryRunner,
      'delete',
      event.metadata.tableName,
    );
  }

  /**
   * 记录操作指标
   */
  private recordOperationMetric(
    queryRunner: QueryRunner,
    operation: string,
    table: string,
  ): void {
    const startTime = this.queryStartTimes.get(queryRunner);
    if (startTime) {
      const duration = Date.now() - startTime;

      this.metricsCollector
        .recordDatabaseQuery(operation, table, duration, true)
        .catch((error) => {
          this.logger.error(
            'Failed to record database operation metric',
            error,
          );
        });

      this.queryStartTimes.delete(queryRunner);
    }
  }

  /**
   * 记录慢查询警告
   */
  private recordSlowQueryWarning(
    duration: number,
    operation: string,
    table: string,
  ): void {
    if (duration > 1000) {
      // 超过1秒为慢查询
      this.logger.warn(`Slow database ${operation} on ${table}: ${duration}ms`);

      // 记录慢查询指标
      this.metricsCollector
        .recordBusinessMetric('database_slow_queries_total', 1, {
          operation,
          table,
        })
        .catch((error) => {
          this.logger.debug('Failed to record slow query metric', error);
        });
    }
  }
}
