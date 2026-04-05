"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_context_service_1 = require("../tenant-context.service");
describe('TenantContextService', () => {
    afterEach(() => {
        const storage = tenant_context_service_1.TenantContextService['asyncLocalStorage'];
        storage.exit(() => { });
    });
    describe('runWithContext', () => {
        it('should set context and execute callback', () => {
            const context = { tenantId: 'test-tenant' };
            const callback = jest.fn();
            tenant_context_service_1.TenantContextService.runWithContext(context, callback);
            expect(callback).toHaveBeenCalled();
        });
        it('should make context available within callback via getCurrentTenantIdStatic', () => {
            const context = { tenantId: 'test-tenant' };
            let capturedTenantId;
            tenant_context_service_1.TenantContextService.runWithContext(context, () => {
                capturedTenantId = tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
            });
            expect(capturedTenantId).toBe('test-tenant');
        });
        it('should isolate contexts between nested runs', () => {
            const outerContext = { tenantId: 'outer-tenant' };
            const innerContext = { tenantId: 'inner-tenant' };
            const capturedIds = [];
            tenant_context_service_1.TenantContextService.runWithContext(outerContext, () => {
                capturedIds.push(tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic());
                tenant_context_service_1.TenantContextService.runWithContext(innerContext, () => {
                    capturedIds.push(tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic());
                });
                capturedIds.push(tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic());
            });
            expect(capturedIds).toEqual([
                'outer-tenant',
                'inner-tenant',
                'outer-tenant',
            ]);
        });
    });
    describe('getCurrentTenantIdStatic', () => {
        it('should return default tenant when no context is set', () => {
            const storage = tenant_context_service_1.TenantContextService['asyncLocalStorage'];
            storage.exit(() => {
                const tenantId = tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
                expect(tenantId).toBe('default-tenant');
            });
        });
        it('should return tenantId from context when inside runWithContext', () => {
            const context = { tenantId: 'specific-tenant' };
            tenant_context_service_1.TenantContextService.runWithContext(context, () => {
                const tenantId = tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
                expect(tenantId).toBe('specific-tenant');
            });
        });
    });
    describe('getCurrentTenantId', () => {
        it('should return same as static method', () => {
            const context = { tenantId: 'instance-test-tenant' };
            tenant_context_service_1.TenantContextService.runWithContext(context, () => {
                const service = new tenant_context_service_1.TenantContextService();
                const instanceResult = service.getCurrentTenantId();
                const staticResult = tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
                expect(instanceResult).toBe(staticResult);
                expect(instanceResult).toBe('instance-test-tenant');
            });
        });
    });
    describe('asyncStorage getter', () => {
        it('should return AsyncLocalStorage instance', () => {
            const storage = tenant_context_service_1.TenantContextService.asyncStorage;
            expect(storage).toBeDefined();
            expect(typeof storage.run).toBe('function');
            expect(typeof storage.getStore).toBe('function');
        });
    });
});
//# sourceMappingURL=tenant-context.service.spec.js.map