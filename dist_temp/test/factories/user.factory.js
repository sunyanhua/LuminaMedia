"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFactory = void 0;
const user_entity_1 = require("../../entities/user.entity");
class UserFactory {
    static counter = 1;
    static randomString(prefix = '') {
        return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }
    static create(overrides = {}) {
        const counter = this.counter++;
        const user = new user_entity_1.User();
        user.id = overrides.id || `user-${counter}-${Date.now()}`;
        user.username = overrides.username || `user${counter}`;
        user.passwordHash = overrides.passwordHash || `hashed_password_${counter}`;
        user.email = overrides.email || `user${counter}@example.com`;
        user.tenantId = overrides.tenantId || 'default-tenant';
        user.createdAt = overrides.createdAt || new Date();
        user.socialAccounts = [];
        user.contentDrafts = Promise.resolve([]);
        user.userRoles = [];
        return user;
    }
    static createMany(count, overrides = {}) {
        const users = [];
        for (let i = 0; i < count; i++) {
            users.push(this.create(overrides));
        }
        return users;
    }
    static createForTenant(tenantId, overrides = {}) {
        return this.create({ ...overrides, tenantId });
    }
    static createAdmin(overrides = {}) {
        return this.create({
            username: 'admin',
            email: 'admin@example.com',
            tenantId: 'system-tenant',
            ...overrides,
        });
    }
    static createTestUser(overrides = {}) {
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
exports.UserFactory = UserFactory;
//# sourceMappingURL=user.factory.js.map