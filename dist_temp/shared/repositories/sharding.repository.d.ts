import { SelectQueryBuilder, Connection } from 'typeorm';
import { TenantEntity } from '../interfaces/tenant-entity.interface';
import { TenantRepository } from './tenant.repository';
export declare abstract class ShardingRepository<T extends TenantEntity> extends TenantRepository<T> {
    protected readonly PARTITION_COUNT = 16;
    protected calculatePartitionNumber(tenantId: string): number;
    private crc32;
    private readonly crc32Table;
    getPartitionInfo(connection: Connection, tableName: string): Promise<any[]>;
    isTablePartitioned(connection: Connection, tableName: string): Promise<boolean>;
    getTenantDistribution(connection: Connection, tableName: string): Promise<any[]>;
    protected addPartitionHint(queryBuilder: SelectQueryBuilder<T>, tenantId?: string): SelectQueryBuilder<T>;
    createShardingQueryBuilder(alias?: string, tenantId?: string): SelectQueryBuilder<T>;
    getPartitionSizes(connection: Connection): Promise<any[]>;
    getPartitionBalanceAdvice(connection: Connection, tableName: string): Promise<any>;
}
export declare class ShardingUtils {
    static shouldShardTable(estimatedRowCount: number, rowSizeBytes?: number): {
        shouldShard: boolean;
        reason: string;
    };
    static generatePartitionDDL(tableName: string, partitionCount?: number): string;
    static generateMigrationPlan(sourceTable: string, partitionCount?: number): string[];
}
