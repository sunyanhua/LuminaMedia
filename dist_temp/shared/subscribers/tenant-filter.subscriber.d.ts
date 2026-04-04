import { EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, LoadEvent, DataSource } from 'typeorm';
export declare class TenantFilterSubscriber implements EntitySubscriberInterface {
    private dataSource;
    constructor(dataSource: DataSource);
    private hasTenantId;
    private getCurrentTenantId;
    afterLoad(entity: any, event?: LoadEvent<any>): void;
    beforeInsert(event: InsertEvent<any>): void;
    beforeUpdate(event: UpdateEvent<any>): Promise<void>;
    beforeRemove(event: RemoveEvent<any>): Promise<void>;
    private checkTenantPermission;
}
