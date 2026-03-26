import { TenantRepository } from './tenant.repository';
import { User } from '../../entities/user.entity';

/**
 * User实体的租户感知Repository
 */
export class UserRepository extends TenantRepository<User> {
  // 可以添加用户特定的查询方法
  async findByEmail(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findActiveUsers(): Promise<User[]> {
    return this.createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }
}