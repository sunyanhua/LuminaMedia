import { TenantRepository } from './tenant.repository';
import { UserBehavior } from '../../modules/data-analytics/entities/user-behavior.entity';
export declare class UserBehaviorRepository extends TenantRepository<UserBehavior> {
    findByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<UserBehavior[]>;
    findUserSessions(userId: string, days?: number): Promise<string[]>;
}
