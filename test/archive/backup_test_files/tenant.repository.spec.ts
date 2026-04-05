import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder, Repository, ObjectLiteral } from 'typeorm';
import { TenantRepository } from '../tenant.repository';
import { BaseRepository } from '../base.repository';
import { TenantContextService } from '../../services/tenant-context.service';
import { TenantEntity } from '../../interfaces/tenant-entity.interface';

// 测试用的实体类
class TestEntity implements TenantEntity, ObjectLiteral {
  id: string;
  name: string;
  tenantId: string;
}

// 具体的测试Repository
class TestTenantRepository extends TenantRepository<TestEntity> {
  // 暴露受保护的方法用于测试
  public addTenantConditionPublic(
    queryBuilder: SelectQueryBuilder<TestEntity>,
  ) {
    return this.addTenantCondition(queryBuilder);
  }

  public getCurrentTenantIdPublic() {
    return this.getCurrentTenantId();
  }
}

describe('TenantRepository', () => {
  let testRepository: TestTenantRepository;
  let mockQueryBuilder: Partial<SelectQueryBuilder<TestEntity>>;
  let getCurrentTenantIdStaticSpy: jest.SpyInstance;

  beforeEach(async () => {
    // 模拟静态方法
    getCurrentTenantIdStaticSpy = jest
      .spyOn(TenantContextService, 'getCurrentTenantIdStatic')
      .mockReturnValue('test-tenant-id');

    mockQueryBuilder = {
      alias: 'test',
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getCount: jest.fn(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
    };

    const mockTypeOrmRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      find: jest.fn(),
      manager: {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
        find: jest.fn(),
      },
      metadata: {
        target: TestEntity,
        name: 'test',
        connection: {
          options: {
            type: 'mysql',
          },
        },
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestTenantRepository,
        {
          provide: getRepositoryToken(TestEntity),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    testRepository = module.get<TestTenantRepository>(TestTenantRepository);

    // 手动设置TestRepository的manager和metadata属性
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
    getCurrentTenantIdStaticSpy.mockRestore();
  });

  describe('getCurrentTenantId', () => {
    it('should get tenant ID from TenantContextService', () => {
      const tenantId = testRepository.getCurrentTenantIdPublic();
      expect(tenantId).toBe('test-tenant-id');
      expect(getCurrentTenantIdStaticSpy).toHaveBeenCalled();
    });
  });

  describe('addTenantCondition', () => {
    it('should add tenant condition to query builder', () => {
      const queryBuilder = mockQueryBuilder as SelectQueryBuilder<TestEntity>;
      const result = testRepository.addTenantConditionPublic(queryBuilder);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'test.tenantId = :tenantId',
        { tenantId: 'test-tenant-id' },
      );
      expect(result).toBe(queryBuilder);
    });
  });

  describe('find', () => {
    it('should add tenant condition when finding entities', async () => {
      const foundEntities = [
        { id: 'id1', name: 'Entity1', tenantId: 'test-tenant-id' },
      ];
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(foundEntities);

      const result = await testRepository.find();

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'test.tenantId = :tenantId',
        { tenantId: 'test-tenant-id' },
      );
      expect(result).toEqual(foundEntities);
    });

    it('should add where condition when options.where is provided', async () => {
      const foundEntities = [
        { id: 'id1', name: 'Entity1', tenantId: 'test-tenant-id' },
      ];
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(foundEntities);

      const result = await testRepository.find({ where: { name: 'Entity1' } });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ name: 'Entity1' });
      expect(result).toEqual(foundEntities);
    });

    it('should add order condition when options.order is provided', async () => {
      const foundEntities = [
        { id: 'id1', name: 'Entity1', tenantId: 'test-tenant-id' },
      ];
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(foundEntities);

      const result = await testRepository.find({
        order: { createdAt: 'DESC' },
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith({
        createdAt: 'DESC',
      });
      expect(result).toEqual(foundEntities);
    });

    it('should add skip and take when options.skip and options.take are provided', async () => {
      const foundEntities = [
        { id: 'id1', name: 'Entity1', tenantId: 'test-tenant-id' },
      ];
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(foundEntities);

      const result = await testRepository.find({ skip: 10, take: 5 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result).toEqual(foundEntities);
    });
  });

  describe('findOne', () => {
    it('should add tenant condition when finding one entity', async () => {
      const entity = { id: 'id1', name: 'Entity1', tenantId: 'test-tenant-id' };
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(entity);

      const result = await testRepository.findOne();

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'test.tenantId = :tenantId',
        { tenantId: 'test-tenant-id' },
      );
      expect(result).toEqual(entity);
    });

    it('should add where condition when options.where is provided', async () => {
      const entity = { id: 'id1', name: 'Entity1', tenantId: 'test-tenant-id' };
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(entity);

      const result = await testRepository.findOne({
        where: { name: 'Entity1' },
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ name: 'Entity1' });
      expect(result).toEqual(entity);
    });
  });

  describe('findByIds', () => {
    it('should add tenant condition and ids condition when finding by ids', async () => {
      const foundEntities = [
        { id: 'id1', name: 'Entity1', tenantId: 'test-tenant-id' },
        { id: 'id2', name: 'Entity2', tenantId: 'test-tenant-id' },
      ];
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(foundEntities);

      const result = await testRepository.findByIds(['id1', 'id2']);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'test.tenantId = :tenantId',
        { tenantId: 'test-tenant-id' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'test.id IN (:...ids)',
        { ids: ['id1', 'id2'] },
      );
      expect(result).toEqual(foundEntities);
    });
  });

  describe('count', () => {
    it('should add tenant condition when counting entities', async () => {
      (mockQueryBuilder.getCount as jest.Mock).mockResolvedValue(5);

      const result = await testRepository.count();

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'test.tenantId = :tenantId',
        { tenantId: 'test-tenant-id' },
      );
      expect(result).toBe(5);
    });

    it('should add where condition when options.where is provided', async () => {
      (mockQueryBuilder.getCount as jest.Mock).mockResolvedValue(2);

      const result = await testRepository.count({ where: { active: true } });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ active: true });
      expect(result).toBe(2);
    });
  });

  describe('findAllTenants', () => {
    it('should skip tenant filtering for admin access', async () => {
      const allEntities = [
        { id: 'id1', name: 'Entity1', tenantId: 'tenant1' },
        { id: 'id2', name: 'Entity2', tenantId: 'tenant2' },
      ];
      // 模拟BaseRepository.prototype.find
      const parentFindSpy = jest
        .spyOn(BaseRepository.prototype, 'find')
        .mockResolvedValue(allEntities);

      const result = await testRepository.findAllTenants();

      expect(parentFindSpy).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(result).toEqual(allEntities);
      parentFindSpy.mockRestore();
    });
  });

  describe('checkTenantAccess', () => {
    it('should return true when entity exists for current tenant', async () => {
      const entity = {
        id: 'entity-id',
        name: 'Entity',
        tenantId: 'test-tenant-id',
      };
      jest
        .spyOn(testRepository, 'findOne')
        .mockResolvedValue(entity as TestEntity);

      const result = await testRepository.checkTenantAccess('entity-id');

      expect(testRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'entity-id' },
      });
      expect(result).toBe(true);
    });

    it('should return false when entity does not exist for current tenant', async () => {
      jest.spyOn(testRepository, 'findOne').mockResolvedValue(null);

      const result = await testRepository.checkTenantAccess('non-existent-id');

      expect(result).toBe(false);
    });

    it('should return false when findOne throws an error', async () => {
      jest
        .spyOn(testRepository, 'findOne')
        .mockRejectedValue(new Error('DB error'));

      const result = await testRepository.checkTenantAccess('123');

      expect(result).toBe(false);
    });
  });

  describe('getTenantStats', () => {
    it('should return tenant statistics', async () => {
      jest.spyOn(testRepository, 'count').mockResolvedValue(10);
      const mockEntity = {
        id: 'id1',
        name: 'Entity1',
        tenantId: 'test-tenant-id',
        updatedAt: new Date('2026-03-27'),
      };
      (mockQueryBuilder.orderBy as jest.Mock).mockReturnThis();
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(mockEntity);

      const result = await testRepository.getTenantStats();

      expect(testRepository.count).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'test.updatedAt',
        'DESC',
      );
      expect(result.totalCount).toBe(10);
      expect(result.lastUpdated).toEqual(new Date('2026-03-27'));
      expect(result.sizeEstimate).toBe(10 * 1024); // 10 * 1024
    });

    it('should return null lastUpdated when no entities exist', async () => {
      jest.spyOn(testRepository, 'count').mockResolvedValue(0);
      (mockQueryBuilder.orderBy as jest.Mock).mockReturnThis();
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);

      const result = await testRepository.getTenantStats();

      expect(result.totalCount).toBe(0);
      expect(result.lastUpdated).toBeNull();
      expect(result.sizeEstimate).toBe(0);
    });
  });
});
