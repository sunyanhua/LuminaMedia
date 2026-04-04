import { Repository, SelectQueryBuilder, DeepPartial, SaveOptions, ObjectLiteral } from 'typeorm';
import { Logger } from '@nestjs/common';
export declare abstract class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
    protected readonly logger: Logger;
    saveMany(entities: DeepPartial<T>[], options?: SaveOptions): Promise<T[]>;
    find(options?: any): Promise<T[]>;
    findById(id: any): Promise<T | null>;
    findOne(options?: any): Promise<T | null>;
    deleteById(id: any): Promise<void>;
    updateById(id: any, partialEntity: DeepPartial<T>): Promise<void>;
    count(options?: any): Promise<number>;
    exists(options: any): Promise<boolean>;
    createQueryBuilder(alias?: string): SelectQueryBuilder<T>;
    protected wrapDatabaseError(error: any, operation: string): Error;
    transaction<U>(operation: (repository: this) => Promise<U>): Promise<U>;
}
