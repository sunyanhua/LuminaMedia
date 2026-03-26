import { TenantContextService, TenantContext } from '../tenant-context.service';

describe('TenantContextService', () => {
  afterEach(() => {
    // Clear AsyncLocalStorage store after each test
    const storage = TenantContextService['asyncLocalStorage'];
    storage.exit(() => {});
  });

  describe('runWithContext', () => {
    it('should set context and execute callback', () => {
      const context: TenantContext = { tenantId: 'test-tenant' };
      const callback = jest.fn();
      TenantContextService.runWithContext(context, callback);
      expect(callback).toHaveBeenCalled();
    });

    it('should make context available within callback via getCurrentTenantIdStatic', () => {
      const context: TenantContext = { tenantId: 'test-tenant' };
      let capturedTenantId: string | undefined;
      TenantContextService.runWithContext(context, () => {
        capturedTenantId = TenantContextService.getCurrentTenantIdStatic();
      });
      expect(capturedTenantId).toBe('test-tenant');
    });

    it('should isolate contexts between nested runs', () => {
      const outerContext: TenantContext = { tenantId: 'outer-tenant' };
      const innerContext: TenantContext = { tenantId: 'inner-tenant' };
      const capturedIds: string[] = [];

      TenantContextService.runWithContext(outerContext, () => {
        capturedIds.push(TenantContextService.getCurrentTenantIdStatic());
        TenantContextService.runWithContext(innerContext, () => {
          capturedIds.push(TenantContextService.getCurrentTenantIdStatic());
        });
        capturedIds.push(TenantContextService.getCurrentTenantIdStatic());
      });

      expect(capturedIds).toEqual(['outer-tenant', 'inner-tenant', 'outer-tenant']);
    });
  });

  describe('getCurrentTenantIdStatic', () => {
    it('should return default tenant when no context is set', () => {
      // Ensure we're outside any runWithContext
      const storage = TenantContextService['asyncLocalStorage'];
      storage.exit(() => {
        const tenantId = TenantContextService.getCurrentTenantIdStatic();
        expect(tenantId).toBe('default-tenant');
      });
    });

    it('should return tenantId from context when inside runWithContext', () => {
      const context: TenantContext = { tenantId: 'specific-tenant' };
      TenantContextService.runWithContext(context, () => {
        const tenantId = TenantContextService.getCurrentTenantIdStatic();
        expect(tenantId).toBe('specific-tenant');
      });
    });
  });

  describe('getCurrentTenantId', () => {
    it('should return same as static method', () => {
      const context: TenantContext = { tenantId: 'instance-test-tenant' };
      TenantContextService.runWithContext(context, () => {
        const service = new TenantContextService();
        const instanceResult = service.getCurrentTenantId();
        const staticResult = TenantContextService.getCurrentTenantIdStatic();
        expect(instanceResult).toBe(staticResult);
        expect(instanceResult).toBe('instance-test-tenant');
      });
    });
  });

  describe('asyncStorage getter', () => {
    it('should return AsyncLocalStorage instance', () => {
      const storage = TenantContextService.asyncStorage;
      expect(storage).toBeDefined();
      expect(typeof storage.run).toBe('function');
      expect(typeof storage.getStore).toBe('function');
    });
  });
});