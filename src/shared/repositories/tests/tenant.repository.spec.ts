import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder, Repository, ObjectLiteral } from 'typeorm';
import { TenantRepository } from '../tenant.repository';
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
  public addTenantConditionPublic(queryBuilder: SelectQueryBuilder<TestEntity>) {
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
    getCurrentTenantIdStaticSpy = jest.spyOn(TenantContextService, 'getCurrentTenantIdStatic')
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
        { tenantId: 'test-tenant-id' }
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
        { tenantId: 'test-tenant-id' }
      );
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
        { tenantId: 'test-tenant-id' }
      );
      expect(result).toEqual(entity);
    });
  });

  describe('findAllTenants', () => {
    it('should skip tenant filtering for admin access', async () => {
      const allEntities = [
        { id: 'id1', name: 'Entity1', tenantId: 'tenant1' },
        { id: 'id2', name: 'Entity2', tenantId: 'tenant2' },
      ];
      // 模拟父类的find方法
      const parentFindSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(testRepository)), 'find')
        .mockResolvedValue(allEntities);

      const result = await testRepository.findAllTenants();

      expect(parentFindSpy).toHaveBeenCalledWith(undefined);
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(result).toEqual(allEntities);
    });
  });

  describe('checkTenantAccess', () => {
    it('should return true when entity exists for current tenant', async () => {
      const entity = { id: 'entity-id', name: 'Entity', tenantId: 'test-tenant-id' };
      jest.spyOn(testRepository, 'findOne').mockResolvedValue(entity as TestEntity);

      const result = await testRepository.checkTenantAccess('entity-id');

      expect(testRepository.findOne).toHaveBeenCalledWith({ where: { id: 'entity-id' } });
      expect(result).toBe(true);
    });

    it('should return false when entity does not exist for current tenant', async () => {
      jest.spyOn(testRepository, 'findOne').mockResolvedValue(null);

      const result = await testRepository.checkTenantAccess('non-existent-id');

      expect(result).toBe(false);
    });
  });
});