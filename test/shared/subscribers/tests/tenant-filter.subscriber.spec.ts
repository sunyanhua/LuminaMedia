import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm';
import { TenantFilterSubscriber } from '../../../../src/shared/subscribers/tenant-filter.subscriber';
import { TenantContextService } from '../../../../src/shared/services/tenant-context.service';

describe('TenantFilterSubscriber', () => {
  let subscriber: TenantFilterSubscriber;
  let dataSource: DataSource;
  let getCurrentTenantIdStaticSpy: jest.SpyInstance;

  beforeEach(async () => {
    // 模拟静态方法
    getCurrentTenantIdStaticSpy = jest
      .spyOn(TenantContextService, 'getCurrentTenantIdStatic')
      .mockReturnValue('test-tenant-id');

    dataSource = {
      subscribers: [],
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantFilterSubscriber,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    subscriber = module.get<TenantFilterSubscriber>(TenantFilterSubscriber);
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
      const event = { entity } as InsertEvent<any>;

      subscriber.beforeInsert(event);

      expect(entity.tenantId).toBe('test-tenant-id');
    });

    it('should not modify tenantId when entity already has tenantId', () => {
      const entity = { name: 'Test', tenantId: 'existing-tenant' };
      const event = { entity } as InsertEvent<any>;

      subscriber.beforeInsert(event);

      expect(entity.tenantId).toBe('existing-tenant');
    });

    it('should do nothing when entity does not have tenantId property', () => {
      const entity = { name: 'Test' };
      const event = { entity } as InsertEvent<any>;

      subscriber.beforeInsert(event);

      expect(entity).toEqual({ name: 'Test' });
    });

    it('should handle null entity gracefully', () => {
      const event = { entity: null } as InsertEvent<any>;

      expect(() => subscriber.beforeInsert(event)).not.toThrow();
    });
  });

  describe('beforeUpdate', () => {
    it('should not modify tenantId but can add security checks', () => {
      const entity = { name: 'Test', tenantId: 'existing-tenant' };
      const event = { entity } as UpdateEvent<any>;

      // 目前beforeUpdate方法为空，但我们可以调用它确保不会抛出错误
      expect(() => subscriber.beforeUpdate(event)).not.toThrow();
    });

    it('should handle null entity gracefully', () => {
      const event = { entity: null } as UpdateEvent<any>;

      expect(() => subscriber.beforeUpdate(event)).not.toThrow();
    });
  });

  describe('beforeRemove', () => {
    it('should not modify tenantId but can add security checks', () => {
      const entity = { name: 'Test', tenantId: 'existing-tenant' };
      const event = { entity } as RemoveEvent<any>;

      // 目前beforeRemove方法为空，但我们可以调用它确保不会抛出错误
      expect(() => subscriber.beforeRemove(event)).not.toThrow();
    });

    it('should handle null entity gracefully', () => {
      const event = { entity: null } as RemoveEvent<any>;

      expect(() => subscriber.beforeRemove(event)).not.toThrow();
    });
  });

  describe('afterLoad', () => {
    it('should not throw error when called', () => {
      const entity = { name: 'Test', tenantId: 'tenant' };
      const event = {} as any;

      expect(() => subscriber.afterLoad(entity, event)).not.toThrow();
    });
  });
});
