import { SelectQueryBuilder } from 'typeorm';
import { TenantEntity } from '../interfaces/tenant-entity.interface';
import { TenantContextService } from '../services/tenant-context.service';
import { BaseRepository } from './base.repository';

/**
 * 租户感知的Repository基类 (TenantRepository)
 * 自动为所有查询添加tenant_id过滤条件，继承BaseRepository的CRUD操作和异常处理
 */
export abstract class TenantRepository<
  T extends TenantEntity,
> extends BaseRepository<T> {
  /**
   * 获取当前租户ID
   */
  protected getCurrentTenantId(): string {
    return TenantContextService.getCurrentTenantIdStatic();
  }

  /**
   * 添加租户过滤条件到查询构建器
   */
  protected addTenantCondition(
    queryBuilder: SelectQueryBuilder<T>,
  ): SelectQueryBuilder<T> {
    const tenantId = this.getCurrentTenantId();
    const alias = queryBuilder.alias;
    queryBuilder.andWhere(`${alias}.tenantId = :tenantId`, { tenantId });
    return queryBuilder;
  }

  /**
   * 重写find方法，自动添加租户过滤
   */
  async find(options?: any): Promise<T[]> {
    const queryBuilder = this.createQueryBuilder(this.metadata.name);
    this.addTenantCondition(queryBuilder);

    if (options?.where) {
      queryBuilder.where(options.where);
    }
    if (options?.order) {
      queryBuilder.orderBy(options.order);
    }
    if (options?.skip) {
      queryBuilder.skip(options.skip);
    }
    if (options?.take) {
      queryBuilder.take(options.take);
    }

    return queryBuilder.getMany();
  }

  /**
   * 重写findOne方法，自动添加租户过滤
   */
  async findOne(options?: any): Promise<T | null> {
    const queryBuilder = this.createQueryBuilder(this.metadata.name);
    this.addTenantCondition(queryBuilder);

    if (options?.where) {
      queryBuilder.where(options.where);
    }

    return queryBuilder.getOne();
  }

  /**
   * 重写findByIds方法，自动添加租户过滤
   */
  async findByIds(ids: any[]): Promise<T[]> {
    const queryBuilder = this.createQueryBuilder(this.metadata.name);
    this.addTenantCondition(queryBuilder);
    queryBuilder.andWhere(`${queryBuilder.alias}.id IN (:...ids)`, { ids });

    return queryBuilder.getMany();
  }

  /**
   * 重写createQueryBuilder方法，自动添加租户过滤
   */
  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    const queryBuilder = super.createQueryBuilder(alias);
    return this.addTenantCondition(queryBuilder);
  }

  /**
   * 重写count方法，自动添加租户过滤
   */
  async count(options?: any): Promise<number> {
    const queryBuilder = this.createQueryBuilder(this.metadata.name);
    this.addTenantCondition(queryBuilder);

    if (options?.where) {
      queryBuilder.where(options.where);
    }

    return queryBuilder.getCount();
  }

  /**
   * 管理员方法：可以查看所有租户数据
   */
  async findAllTenants(options?: any): Promise<T[]> {
    // 这个方法跳过租户过滤，仅供管理员使用
    // 使用父类的find方法，避免添加租户条件
    return super.find(options);
  }

  /**
   * 检查当前租户是否有权限访问指定实体
   */
  async checkTenantAccess(entityId: any): Promise<boolean> {
    try {
      const entity = await this.findOne({ where: { id: entityId } });
      return entity !== null;
    } catch (error) {
      this.logger.error(
        `Failed to check tenant access for entity ${entityId}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * 获取当前租户的所有数据统计
   */
  async getTenantStats(): Promise<{
    totalCount: number;
    lastUpdated: Date | null;
    sizeEstimate: number;
  }> {
    const count = await this.count();
    const latest = await this.createQueryBuilder()
      .orderBy(`${this.metadata.name}.updatedAt`, 'DESC')
      .getOne();

    let lastUpdated: Date | null = null;
    if (latest) {
      lastUpdated = (latest as any).updatedAt || null;
    }

    return {
      totalCount: count,
      lastUpdated,
      sizeEstimate: count * 1024, // 假设每行1KB
    };
  }
}
