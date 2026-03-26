/**
 * TenantEntity接口
 * 所有包含tenant_id字段的实体都应实现此接口
 */
export interface TenantEntity {
  tenantId: string;
}