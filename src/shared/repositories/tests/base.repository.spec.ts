import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, DeepPartial, SaveOptions, ObjectLiteral } from 'typeorm';
import { Logger } from '@nestjs/common';
import { BaseRepository } from '../base.repository';

// 测试用的实体类
class TestEntity implements ObjectLiteral {
  id: string;
  name: string;
  tenantId: string;
}

// 具体的测试Repository
class TestRepository extends BaseRepository<TestEntity> {}

describe('BaseRepository', () => {
  let testRepository: TestRepository;
  let mockTypeOrmRepository: Repository<TestEntity>;
  let mockQueryBuilder: Partial<SelectQueryBuilder<TestEntity>>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    mockQueryBuilder = {
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

    mockTypeOrmRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      manager: {
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
        connection: {
          createQueryRunner: jest.fn(() => ({
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: {
              getRepository: jest.fn().mockReturnValue(mockTypeOrmRepository),
            },
          })),
        },
        getRepository: jest.fn().mockReturnValue(mockTypeOrmRepository),
      },
      metadata: {
        target: TestEntity,
        connection: {
          options: {
            type: 'mysql',
          },
        },
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestRepository,
        {
          provide: getRepositoryToken(TestEntity),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    testRepository = module.get<TestRepository>(TestRepository);

    // 关键修复：手动设置TestRepository的manager和metadata属性，使其使用我们的模拟值
    // 由于TypeORM的Repository内部使用这些属性，我们需要确保它们被正确设置
    Object.defineProperty(testRepository, 'manager', {
      get: () => mockTypeOrmRepository.manager,
      configurable: true,
    });
    Object.defineProperty(testRepository, 'metadata', {
      get: () => mockTypeOrmRepository.metadata,
      configurable: true,
    });

    // 替换logger为spy
    loggerSpy = jest.spyOn(testRepository['logger'], 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveMany', () => {
    it('should save multiple entities successfully', async () => {
      const entities: DeepPartial<TestEntity>[] = [
        { name: 'Entity1', tenantId: 'tenant1' },
        { name: 'Entity2', tenantId: 'tenant1' },
      ];
      const savedEntities = [
        { id: 'id1', name: 'Entity1', tenantId: 'tenant1' },
        { id: 'id2', name: 'Entity2', tenantId: 'tenant1' },
      ];
      // 模拟manager.save，因为Repository.save会调用this.manager.save
      (mockTypeOrmRepository.manager.save as jest.Mock).mockResolvedValue(savedEntities);

      const result = await testRepository.saveMany(entities);
      // Repository.save调用this.manager.save，所以我们期望manager.save被调用
      expect(mockTypeOrmRepository.manager.save).toHaveBeenCalledWith(TestEntity, entities, undefined);
      expect(loggerSpy).toHaveBeenCalledWith('Saving 2 entities');
      expect(loggerSpy).toHaveBeenCalledWith('Successfully saved 2 entities');
      expect(result).toEqual(savedEntities);
    });

    it('should wrap database errors', async () => {
      const entities: DeepPartial<TestEntity>[] = [{ name: 'Entity1' }];
      const dbError = new Error('Database error');
      (mockTypeOrmRepository.manager.save as jest.Mock).mockRejectedValue(dbError);
      await expect(testRepository.saveMany(entities)).rejects.toThrow('Database error');
    });
  });

  describe('find', () => {
    it('should find entities with options', async () => {
      const options = { where: { tenantId: 'tenant1' } };
      const foundEntities = [
        { id: 'id1', name: 'Entity1', tenantId: 'tenant1' },
      ];
      (mockTypeOrmRepository.manager.find as jest.Mock).mockResolvedValue(foundEntities);

      const result = await testRepository.find(options);
      expect(mockTypeOrmRepository.manager.find).toHaveBeenCalledWith(TestEntity, options);
      expect(loggerSpy).toHaveBeenCalledWith('Finding entities with options: {"where":{"tenantId":"tenant1"}}');
      expect(loggerSpy).toHaveBeenCalledWith('Found 1 entities');
      expect(result).toEqual(foundEntities);
    });
  });

  describe('findById', () => {
    it('should find entity by id', async () => {
      const entity = { id: 'test-id', name: 'Test Entity', tenantId: 'tenant1' };
      (mockTypeOrmRepository.manager.findOne as jest.Mock).mockResolvedValue(entity);

      const result = await testRepository.findById('test-id');
      expect(mockTypeOrmRepository.manager.findOne).toHaveBeenCalledWith(TestEntity, { where: { id: 'test-id' } });
      expect(loggerSpy).toHaveBeenCalledWith('Finding entity by id: test-id');
      expect(loggerSpy).toHaveBeenCalledWith('Entity found with id: test-id');
      expect(result).toEqual(entity);
    });

    it('should return null when entity not found', async () => {
      (mockTypeOrmRepository.manager.findOne as jest.Mock).mockResolvedValue(null);
      const result = await testRepository.findById('non-existent-id');
      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalledWith('Entity not found with id: non-existent-id');
    });
  });

  describe('findOne', () => {
    it('should find one entity with options', async () => {
      const options = { where: { name: 'Test', tenantId: 'tenant1' } };
      const entity = { id: 'id1', name: 'Test', tenantId: 'tenant1' };
      (mockTypeOrmRepository.manager.findOne as jest.Mock).mockResolvedValue(entity);

      const result = await testRepository.findOne(options);
      expect(mockTypeOrmRepository.manager.findOne).toHaveBeenCalledWith(TestEntity, options);
      expect(result).toEqual(entity);
    });
  });

  describe('deleteById', () => {
    it('should delete entity by id', async () => {
      const deleteResult = { affected: 1, raw: [] };
      (mockTypeOrmRepository.manager.delete as jest.Mock).mockResolvedValue(deleteResult);

      await testRepository.deleteById('test-id');
      expect(mockTypeOrmRepository.manager.delete).toHaveBeenCalledWith(TestEntity, 'test-id');
      expect(loggerSpy).toHaveBeenCalledWith('Delete operation affected 1 rows');
    });
  });

  describe('updateById', () => {
    it('should update entity by id', async () => {
      const updateResult = { affected: 1, raw: [] };
      const partialEntity = { name: 'Updated Name' };
      (mockTypeOrmRepository.manager.update as jest.Mock).mockResolvedValue(updateResult);

      await testRepository.updateById('test-id', partialEntity);
      expect(mockTypeOrmRepository.manager.update).toHaveBeenCalledWith(TestEntity, 'test-id', partialEntity);
      expect(loggerSpy).toHaveBeenCalledWith('Update operation affected 1 rows');
    });
  });

  describe('count', () => {
    it('should count entities with options', async () => {
      const options = { where: { tenantId: 'tenant1' } };
      (mockTypeOrmRepository.manager.count as jest.Mock).mockResolvedValue(5);
      const result = await testRepository.count(options);
      expect(mockTypeOrmRepository.manager.count).toHaveBeenCalledWith(TestEntity, options);
      expect(loggerSpy).toHaveBeenCalledWith('Count result: 5');
      expect(result).toBe(5);
    });
  });

  describe('exists', () => {
    it('should return true when entities exist', async () => {
      const options = { where: { tenantId: 'tenant1' } };
      jest.spyOn(testRepository, 'count').mockResolvedValue(3);
      const result = await testRepository.exists(options);
      expect(testRepository.count).toHaveBeenCalledWith(options);
      expect(result).toBe(true);
    });

    it('should return false when no entities exist', async () => {
      const options = { where: { tenantId: 'tenant2' } };
      jest.spyOn(testRepository, 'count').mockResolvedValue(0);
      const result = await testRepository.exists(options);
      expect(result).toBe(false);
    });
  });

  describe('createQueryBuilder', () => {
    it('should create query builder with alias', () => {
      const alias = 'test';
      (mockTypeOrmRepository.manager.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);
      const result = testRepository.createQueryBuilder(alias);
      expect(mockTypeOrmRepository.manager.createQueryBuilder).toHaveBeenCalledWith(TestEntity, alias, undefined);
      expect(result).toBe(mockQueryBuilder);
    });
  });

  describe('transaction', () => {
    it('should execute transaction successfully', async () => {
      const operation = jest.fn().mockResolvedValue('transaction result');
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          getRepository: jest.fn().mockReturnValue(mockTypeOrmRepository),
        },
      };
      (mockTypeOrmRepository.manager.connection.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);

      const result = await testRepository.transaction(operation);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(operation).toHaveBeenCalledWith(mockTypeOrmRepository);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toBe('transaction result');
    });

    it('should rollback on error', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Transaction failed'));
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          getRepository: jest.fn().mockReturnValue(mockTypeOrmRepository),
        },
      };
      (mockTypeOrmRepository.manager.connection.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);

      await expect(testRepository.transaction(operation)).rejects.toThrow('Transaction failed');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('wrapDatabaseError', () => {
    it('should handle duplicate entry error', () => {
      const error = { code: 'ER_DUP_ENTRY', message: 'Duplicate entry' };
      const wrapped = testRepository['wrapDatabaseError'](error, 'SAVE');
      expect(wrapped.message).toBe('Duplicate entry: Duplicate entry');
    });

    it('should handle foreign key error', () => {
      const error = { code: 'ER_NO_REFERENCED_ROW_2', message: 'Foreign key fails' };
      const wrapped = testRepository['wrapDatabaseError'](error, 'SAVE');
      expect(wrapped.message).toBe('Foreign key constraint fails: Foreign key fails');
    });

    it('should return original error if already Error instance', () => {
      const error = new Error('Some error');
      const wrapped = testRepository['wrapDatabaseError'](error, 'FIND');
      expect(wrapped).toBe(error);
    });

    it('should wrap non-Error object', () => {
      const error = { message: 'Some error' };
      const wrapped = testRepository['wrapDatabaseError'](error, 'FIND');
      expect(wrapped.message).toBe('Database error: Some error');
    });
  });
});