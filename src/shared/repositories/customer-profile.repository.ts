import { TenantRepository } from './tenant.repository';
import { CustomerProfile } from '../../entities/customer-profile.entity';

/**
 * CustomerProfile实体的租户感知Repository
 */
export class CustomerProfileRepository extends TenantRepository<CustomerProfile> {
  // 可以添加实体特定的查询方法
  async findByCustomerName(name: string): Promise<CustomerProfile[]> {
    return this.createQueryBuilder('profile')
      .where('profile.customerName LIKE :name', { name: `%${name}%` })
      .getMany();
  }
}
