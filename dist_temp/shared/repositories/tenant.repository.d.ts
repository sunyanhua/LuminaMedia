import { SelectQueryBuilder } from 'typeorm';
import { TenantEntity } from '../interfaces/tenant-entity.interface';
import { BaseRepository } from './base.repository';
export declare abstract class TenantRepository<T extends TenantEntity> extends BaseRepository<T> {
    protected getCurrentTenantId(): string;
    protected addTenantCondition(queryBuilder: SelectQueryBuilder<T>): SelectQueryBuilder<T>;
    find(options?: any): Promise<T[]>;
    findOne(options?: any): Promise<T | null>;
    findByIds(ids: any[]): Promise<T[]>;
    createQueryBuilder(alias?: string): SelectQueryBuilder<T>;
    count(options?: any): Promise<number>;
    findAllTenants(options?: any): Promise<T[]>;
    checkTenantAccess(entityId: any): Promise<boolean>;
    getTenantStats(): Promise<{
        totalCount: number;
        lastUpdated: Date | null;
        sizeEstimate: number;
    }>;
}
