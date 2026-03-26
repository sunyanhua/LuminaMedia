import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../../entities/user.entity';
import { UserBehaviorEvent } from '../../../shared/enums/user-behavior-event.enum';
import { TenantEntity } from '../../../shared/interfaces/tenant-entity.interface';

@Entity('user_behaviors')
@Index(['userId', 'timestamp'])
@Index(['sessionId'])
@Index(['eventType'])
@Index(['tenantId'])
export class UserBehavior implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'session_id', type: 'varchar', length: 64 })
  sessionId: string;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: UserBehaviorEvent,
  })
  eventType: UserBehaviorEvent;

  @Column({ name: 'event_data', type: 'json', nullable: true })
  eventData: Record<string, any>;

  @Column({ name: 'tenant_id', type: 'varchar', length: 36, default: 'default-tenant' })
  tenantId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
