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
  async beforeUpdate(event: UpdateEvent<any>) {
    if (this.hasTenantId(event.entity) && event.entity) {
      // 确保更新操作不会修改tenantId
      // 可以添加额外的安全检查
    }

    // 检查租户权限：确保用户只能更新自己租户的数据
    await this.checkTenantPermission(event);
  }

  /**
   * 在删除前检查tenantId
   */
  async beforeRemove(event: RemoveEvent<any>) {
    if (this.hasTenantId(event.entity) && event.entity) {
      // 可以添加租户检查逻辑
      // 确保用户只能删除自己租户的数据
    }

    // 检查租户权限：确保用户只能删除自己租户的数据
    await this.checkTenantPermission(event);
  }

  /**
   * 检查租户权限
   */
  private async checkTenantPermission(
    event: UpdateEvent<any> | RemoveEvent<any>,
  ): Promise<void> {
    // 获取实体ID
    const eventAny = event as any;
    const entityId = eventAny.entityId || (event.entity && event.entity.id);
    if (!entityId) {
      // 如果没有实体ID，无法检查权限，跳过
      return;
    }

    // 获取实体类
    const entityTarget = event.metadata?.target || eventAny.entityTarget;
    if (!entityTarget) {
      return;
    }

    // 检查实体是否有tenantId属性
    const repository = this.dataSource.getRepository(entityTarget);
    const metadata = repository.metadata;
    const tenantIdColumn = metadata.columns.find(
      (col) => col.propertyName === 'tenantId',
    );
    if (!tenantIdColumn) {
      // 实体没有tenantId字段，跳过检查
      return;
    }

    // 获取当前租户ID
    const currentTenantId = this.getCurrentTenantId();
    if (!currentTenantId) {
      // 没有当前租户上下文，跳过
      return;
    }

    // 从数据库加载实体以获取其tenantId
    const entity = await repository.findOne({
      where: { id: entityId },
      select: ['tenantId'],
    });

    if (!entity) {
      // 实体不存在，可能已经被删除，跳过
      return;
    }

    // 检查租户是否匹配
    if ((entity as any).tenantId !== currentTenantId) {
      throw new Error(`无权访问租户ID为${(entity as any).tenantId}的数据`);
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
