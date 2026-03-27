import { User } from '../../entities/user.entity';

/**
 * 用户实体工厂
 * 用于生成测试用的User实体实例
 */
export class UserFactory {
  private static counter = 1;

  /**
   * 生成随机字符串
   */
  private static randomString(prefix = ''): string {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  /**
   * 创建用户实体，可自定义属性
   * @param overrides 自定义属性，覆盖默认生成的属性
   * @returns 用户实体实例
   */
  static create(overrides: Partial<User> = {}): User {
    const counter = this.counter++;
    const user = new User();
    user.id = overrides.id || `user-${counter}-${Date.now()}`;
    user.username = overrides.username || `user${counter}`;
    user.passwordHash = overrides.passwordHash || `hashed_password_${counter}`;
    user.email = overrides.email || `user${counter}@example.com`;
    user.tenantId = overrides.tenantId || 'default-tenant';
    user.createdAt = overrides.createdAt || new Date();

    // 关系字段不在此初始化
    user.socialAccounts = [];
    user.contentDrafts = [];
    user.userRoles = [];

    return user;
  }

  /**
   * 创建多个用户实体
   * @param count 数量
   * @param overrides 自定义属性，应用于所有实体
   * @returns 用户实体数组
   */
  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      users.push(this.create(overrides));
    }
    return users;
  }

  /**
   * 创建特定租户的用户
   * @param tenantId 租户ID
   * @param overrides 自定义属性
   * @returns 用户实体实例
   */
  static createForTenant(
    tenantId: string,
    overrides: Partial<User> = {},
  ): User {
    return this.create({ ...overrides, tenantId });
  }

  /**
   * 创建管理员用户
   * @param overrides 自定义属性
   * @returns 用户实体实例
   */
  static createAdmin(overrides: Partial<User> = {}): User {
    return this.create({
      username: 'admin',
      email: 'admin@example.com',
      tenantId: 'system-tenant',
      ...overrides,
    });
  }

  /**
   * 创建测试用户（固定数据，便于断言）
   * @param overrides 自定义属性
   * @returns 用户实体实例
   */
  static createTestUser(overrides: Partial<User> = {}): User {
    return this.create({
      id: 'test-user-id',
      username: 'testuser',
      passwordHash: 'hashed_password_123',
      email: 'test@example.com',
      tenantId: 'test-tenant',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    });
  }
}
