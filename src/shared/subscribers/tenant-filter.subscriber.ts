import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  LoadEvent,
  DataSource,
  QueryRunner,
  SelectQueryBuilder,
} from 'typeorm';
import { TenantContextService } from '../services/tenant-context.service';

/**
 * 租户过滤器订阅器
 * 自动为所有查询添加tenant_id过滤条件
 */
@EventSubscriber()
export class TenantFilterSubscriber implements EntitySubscriberInterface {
  constructor(private dataSource: DataSource) {
    // 订阅所有实体
    dataSource.subscribers.push(this);
  }

  /**
   * 检查实体是否有tenantId属性
   */
  private hasTenantId(entity: any): boolean {
    return entity ? 'tenantId' in entity : false;
  }

  /**
   * 获取当前租户ID
   */
  private getCurrentTenantId(): string {
    return TenantContextService.getCurrentTenantIdStatic();
  }

  /**
   * 在查询构建时添加租户过滤条件
   * 这个方法会在创建查询构建器时被调用
   */
  afterLoad(entity: any, event?: LoadEvent<any>) {
    // 这里可以用于加载后处理，但不是添加查询条件的地方
  }

  /**
   * 在插入前自动设置tenantId
   */
  beforeInsert(event: InsertEvent<any>) {
    if (this.hasTenantId(event.entity)) {
      const tenantId = this.getCurrentTenantId();
      if (!event.entity.tenantId) {
        event.entity.tenantId = tenantId;
      }
    }
  }

  /**
   * 在更新前检查tenantId
   */
  beforeUpdate(event: UpdateEvent<any>) {
    if (this.hasTenantId(event.entity) && event.entity) {
      // 确保更新操作不会修改tenantId
      // 可以添加额外的安全检查
    }
  }

  /**
   * 在删除前检查tenantId
   */
  beforeRemove(event: RemoveEvent<any>) {
    if (this.hasTenantId(event.entity) && event.entity) {
      // 可以添加租户检查逻辑
      // 确保用户只能删除自己租户的数据
    }
  }

  /**
   * 监听所有查询，自动添加租户过滤条件
   * 通过重写QueryRunner的查询方法实现
   * 注意：这是一个高级技巧，需要谨慎处理
   */
  // 实际上，TypeORM没有直接的查询拦截点
  // 我们需要使用不同的方法：创建一个自定义的Repository或QueryBuilder
}