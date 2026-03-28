import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { TenantRepository } from '../../../shared/repositories/tenant.repository';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { TenantContextService } from '../../../shared/services/tenant-context.service';
import { TenantEntity } from '../../../shared/interfaces/tenant-entity.interface';

// 测试用的实体类，实现TenantEntity接口
class TestTenantEntity implements TenantEntity, ObjectLiteral {
  id: string;
  name: string;
  tenantId: string;
  updatedAt?: Date;
}

// 具体的测试Repository
class TestTenantRepository extends TenantRepository<TestTenantEntity> {}

describe('TenantRepository', () => {
  let testRepository: TestTenantRepository;
  let mockTypeOrmRepository: Repository<TestTenantEntity>;
  let mockQueryBuilder: Partial<SelectQueryBuilder<TestTenantEntity>>;
  let getCurrentTenantIdSpy: jest.SpyInstance;

  beforeEach(async () => {
    mockQueryBuilder = {
      alias: 'testEntity',
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getCount: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
    } as any;

    mockTypeOrmRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      find: jest.fn(),
      findOne: jest.fn(),
      findByIds: jest.fn(),
      count: jest.fn(),
      manager: {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
        getRepository: jest.fn().mockReturnValue(mockTypeOrmRepository),
        connection: {
          createQueryRunner: jest.fn(),
        },
      },
      metadata: {
        name: 'TestTenantEntity',
        target: TestTenantEntity,
      },
    } as any;

    // 模拟TenantContextService.getCurrentTenantIdStatic
    getCurrentTenantIdSpy = jest.spyOn(
      TenantContextService,
      'getCurrentTenantIdStatic',
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestTenantRepository,
        {
          provide: getRepositoryToken(TestTenantEntity),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    testRepository = module.get<TestTenantRepository>(TestTenantRepository);

    // 手动设置Repository的manager和metadata属性
    Object.defineProperty(testRepository, 'manager', {
      get: () => mockTypeOrmRepository.manager,
      configurable: true,
    });
    Object.defineProperty(testRepository, 'metadata', {
      get: () => mockTypeOrmRepository.metadata,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addTenantCondition', () => {
    it('should add tenant condition to query builder', () => {
      const tenantId = 'test-tenant-123';
      getCurrentTenantIdSpy.mockReturnValue(tenantId);

      const queryBuilder =
        mockQueryBuilder as SelectQueryBuilder<TestTenantEntity>;
      testRepository['addTenantCondition'](queryBuilder);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'testEntity.tenantId = :tenantId',
        { tenantId },
      );
      expect(getCurrentTenantIdSpy).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should add tenant condition when calling find', async () => {
      const tenantId = 'tenant-1';
      const entities = [{ id: '1', name: 'Test', tenantId }];
      getCurrentTenantIdSpy.mockReturnValue(tenantId);
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(entities);

      const result = await testRepository.find();

      expect(
        mockTypeOrmRepository.manager.createQueryBuilder,
      ).toHaveBeenCalledWith(TestTenantEntity, 'TestTenantEntity', undefined);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'testEntity.tenantId = :tenantId',
        { tenantId },
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(entities);
    });

    it('should apply additional where conditions', async () => {
      const tenantId = 'tenant-1';
      const whereCondition = { name: 'Test' };
      getCurrentTenantIdSpy.mockReturnValue(tenantId);
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);

      await testRepository.find({ where: whereCondition });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(whereCondition);
    });
  });

  describe('findOne', () => {
    it('should add tenant condition when calling findOne', async () => {
      const tenantId = 'tenant-1';
      const entity = { id: '1', name: 'Test', tenantId };
      getCurrentTenantIdSpy.mockReturnValue(tenantId);
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(entity);

      const result = await testRepository.findOne();

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'testEntity.tenantId = :tenantId',
        { tenantId },
      );
      expect(result).toEqual(entity);
    });
  });

  describe('findByIds', () => {
    it('should add tenant condition and id filter', async () => {
      const tenantId = 'tenant-1';
      const ids = ['1', '2'];
      const entities = [{ id: '1', name: 'Test', tenantId }];
      getCurrentTenantIdSpy.mockReturnValue(tenantId);
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(entities);

      const result = await testRepository.findByIds(ids);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'testEntity.tenantId = :tenantId',
        { tenantId },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'testEntity.id IN (:...ids)',
        { ids },
      );
      expect(result).toEqual(entities);
    });
  });

  describe('count', () => {
    it('should add tenant condition when calling count', async () => {
      const tenantId = 'tenant-1';
      const count = 5;
      getCurrentTenantIdSpy.mockReturnValue(tenantId);
      (mockQueryBuilder.getCount as jest.Mock).mockResolvedValue(count);

      const result = await testRepository.count();

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'testEntity.tenantId = :tenantId',
        { tenantId },
      );
      expect(result).toBe(count);
    });
  });

  describe('createQueryBuilder', () => {
    it('should return query builder with tenant condition', () => {
      const tenantId = 'tenant-1';
      getCurrentTenantIdSpy.mockReturnValue(tenantId);

      const queryBuilder = testRepository.createQueryBuilder('alias');

      expect(
        mockTypeOrmRepository.manager.createQueryBuilder,
      ).toHaveBeenCalledWith(TestTenantEntity, 'alias', undefined);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'testEntity.tenantId = :tenantId',
        { tenantId },
      );
      expect(queryBuilder).toBe(mockQueryBuilder);
    });
  });

  describe('findAllTenants', () => {
    it('should call parent find method without tenant filtering', async () => {
      const entities = [
        { id: '1', name: 'Test1', tenantId: 'tenant-1' },
        { id: '2', name: 'Test2', tenantId: 'tenant-2' },
      ];
      // 模拟BaseRepository的find方法（不添加租户条件）
      const baseFindSpy = jest
        .spyOn(BaseRepository.prototype, 'find')
        .mockResolvedValue(entities);

      const result = await testRepository.findAllTenants();

      // 确保调用了父类的find方法，而不是添加了租户条件
      expect(baseFindSpy).toHaveBeenCalled();
      expect(result).toEqual(entities);
      // 确保没有调用租户条件添加
      expect(getCurrentTenantIdSpy).not.toHaveBeenCalled();

      // 清理模拟
      baseFindSpy.mockRestore();
    });
  });

  describe('checkTenantAccess', () => {
    it('should return true when entity exists for current tenant', async () => {
      const tenantId = 'tenant-1';
      const entityId = '123';
      const entity = { id: entityId, name: 'Test', tenantId };
      getCurrentTenantIdSpy.mockReturnValue(tenantId);
      jest.spyOn(testRepository, 'findOne').mockResolvedValue(entity as any);

      const result = await testRepository.checkTenantAccess(entityId);

      expect(testRepository.findOne).toHaveBeenCalledWith({
        where: { id: entityId },
      });
      expect(result).toBe(true);
    });

    it('should return false when entity does not exist', async () => {
      const tenantId = 'tenant-1';
      const entityId = '123';
      getCurrentTenantIdSpy.mockReturnValue(tenantId);
      jest.spyOn(testRepository, 'findOne').mockResolvedValue(null);

      const result = await testRepository.checkTenantAccess(entityId);

      expect(result).toBe(false);
    });

    it('should return false when findOne throws error', async () => {
      const tenantId = 'tenant-1';
      const entityId = '123';
      getCurrentTenantIdSpy.mockReturnValue(tenantId);
      jest
        .spyOn(testRepository, 'findOne')
        .mockRejectedValue(new Error('DB error'));

      const result = await testRepository.checkTenantAccess(entityId);

      expect(result).toBe(false);
    });
  });

  describe('getTenantStats', () => {
    it('should return stats for current tenant', async () => {
      const tenantId = 'tenant-1';
      const count = 10;
      const latestEntity = {
        id: '1',
        name: 'Test',
        tenantId,
        updatedAt: new Date('2026-03-27'),
      };
      getCurrentTenantIdSpy.mockReturnValue(tenantId);
      jest.spyOn(testRepository, 'count').mockResolvedValue(count);
      jest.spyOn(testRepository, 'createQueryBuilder').mockReturnValue({
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(latestEntity),
      } as any);

      const result = await testRepository.getTenantStats();

      expect(result.totalCount).toBe(count);
      expect(result.lastUpdated).toEqual(latestEntity.updatedAt);
      expect(result.sizeEstimate).toBe(count * 1024); // 1KB per row
    });

    it('should handle null latest entity', async () => {
      const tenantId = 'tenant-1';
      const count = 0;
      getCurrentTenantIdSpy.mockReturnValue(tenantId);
      jest.spyOn(testRepository, 'count').mockResolvedValue(count);
      jest.spyOn(testRepository, 'createQueryBuilder').mockReturnValue({
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await testRepository.getTenantStats();

      expect(result.totalCount).toBe(0);
      expect(result.lastUpdated).toBeNull();
      expect(result.sizeEstimate).toBe(0);
    });
  });
});
