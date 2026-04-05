"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const permissions_guard_1 = require("../../../../src/modules/auth/guards/permissions.guard");
describe('PermissionsGuard', () => {
    let guard;
    let reflector;
    beforeEach(() => {
        reflector = new core_1.Reflector();
        guard = new permissions_guard_1.PermissionsGuard(reflector);
    });
    describe('canActivate', () => {
        const createMockContext = (metadata, user = null) => {
            const mockHandler = {};
            const mockClass = {};
            const request = { user };
            const context = {
                getHandler: jest.fn(() => mockHandler),
                getClass: jest.fn(() => mockClass),
                switchToHttp: jest.fn(() => ({ getRequest: jest.fn(() => request) })),
            };
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(metadata);
            return context;
        };
        it('should return true when no required permissions are specified', () => {
            const context = createMockContext(null);
            const result = guard.canActivate(context);
            expect(result).toBe(true);
        });
        it('should return true when required permissions array is empty', () => {
            const context = createMockContext([]);
            const result = guard.canActivate(context);
            expect(result).toBe(true);
        });
        it('should return false when user is not authenticated', () => {
            const requiredPermissions = [
                { module: 'users', action: 'read' },
            ];
            const context = createMockContext(requiredPermissions, null);
            const result = guard.canActivate(context);
            expect(result).toBe(false);
        });
        it('should return false when user has no permissions', () => {
            const user = { id: 'user-id', username: 'testuser', permissions: [] };
            const requiredPermissions = [
                { module: 'users', action: 'read' },
            ];
            const context = createMockContext(requiredPermissions, user);
            const result = guard.canActivate(context);
            expect(result).toBe(false);
        });
        it('should return false when user permissions is undefined', () => {
            const user = { id: 'user-id', username: 'testuser' };
            const requiredPermissions = [
                { module: 'users', action: 'read' },
            ];
            const context = createMockContext(requiredPermissions, user);
            const result = guard.canActivate(context);
            expect(result).toBe(false);
        });
        it('should return true when user has all required permissions', () => {
            const user = {
                id: 'user-id',
                username: 'testuser',
                permissions: [
                    { id: 'perm-1', module: 'users', action: 'read' },
                    { id: 'perm-2', module: 'users', action: 'create' },
                    { id: 'perm-3', module: 'content', action: 'edit' },
                ],
            };
            const requiredPermissions = [
                { module: 'users', action: 'read' },
                { module: 'content', action: 'edit' },
            ];
            const context = createMockContext(requiredPermissions, user);
            const result = guard.canActivate(context);
            expect(result).toBe(true);
        });
        it('should return false when user is missing any required permission', () => {
            const user = {
                id: 'user-id',
                username: 'testuser',
                permissions: [
                    { id: 'perm-1', module: 'users', action: 'read' },
                    { id: 'perm-2', module: 'users', action: 'create' },
                ],
            };
            const requiredPermissions = [
                { module: 'users', action: 'read' },
                { module: 'content', action: 'edit' },
            ];
            const context = createMockContext(requiredPermissions, user);
            const result = guard.canActivate(context);
            expect(result).toBe(false);
        });
        it('should check both handler and class metadata', () => {
            const user = {
                id: 'user-id',
                username: 'testuser',
                permissions: [{ id: 'perm-1', module: 'users', action: 'read' }],
            };
            const requiredPermissions = [
                { module: 'users', action: 'read' },
            ];
            const context = createMockContext(requiredPermissions, user);
            const result = guard.canActivate(context);
            expect(jest.mocked(reflector.getAllAndOverride)).toHaveBeenCalledWith(permissions_guard_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
            expect(result).toBe(true);
        });
        it('should handle multiple required permissions with complex matching', () => {
            const user = {
                id: 'user-id',
                username: 'testuser',
                permissions: [
                    { id: 'perm-1', module: 'users', action: 'read' },
                    { id: 'perm-2', module: 'users', action: 'create' },
                    { id: 'perm-3', module: 'content', action: 'edit' },
                    { id: 'perm-4', module: 'content', action: 'publish' },
                ],
            };
            const context1 = createMockContext([
                { module: 'users', action: 'read' },
                { module: 'users', action: 'create' },
                { module: 'content', action: 'edit' },
            ], user);
            expect(guard.canActivate(context1)).toBe(true);
            const context2 = createMockContext([
                { module: 'users', action: 'read' },
                { module: 'users', action: 'delete' },
            ], user);
            expect(guard.canActivate(context2)).toBe(false);
            const context3 = createMockContext([
                { module: 'users', action: 'read' },
                { module: 'users', action: 'create' },
                { module: 'content', action: 'publish' },
                { module: 'analytics', action: 'view' },
            ], user);
            expect(guard.canActivate(context3)).toBe(false);
        });
        it('should normalize user permissions to module-action pairs', () => {
            const user = {
                id: 'user-id',
                username: 'testuser',
                permissions: [
                    {
                        id: 'perm-1',
                        module: 'users',
                        action: 'read',
                        extraField: 'ignored',
                    },
                    {
                        id: 'perm-2',
                        module: 'users',
                        action: 'create',
                        description: 'test',
                    },
                ],
            };
            const requiredPermissions = [
                { module: 'users', action: 'read' },
                { module: 'users', action: 'create' },
            ];
            const context = createMockContext(requiredPermissions, user);
            const result = guard.canActivate(context);
            expect(result).toBe(true);
        });
        it('should return true when required permissions are empty array', () => {
            const user = {
                id: 'user-id',
                username: 'testuser',
                permissions: [{ id: 'perm-1', module: 'users', action: 'read' }],
            };
            const context = createMockContext([], user);
            const result = guard.canActivate(context);
            expect(result).toBe(true);
        });
        it('should return false when user.permissions is null', () => {
            const user = { id: 'user-id', username: 'testuser', permissions: null };
            const requiredPermissions = [
                { module: 'users', action: 'read' },
            ];
            const context = createMockContext(requiredPermissions, user);
            const result = guard.canActivate(context);
            expect(result).toBe(false);
        });
        it('should return false when user.permissions is not an array', () => {
            const user = {
                id: 'user-id',
                username: 'testuser',
                permissions: { module: 'users', action: 'read' },
            };
            const requiredPermissions = [
                { module: 'users', action: 'read' },
            ];
            const context = createMockContext(requiredPermissions, user);
            const result = guard.canActivate(context);
            expect(result).toBe(false);
        });
        it('should handle user.permissions array containing elements without module or action', () => {
            const user = {
                id: 'user-id',
                username: 'testuser',
                permissions: [
                    { id: 'perm-1', module: 'users', action: 'read' },
                    { id: 'perm-2', notModule: 'users', notAction: 'create' },
                    { id: 'perm-3' },
                ],
            };
            const requiredPermissions = [
                { module: 'users', action: 'read' },
            ];
            const context = createMockContext(requiredPermissions, user);
            const result = guard.canActivate(context);
            expect(result).toBe(true);
        });
    });
});
//# sourceMappingURL=permissions.guard.spec.js.map