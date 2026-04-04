import { User } from '../../../entities/user.entity';
import { UserBehaviorEvent } from '../../../shared/enums/user-behavior-event.enum';
import { TenantEntity } from '../../../shared/interfaces/tenant-entity.interface';
export declare class UserBehavior implements TenantEntity {
    id: string;
    userId: string;
    user: User;
    sessionId: string;
    eventType: UserBehaviorEvent;
    eventData: Record<string, any>;
    tenantId: string;
    timestamp: Date;
}
