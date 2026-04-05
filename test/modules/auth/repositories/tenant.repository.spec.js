"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const tenant_repository_1 = require("../../../../src/shared/repositories/tenant.repository");
const base_repository_1 = require("../../../../src/shared/repositories/base.repository");
const tenant_context_service_1 = require("../../../../src/shared/services/tenant-context.service");
class TestTenantEntity {
    id;
    name;
    tenantId;
    updatedAt;
}
class TestTenantRepository extends tenant_repository_1.TenantRepository {
}
describe('TenantRepository', () => {
    let testRepository;
    let mockTypeOrmRepository;
    let mockQueryBuilder;
    let getCurrentTenantIdSpy;
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
        };
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
        };
        getCurrentTenantIdSpy = jest.spyOn(tenant_context_service_1.TenantContextService, 'getCurrentTenantIdStatic');
        const module = await testing_1.Test.createTestingModule({
            providers: [
                TestTenantRepository,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(TestTenantEntity),
                    useValue: mockTypeOrmRepository,
                },
            ],
        }).compile();
        testRepository = module.get(TestTenantRepository);
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
            const queryBuilder = mockQueryBuilder;
            testRepository['addTenantCondition'](queryBuilder);
            expect(queryBuilder.andWhere).toHaveBeenCalledWith('testEntity.tenantId = :tenantId', { tenantId });
            expect(getCurrentTenantIdSpy).toHaveBeenCalled();
        });
    });
    describe('find', () => {
        it('should add tenant condition when calling find', async () => {
            const tenantId = 'tenant-1';
            const entities = [{ id: '1', name: 'Test', tenantId }];
            getCurrentTenantIdSpy.mockReturnValue(tenantId);
            mockQueryBuilder.getMany.mockResolvedValue(entities);
            const result = await testRepository.find();
            expect(mockTypeOrmRepository.manager.createQueryBuilder).toHaveBeenCalledWith(TestTenantEntity, 'TestTenantEntity', undefined);
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('testEntity.tenantId = :tenantId', { tenantId });
            expect(mockQueryBuilder.getMany).toHaveBeenCalled();
            expect(result).toEqual(entities);
        });
        it('should apply additional where conditions', async () => {
            const tenantId = 'tenant-1';
            const whereCondition = { name: 'Test' };
            getCurrentTenantIdSpy.mockReturnValue(tenantId);
            mockQueryBuilder.getMany.mockResolvedValue([]);
            await testRepository.find({ where: whereCondition });
            expect(mockQueryBuilder.where).toHaveBeenCalledWith(whereCondition);
        });
    });
    describe('findOne', () => {
        it('should add tenant condition when calling findOne', async () => {
            const tenantId = 'tenant-1';
            const entity = { id: '1', name: 'Test', tenantId };
            getCurrentTenantIdSpy.mockReturnValue(tenantId);
            mockQueryBuilder.getOne.mockResolvedValue(entity);
            const result = await testRepository.findOne();
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('testEntity.tenantId = :tenantId', { tenantId });
            expect(result).toEqual(entity);
        });
    });
    describe('findByIds', () => {
        it('should add tenant condition and id filter', async () => {
            const tenantId = 'tenant-1';
            const ids = ['1', '2'];
            const entities = [{ id: '1', name: 'Test', tenantId }];
            getCurrentTenantIdSpy.mockReturnValue(tenantId);
            mockQueryBuilder.getMany.mockResolvedValue(entities);
            const result = await testRepository.findByIds(ids);
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('testEntity.tenantId = :tenantId', { tenantId });
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('testEntity.id IN (:...ids)', { ids });
            expect(result).toEqual(entities);
        });
    });
    describe('count', () => {
        it('should add tenant condition when calling count', async () => {
            const tenantId = 'tenant-1';
            const count = 5;
            getCurrentTenantIdSpy.mockReturnValue(tenantId);
            mockQueryBuilder.getCount.mockResolvedValue(count);
            const result = await testRepository.count();
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('testEntity.tenantId = :tenantId', { tenantId });
            expect(result).toBe(count);
        });
    });
    describe('createQueryBuilder', () => {
        it('should return query builder with tenant condition', () => {
            const tenantId = 'tenant-1';
            getCurrentTenantIdSpy.mockReturnValue(tenantId);
            const queryBuilder = testRepository.createQueryBuilder('alias');
            expect(mockTypeOrmRepository.manager.createQueryBuilder).toHaveBeenCalledWith(TestTenantEntity, 'alias', undefined);
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('testEntity.tenantId = :tenantId', { tenantId });
            expect(queryBuilder).toBe(mockQueryBuilder);
        });
    });
    describe('findAllTenants', () => {
        it('should call parent find method without tenant filtering', async () => {
            const entities = [
                { id: '1', name: 'Test1', tenantId: 'tenant-1' },
                { id: '2', name: 'Test2', tenantId: 'tenant-2' },
            ];
            const baseFindSpy = jest
                .spyOn(base_repository_1.BaseRepository.prototype, 'find')
                .mockResolvedValue(entities);
            const result = await testRepository.findAllTenants();
            expect(baseFindSpy).toHaveBeenCalled();
            expect(result).toEqual(entities);
            expect(getCurrentTenantIdSpy).not.toHaveBeenCalled();
            baseFindSpy.mockRestore();
        });
    });
    describe('checkTenantAccess', () => {
        it('should return true when entity exists for current tenant', async () => {
            const tenantId = 'tenant-1';
            const entityId = '123';
            const entity = { id: entityId, name: 'Test', tenantId };
            getCurrentTenantIdSpy.mockReturnValue(tenantId);
            jest.spyOn(testRepository, 'findOne').mockResolvedValue(entity);
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
            });
            const result = await testRepository.getTenantStats();
            expect(result.totalCount).toBe(count);
            expect(result.lastUpdated).toEqual(latestEntity.updatedAt);
            expect(result.sizeEstimate).toBe(count * 1024);
        });
        it('should handle null latest entity', async () => {
            const tenantId = 'tenant-1';
            const count = 0;
            getCurrentTenantIdSpy.mockReturnValue(tenantId);
            jest.spyOn(testRepository, 'count').mockResolvedValue(count);
            jest.spyOn(testRepository, 'createQueryBuilder').mockReturnValue({
                orderBy: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            });
            const result = await testRepository.getTenantStats();
            expect(result.totalCount).toBe(0);
            expect(result.lastUpdated).toBeNull();
            expect(result.sizeEstimate).toBe(0);
        });
    });
});
//# sourceMappingURL=tenant.repository.spec.js.map