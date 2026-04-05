"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const base_repository_1 = require("../base.repository");
class TestEntity {
    id;
    name;
    tenantId;
}
class TestRepository extends base_repository_1.BaseRepository {
}
describe('BaseRepository', () => {
    let testRepository;
    let mockTypeOrmRepository;
    let mockQueryBuilder;
    let loggerSpy;
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
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                TestRepository,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(TestEntity),
                    useValue: mockTypeOrmRepository,
                },
            ],
        }).compile();
        testRepository = module.get(TestRepository);
        Object.defineProperty(testRepository, 'manager', {
            get: () => mockTypeOrmRepository.manager,
            configurable: true,
        });
        Object.defineProperty(testRepository, 'metadata', {
            get: () => mockTypeOrmRepository.metadata,
            configurable: true,
        });
        loggerSpy = jest
            .spyOn(testRepository['logger'], 'debug')
            .mockImplementation(() => { });
        jest.spyOn(testRepository['logger'], 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('saveMany', () => {
        it('should save multiple entities successfully', async () => {
            const entities = [
                { name: 'Entity1', tenantId: 'tenant1' },
                { name: 'Entity2', tenantId: 'tenant1' },
            ];
            const savedEntities = [
                { id: 'id1', name: 'Entity1', tenantId: 'tenant1' },
                { id: 'id2', name: 'Entity2', tenantId: 'tenant1' },
            ];
            mockTypeOrmRepository.manager.save.mockResolvedValue(savedEntities);
            const result = await testRepository.saveMany(entities);
            expect(mockTypeOrmRepository.manager.save).toHaveBeenCalledWith(TestEntity, entities, undefined);
            expect(loggerSpy).toHaveBeenCalledWith('Saving 2 entities');
            expect(loggerSpy).toHaveBeenCalledWith('Successfully saved 2 entities');
            expect(result).toEqual(savedEntities);
        });
        it('should wrap database errors', async () => {
            const entities = [{ name: 'Entity1' }];
            const dbError = new Error('Database error');
            mockTypeOrmRepository.manager.save.mockRejectedValue(dbError);
            await expect(testRepository.saveMany(entities)).rejects.toThrow('Database error');
        });
    });
    describe('find', () => {
        it('should find entities with options', async () => {
            const options = { where: { tenantId: 'tenant1' } };
            const foundEntities = [
                { id: 'id1', name: 'Entity1', tenantId: 'tenant1' },
            ];
            mockTypeOrmRepository.manager.find.mockResolvedValue(foundEntities);
            const result = await testRepository.find(options);
            expect(mockTypeOrmRepository.manager.find).toHaveBeenCalledWith(TestEntity, options);
            expect(loggerSpy).toHaveBeenCalledWith('Finding entities with options: {"where":{"tenantId":"tenant1"}}');
            expect(loggerSpy).toHaveBeenCalledWith('Found 1 entities');
            expect(result).toEqual(foundEntities);
        });
    });
    describe('findById', () => {
        it('should find entity by id', async () => {
            const entity = {
                id: 'test-id',
                name: 'Test Entity',
                tenantId: 'tenant1',
            };
            mockTypeOrmRepository.manager.findOne.mockResolvedValue(entity);
            const result = await testRepository.findById('test-id');
            expect(mockTypeOrmRepository.manager.findOne).toHaveBeenCalledWith(TestEntity, { where: { id: 'test-id' } });
            expect(loggerSpy).toHaveBeenCalledWith('Finding entity by id: test-id');
            expect(loggerSpy).toHaveBeenCalledWith('Entity found with id: test-id');
            expect(result).toEqual(entity);
        });
        it('should return null when entity not found', async () => {
            mockTypeOrmRepository.manager.findOne.mockResolvedValue(null);
            const result = await testRepository.findById('non-existent-id');
            expect(result).toBeNull();
            expect(loggerSpy).toHaveBeenCalledWith('Entity not found with id: non-existent-id');
        });
    });
    describe('findOne', () => {
        it('should find one entity with options', async () => {
            const options = { where: { name: 'Test', tenantId: 'tenant1' } };
            const entity = { id: 'id1', name: 'Test', tenantId: 'tenant1' };
            mockTypeOrmRepository.manager.findOne.mockResolvedValue(entity);
            const result = await testRepository.findOne(options);
            expect(mockTypeOrmRepository.manager.findOne).toHaveBeenCalledWith(TestEntity, options);
            expect(result).toEqual(entity);
        });
    });
    describe('deleteById', () => {
        it('should delete entity by id', async () => {
            const deleteResult = { affected: 1, raw: [] };
            mockTypeOrmRepository.manager.delete.mockResolvedValue(deleteResult);
            await testRepository.deleteById('test-id');
            expect(mockTypeOrmRepository.manager.delete).toHaveBeenCalledWith(TestEntity, 'test-id');
            expect(loggerSpy).toHaveBeenCalledWith('Delete operation affected 1 rows');
        });
    });
    describe('updateById', () => {
        it('should update entity by id', async () => {
            const updateResult = { affected: 1, raw: [] };
            const partialEntity = { name: 'Updated Name' };
            mockTypeOrmRepository.manager.update.mockResolvedValue(updateResult);
            await testRepository.updateById('test-id', partialEntity);
            expect(mockTypeOrmRepository.manager.update).toHaveBeenCalledWith(TestEntity, 'test-id', partialEntity);
            expect(loggerSpy).toHaveBeenCalledWith('Update operation affected 1 rows');
        });
    });
    describe('count', () => {
        it('should count entities with options', async () => {
            const options = { where: { tenantId: 'tenant1' } };
            mockTypeOrmRepository.manager.count.mockResolvedValue(5);
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
            mockTypeOrmRepository.manager.createQueryBuilder.mockReturnValue(mockQueryBuilder);
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
            mockTypeOrmRepository.manager.connection.createQueryRunner.mockReturnValue(mockQueryRunner);
            const result = await testRepository.transaction(operation);
            expect(mockQueryRunner.connect).toHaveBeenCalled();
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(operation).toHaveBeenCalledWith(mockTypeOrmRepository);
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
            expect(result).toBe('transaction result');
        });
        it('should rollback on error', async () => {
            const operation = jest
                .fn()
                .mockRejectedValue(new Error('Transaction failed'));
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
            mockTypeOrmRepository.manager.connection.createQueryRunner.mockReturnValue(mockQueryRunner);
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
            const error = {
                code: 'ER_NO_REFERENCED_ROW_2',
                message: 'Foreign key fails',
            };
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
//# sourceMappingURL=base.repository.spec.js.map