import { Repository, SelectQueryBuilder, DeepPartial, SaveOptions, RemoveOptions } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * 基础Repository基类
 * 提供CRUD通用操作、异常处理和日志记录
 */
export abstract class BaseRepository<T> extends Repository<T> {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * 保存实体（带异常处理和日志）
   */
  async save(entity: DeepPartial<T>, options?: SaveOptions): Promise<T> {
    try {
      this.logger.debug(`Saving entity: ${JSON.stringify(entity)}`);
      const result = await super.save(entity, options);
      this.logger.debug(`Entity saved successfully with id: ${(result as any).id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to save entity: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'SAVE');
    }
  }

  /**
   * 批量保存实体
   */
  async saveMany(entities: DeepPartial<T>[], options?: SaveOptions): Promise<T[]> {
    try {
      this.logger.debug(`Saving ${entities.length} entities`);
      const result = await super.save(entities, options);
      this.logger.debug(`Successfully saved ${result.length} entities`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to save ${entities.length} entities: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'SAVE_MANY');
    }
  }

  /**
   * 查找所有实体（带异常处理）
   */
  async find(options?: any): Promise<T[]> {
    try {
      this.logger.debug(`Finding entities with options: ${JSON.stringify(options)}`);
      const result = await super.find(options);
      this.logger.debug(`Found ${result.length} entities`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to find entities: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'FIND');
    }
  }

  /**
   * 根据ID查找实体
   */
  async findById(id: any): Promise<T | null> {
    try {
      this.logger.debug(`Finding entity by id: ${id}`);
      const result = await super.findOne({ where: { id } });
      if (result) {
        this.logger.debug(`Entity found with id: ${id}`);
      } else {
        this.logger.debug(`Entity not found with id: ${id}`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Failed to find entity by id ${id}: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'FIND_BY_ID');
    }
  }

  /**
   * 查找单个实体（带异常处理）
   */
  async findOne(options?: any): Promise<T | null> {
    try {
      this.logger.debug(`Finding one entity with options: ${JSON.stringify(options)}`);
      const result = await super.findOne(options);
      if (result) {
        this.logger.debug(`Entity found`);
      } else {
        this.logger.debug(`Entity not found`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Failed to find one entity: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'FIND_ONE');
    }
  }

  /**
   * 删除实体（带异常处理）
   */
  async remove(entity: T, options?: RemoveOptions): Promise<T> {
    try {
      const entityId = (entity as any).id;
      this.logger.debug(`Removing entity with id: ${entityId}`);
      const result = await super.remove(entity, options);
      this.logger.debug(`Entity removed successfully: ${entityId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to remove entity: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'REMOVE');
    }
  }

  /**
   * 根据ID删除实体
   */
  async deleteById(id: any): Promise<void> {
    try {
      this.logger.debug(`Deleting entity by id: ${id}`);
      const result = await super.delete(id);
      this.logger.debug(`Delete operation affected ${result.affected} rows`);
    } catch (error) {
      this.logger.error(`Failed to delete entity by id ${id}: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'DELETE_BY_ID');
    }
  }

  /**
   * 更新实体（带异常处理）
   */
  async updateById(id: any, partialEntity: DeepPartial<T>): Promise<void> {
    try {
      this.logger.debug(`Updating entity with id: ${id}, data: ${JSON.stringify(partialEntity)}`);
      const result = await super.update(id, partialEntity);
      this.logger.debug(`Update operation affected ${result.affected} rows`);
    } catch (error) {
      this.logger.error(`Failed to update entity with id ${id}: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'UPDATE_BY_ID');
    }
  }

  /**
   * 计数（带异常处理）
   */
  async count(options?: any): Promise<number> {
    try {
      this.logger.debug(`Counting entities with options: ${JSON.stringify(options)}`);
      const result = await super.count(options);
      this.logger.debug(`Count result: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to count entities: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'COUNT');
    }
  }

  /**
   * 检查实体是否存在
   */
  async exists(options: any): Promise<boolean> {
    try {
      this.logger.debug(`Checking existence with options: ${JSON.stringify(options)}`);
      const count = await this.count(options);
      const exists = count > 0;
      this.logger.debug(`Exists: ${exists}`);
      return exists;
    } catch (error) {
      this.logger.error(`Failed to check existence: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'EXISTS');
    }
  }

  /**
   * 创建查询构建器（带异常处理包装）
   */
  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    try {
      this.logger.debug(`Creating query builder with alias: ${alias}`);
      return super.createQueryBuilder(alias);
    } catch (error) {
      this.logger.error(`Failed to create query builder: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'CREATE_QUERY_BUILDER');
    }
  }

  /**
   * 包装数据库错误，提供更有意义的异常信息
   */
  protected wrapDatabaseError(error: any, operation: string): Error {
    // 记录原始错误
    this.logger.error(`Database error in ${operation}: ${error.message}`);

    // 根据错误类型提供更有意义的错误信息
    if (error.code === 'ER_DUP_ENTRY') {
      return new Error(`Duplicate entry: ${error.message}`);
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return new Error(`Foreign key constraint fails: ${error.message}`);
    } else if (error.code === 'ER_DATA_TOO_LONG') {
      return new Error(`Data too long for column: ${error.message}`);
    } else if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
      return new Error(`Database lock timeout: ${error.message}`);
    } else if (error.code === 'ER_DEADLOCK') {
      return new Error(`Database deadlock: ${error.message}`);
    }

    // 返回原始错误，但确保它是Error实例
    return error instanceof Error ? error : new Error(`Database error: ${error.message}`);
  }

  /**
   * 事务支持：执行事务操作
   */
  async transaction<U>(operation: (repository: this) => Promise<U>): Promise<U> {
    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 创建事务中的Repository实例
      const transactionalRepository = queryRunner.manager.getRepository(this.metadata.target) as this;
      const result = await operation(transactionalRepository);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Transaction failed: ${error.message}`, error.stack);
      throw this.wrapDatabaseError(error, 'TRANSACTION');
    } finally {
      await queryRunner.release();
    }
  }
}