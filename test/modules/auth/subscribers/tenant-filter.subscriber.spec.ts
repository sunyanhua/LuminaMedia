import { DataSource, InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm';
import { TenantFilterSubscriber } from '../../../../src/shared/subscribers/tenant-filter.subscriber';
import { TenantContextService } from '../../../../src/shared/services/tenant-context.service';

describe('TenantFilterSubscriber', () => {
  let subscriber: TenantFilterSubscriber;
  let mockDataSource: Partial<DataSource>;
  let getCurrentTenantIdSpy: jest.SpyInstance;

  beforeEach(() => {
    mockDataSource = {
      subscribers: [] as any[],
    };

    subscriber = new TenantFilterSubscriber(mockDataSource as DataSource);
    getCurrentTenantIdSpy = jest.spyOn(
      TenantContextService,
      'getCurrentTenantIdStatic',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should add itself to dataSource subscribers', () => {
      expect(mockDataSource.subscribers).toContain(subscriber);
    });
  });

  describe('hasTenantId', () => {
    it('should return true for entity with tenantId property', () => {
      const entity = { id: '1', name: 'Test', tenantId: 'tenant-1' };
      expect(subscriber['hasTenantId'](entity)).toBe(true);
    });

    it('should return false for entity without tenantId property', () => {
      const entity = { id: '1', name: 'Test' };
      expect(subscriber['hasTenantId'](entity)).toBe(false);
    });

    it('should return false for null or undefined entity', () => {
      expect(subscriber['hasTenantId'](null)).toBe(false);
      expect(subscriber['hasTenantId'](undefined)).toBe(false);
    });
  });

  describe('beforeInsert', () => {
    it('should set tenantId when entity has tenantId property but no value', () => {
      const tenantId = 'test-tenant-123';
      const entity = { id: '1', name: 'Test', tenantId: undefined };
      const event = { entity } as InsertEvent<any>;
      getCurrentTenantIdSpy.mockReturnValue(tenantId);

      subscriber.beforeInsert(event);

      expect(entity.tenantId).toBe(tenantId);
      expect(getCurrentTenantIdSpy).toHaveBeenCalled();
    });

    it('should not modify tenantId when already set', () => {
      const existingTenantId = 'existing-tenant';
      const entity = { id: '1', name: 'Test', tenantId: existingTenantId };
      const event = { entity } as InsertEvent<any>;
      getCurrentTenantIdSpy.mockReturnValue('different-tenant');

      subscriber.beforeInsert(event);

      expect(entity.tenantId).toBe(existingTenantId);
      expect(getCurrentTenantIdSpy).toHaveBeenCalled();
    });

    it('should not modify entity without tenantId property', () => {
      const entity = { id: '1', name: 'Test' };
      const originalEntity = { ...entity };
      const event = { entity } as InsertEvent<any>;

      subscriber.beforeInsert(event);

      expect(entity).toEqual(originalEntity);
      expect(getCurrentTenantIdSpy).not.toHaveBeenCalled();
    });

    it('should handle null entity gracefully', () => {
      const event = { entity: null } as InsertEvent<any>;

      expect(() => subscriber.beforeInsert(event)).not.toThrow();
    });
  });

  describe('beforeUpdate', () => {
    it('should not throw for entity with tenantId', () => {
      const entity = { id: '1', name: 'Test', tenantId: 'tenant-1' };
      const event = { entity } as UpdateEvent<any>;

      expect(() => subscriber.beforeUpdate(event)).not.toThrow();
    });

    it('should not throw for entity without tenantId', () => {
      const entity = { id: '1', name: 'Test' };
      const event = { entity } as UpdateEvent<any>;

      expect(() => subscriber.beforeUpdate(event)).not.toThrow();
    });

    it('should handle null entity gracefully', () => {
      const event = { entity: null } as UpdateEvent<any>;

      expect(() => subscriber.beforeUpdate(event)).not.toThrow();
    });
  });

  describe('beforeRemove', () => {
    it('should not throw for entity with tenantId', () => {
      const entity = { id: '1', name: 'Test', tenantId: 'tenant-1' };
      const event = { entity } as RemoveEvent<any>;

      expect(() => subscriber.beforeRemove(event)).not.toThrow();
    });

    it('should not throw for entity without tenantId', () => {
      const entity = { id: '1', name: 'Test' };
      const event = { entity } as RemoveEvent<any>;

      expect(() => subscriber.beforeRemove(event)).not.toThrow();
    });

    it('should handle null entity gracefully', () => {
      const event = { entity: null } as RemoveEvent<any>;

      expect(() => subscriber.beforeRemove(event)).not.toThrow();
    });
  });

  describe('afterLoad', () => {
    it('should not throw (placeholder implementation)', () => {
      const entity = { id: '1', name: 'Test' };
      const event = {} as any;

      expect(() => subscriber.afterLoad(entity, event)).not.toThrow();
    });
  });

  describe('tenant context integration', () => {
    it('should use TenantContextService for tenant ID', () => {
      const tenantId = 'dynamic-tenant';
      const entity = { id: '1', name: 'Test', tenantId: undefined };
      const event = { entity } as InsertEvent<any>;
      getCurrentTenantIdSpy.mockReturnValue(tenantId);

      subscriber.beforeInsert(event);

      expect(getCurrentTenantIdSpy).toHaveBeenCalled();
      expect(entity.tenantId).toBe(tenantId);
    });

    it('should work with different tenant contexts', () => {
      // 模拟多个租户上下文
      const tenantIds = ['tenant-a', 'tenant-b'];
      let callCount = 0;
      getCurrentTenantIdSpy.mockImplementation(
        () => tenantIds[callCount++ % tenantIds.length],
      );

      const entity1 = { id: '1', name: 'Test1', tenantId: undefined };
      const entity2 = { id: '2', name: 'Test2', tenantId: undefined };

      subscriber.beforeInsert({ entity: entity1 } as InsertEvent<any>);
      subscriber.beforeInsert({ entity: entity2 } as InsertEvent<any>);

      expect(entity1.tenantId).toBe('tenant-a');
      expect(entity2.tenantId).toBe('tenant-b');
    });
  });
});
