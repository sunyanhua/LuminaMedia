"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("typeorm");
const tenant_filter_subscriber_1 = require("../tenant-filter.subscriber");
const tenant_context_service_1 = require("../../services/tenant-context.service");
describe('TenantFilterSubscriber', () => {
    let subscriber;
    let dataSource;
    let getCurrentTenantIdStaticSpy;
    beforeEach(async () => {
        getCurrentTenantIdStaticSpy = jest
            .spyOn(tenant_context_service_1.TenantContextService, 'getCurrentTenantIdStatic')
            .mockReturnValue('test-tenant-id');
        dataSource = {
            subscribers: [],
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                tenant_filter_subscriber_1.TenantFilterSubscriber,
                {
                    provide: typeorm_1.DataSource,
                    useValue: dataSource,
                },
            ],
        }).compile();
        subscriber = module.get(tenant_filter_subscriber_1.TenantFilterSubscriber);
    });
    afterEach(() => {
        jest.clearAllMocks();
        getCurrentTenantIdStaticSpy.mockRestore();
    });
    describe('constructor', () => {
        it('should add itself to dataSource subscribers', () => {
            expect(dataSource.subscribers).toContain(subscriber);
        });
    });
    describe('hasTenantId', () => {
        it('should return true when entity has tenantId property', () => {
            const entity = { tenantId: 'some-tenant' };
            expect(subscriber['hasTenantId'](entity)).toBe(true);
        });
        it('should return false when entity does not have tenantId property', () => {
            const entity = { id: '123' };
            expect(subscriber['hasTenantId'](entity)).toBe(false);
        });
        it('should return false when entity is null or undefined', () => {
            expect(subscriber['hasTenantId'](null)).toBe(false);
            expect(subscriber['hasTenantId'](undefined)).toBe(false);
        });
    });
    describe('getCurrentTenantId', () => {
        it('should get tenant ID from TenantContextService', () => {
            const tenantId = subscriber['getCurrentTenantId']();
            expect(tenantId).toBe('test-tenant-id');
            expect(getCurrentTenantIdStaticSpy).toHaveBeenCalled();
        });
    });
    describe('beforeInsert', () => {
        it('should set tenantId when entity has tenantId property and it is empty', () => {
            const entity = { name: 'Test', tenantId: null };
            const event = { entity };
            subscriber.beforeInsert(event);
            expect(entity.tenantId).toBe('test-tenant-id');
        });
        it('should not modify tenantId when entity already has tenantId', () => {
            const entity = { name: 'Test', tenantId: 'existing-tenant' };
            const event = { entity };
            subscriber.beforeInsert(event);
            expect(entity.tenantId).toBe('existing-tenant');
        });
        it('should do nothing when entity does not have tenantId property', () => {
            const entity = { name: 'Test' };
            const event = { entity };
            subscriber.beforeInsert(event);
            expect(entity).toEqual({ name: 'Test' });
        });
        it('should handle null entity gracefully', () => {
            const event = { entity: null };
            expect(() => subscriber.beforeInsert(event)).not.toThrow();
        });
    });
    describe('beforeUpdate', () => {
        it('should not modify tenantId but can add security checks', () => {
            const entity = { name: 'Test', tenantId: 'existing-tenant' };
            const event = { entity };
            expect(() => subscriber.beforeUpdate(event)).not.toThrow();
        });
        it('should handle null entity gracefully', () => {
            const event = { entity: null };
            expect(() => subscriber.beforeUpdate(event)).not.toThrow();
        });
    });
    describe('beforeRemove', () => {
        it('should not modify tenantId but can add security checks', () => {
            const entity = { name: 'Test', tenantId: 'existing-tenant' };
            const event = { entity };
            expect(() => subscriber.beforeRemove(event)).not.toThrow();
        });
        it('should handle null entity gracefully', () => {
            const event = { entity: null };
            expect(() => subscriber.beforeRemove(event)).not.toThrow();
        });
    });
    describe('afterLoad', () => {
        it('should not throw error when called', () => {
            const entity = { name: 'Test', tenantId: 'tenant' };
            const event = {};
            expect(() => subscriber.afterLoad(entity, event)).not.toThrow();
        });
    });
});
//# sourceMappingURL=tenant-filter.subscriber.spec.js.map