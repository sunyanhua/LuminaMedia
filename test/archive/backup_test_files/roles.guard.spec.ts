import { Reflector } from '@nestjs/core';
import { RolesGuard, ROLES_KEY } from './roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  describe('canActivate', () => {
    const createMockContext = (
      metadata: string[] | null,
      user: {
        id?: string;
        username?: string;
        roles?: Array<{ id?: string; name: string }> | null;
      } | null = null,
    ) => {
      const mockHandler = {};
      const mockClass = {};
      const request = { user };
      const context = {
        getHandler: jest.fn(() => mockHandler),
        getClass: jest.fn(() => mockClass),
        switchToHttp: jest.fn(() => ({ getRequest: jest.fn(() => request) })),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(metadata);

      return context;
    };

    it('should return true when no required roles are specified', () => {
      const context = createMockContext(null);
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true when required roles array is empty', () => {
      const context = createMockContext([]);
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      const context = createMockContext(['admin'], null);
      const result = guard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should return false when user has no roles', () => {
      const user = { id: 'user-id', username: 'testuser', roles: [] };
      const context = createMockContext(['admin'], user);
      const result = guard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should return false when user roles is undefined', () => {
      const user = { id: 'user-id', username: 'testuser' };
      const context = createMockContext(['admin'], user);
      const result = guard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should return true when user has at least one required role', () => {
      const user = {
        id: 'user-id',
        username: 'testuser',
        roles: [
          { id: 'role-1', name: 'editor' },
          { id: 'role-2', name: 'admin' },
        ],
      };
      const context = createMockContext(['admin', 'superadmin'], user);
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return false when user has no matching roles', () => {
      const user = {
        id: 'user-id',
        username: 'testuser',
        roles: [
          { id: 'role-1', name: 'viewer' },
          { id: 'role-2', name: 'editor' },
        ],
      };
      const context = createMockContext(['admin'], user);
      const result = guard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should check both handler and class metadata', () => {
      const user = {
        id: 'user-id',
        username: 'testuser',
        roles: [{ id: 'role-1', name: 'admin' }],
      };
      const context = createMockContext(['admin'], user);

      const result = guard.canActivate(context);

      expect(jest.mocked(reflector.getAllAndOverride)).toHaveBeenCalledWith(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      expect(result).toBe(true);
    });

    it('should handle multiple required roles and multiple user roles', () => {
      const user = {
        id: 'user-id',
        username: 'testuser',
        roles: [
          { id: 'role-1', name: 'editor' },
          { id: 'role-2', name: 'viewer' },
          { id: 'role-3', name: 'moderator' },
        ],
      };

      // Test with matching role
      const context1 = createMockContext(['editor', 'admin'], user);
      expect(guard.canActivate(context1)).toBe(true);

      // Test without matching role
      const context2 = createMockContext(['admin', 'superadmin'], user);
      expect(guard.canActivate(context2)).toBe(false);
    });

    it('should return false when user.roles is null', () => {
      const user = { id: 'user-id', username: 'testuser', roles: null };
      const context = createMockContext(['admin'], user);
      const result = guard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should return false when user.roles is not an array', () => {
      const user = {
        id: 'user-id',
        username: 'testuser',
        roles: { name: 'admin' },
      };
      const context = createMockContext(['admin'], user);
      const result = guard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should handle user.roles array containing non-object elements', () => {
      const user = {
        id: 'user-id',
        username: 'testuser',
        roles: ['admin', 'editor'],
      };
      const context = createMockContext(['admin'], user);
      const result = guard.canActivate(context);
      // The guard expects roles to be objects with name property, so .map will produce undefined names
      // This will cause userRoles to be [undefined, undefined] and include check will fail
      expect(result).toBe(false);
    });
  });
});
