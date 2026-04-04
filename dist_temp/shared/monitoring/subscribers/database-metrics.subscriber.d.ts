import { EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, BeforeQueryEvent, AfterQueryEvent } from 'typeorm';
import { MetricsCollectorService } from '../metrics/collectors/metrics-collector.service';
export declare class DatabaseMetricsSubscriber implements EntitySubscriberInterface {
    private metricsCollector;
    private readonly logger;
    private queryStartTimes;
    constructor(metricsCollector: MetricsCollectorService);
    beforeQuery(event: BeforeQueryEvent<any>): void;
    afterQuery(event: AfterQueryEvent<any>): void;
    beforeInsert(event: InsertEvent<any>): void;
    afterInsert(event: InsertEvent<any>): void;
    beforeUpdate(event: UpdateEvent<any>): void;
    afterUpdate(event: UpdateEvent<any>): void;
    beforeRemove(event: RemoveEvent<any>): void;
    afterRemove(event: RemoveEvent<any>): void;
    private recordOperationMetric;
    private recordSlowQueryWarning;
}
