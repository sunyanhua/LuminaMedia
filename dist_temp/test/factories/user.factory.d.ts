import { User } from '../../entities/user.entity';
export declare class UserFactory {
    private static counter;
    private static randomString;
    static create(overrides?: Partial<User>): User;
    static createMany(count: number, overrides?: Partial<User>): User[];
    static createForTenant(tenantId: string, overrides?: Partial<User>): User;
    static createAdmin(overrides?: Partial<User>): User;
    static createTestUser(overrides?: Partial<User>): User;
}
