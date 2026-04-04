import { TenantRepository } from './tenant.repository';
import { User } from '../../entities/user.entity';
export declare class UserRepository extends TenantRepository<User> {
    findByEmail(email: string): Promise<User | null>;
    findActiveUsers(): Promise<User[]>;
}
