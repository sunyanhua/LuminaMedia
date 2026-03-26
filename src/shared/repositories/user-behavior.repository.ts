import { TenantRepository } from './tenant.repository';
import { UserBehavior } from '../../modules/data-analytics/entities/user-behavior.entity';

/**
 * UserBehavior实体的租户感知Repository
 */
export class UserBehaviorRepository extends TenantRepository<UserBehavior> {
  // 可以添加实体特定的查询方法
  async findByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<UserBehavior[]> {
    return this.createQueryBuilder('behavior')
      .where('behavior.userId = :userId', { userId })
      .andWhere('behavior.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('behavior.timestamp', 'ASC')
      .getMany();
  }

  async findUserSessions(userId: string, days: number = 30): Promise<string[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const behaviors = await this.createQueryBuilder('behavior')
      .select('DISTINCT behavior.sessionId')
      .where('behavior.userId = :userId', { userId })
      .andWhere('behavior.timestamp >= :date', { date })
      .getRawMany();

    return behaviors.map(b => b.sessionId);
  }
}