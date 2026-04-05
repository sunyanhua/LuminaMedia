"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const data_quality_monitor_service_1 = require("./data-quality-monitor.service");
const data_quality_rule_entity_1 = require("./entities/data-quality-rule.entity");
const data_quality_result_entity_1 = require("./entities/data-quality-result.entity");
const create_data_quality_rule_dto_1 = require("./dto/create-data-quality-rule.dto");
const typeorm_2 = require("typeorm");
describe('DataQualityMonitorService', () => {
    let service;
    let ruleRepository;
    let resultRepository;
    let dataSource;
    const mockRuleRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
    const mockResultRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        createQueryBuilder: jest.fn(),
    };
    const mockDataSource = {
        query: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                data_quality_monitor_service_1.DataQualityMonitorService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(data_quality_rule_entity_1.DataQualityRule),
                    useValue: mockRuleRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(data_quality_result_entity_1.DataQualityResult),
                    useValue: mockResultRepository,
                },
                {
                    provide: typeorm_2.DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();
        service = module.get(data_quality_monitor_service_1.DataQualityMonitorService);
        ruleRepository = module.get((0, typeorm_1.getRepositoryToken)(data_quality_rule_entity_1.DataQualityRule));
        resultRepository = module.get((0, typeorm_1.getRepositoryToken)(data_quality_result_entity_1.DataQualityResult));
        dataSource = module.get(typeorm_2.DataSource);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('createRule', () => {
        it('should create a new data quality rule', async () => {
            const createDto = {
                name: 'Test Rule',
                tableName: 'test_table',
                fieldName: 'test_field',
                condition: 'test_field IS NOT NULL',
                threshold: 0.95,
                severity: create_data_quality_rule_dto_1.RuleSeverity.WARNING,
                description: 'Test rule description',
                isActive: true,
            };
            const mockRule = {
                id: 'test-id',
                ...createDto,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockRuleRepository.create.mockReturnValue(mockRule);
            mockRuleRepository.save.mockResolvedValue(mockRule);
            const result = await service.createRule(createDto);
            expect(mockRuleRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockRuleRepository.save).toHaveBeenCalledWith(mockRule);
            expect(result).toEqual(mockRule);
        });
    });
    describe('getRules', () => {
        it('should return active rules', async () => {
            const mockRules = [
                {
                    id: 'rule-1',
                    name: 'Rule 1',
                    tableName: 'table1',
                    isActive: true,
                },
                {
                    id: 'rule-2',
                    name: 'Rule 2',
                    tableName: 'table2',
                    isActive: true,
                },
            ];
            mockRuleRepository.find.mockResolvedValue(mockRules);
            const result = await service.getRules();
            expect(mockRuleRepository.find).toHaveBeenCalledWith({
                where: { isActive: true },
            });
            expect(result).toEqual(mockRules);
        });
    });
    describe('executeRule', () => {
        it('should execute rule and return result when rule passes', async () => {
            const mockRule = {
                id: 'rule-1',
                name: 'Test Rule',
                tableName: 'test_table',
                fieldName: 'test_field',
                condition: 'test_field IS NOT NULL',
                threshold: 0.9,
                severity: create_data_quality_rule_dto_1.RuleSeverity.WARNING,
            };
            const mockQueryResult = [
                {
                    total_count: '100',
                    valid_count: '95',
                },
            ];
            const mockResult = {
                id: 'result-1',
                ruleId: 'rule-1',
                ruleName: 'Test Rule',
                tableName: 'test_table',
                fieldName: 'test_field',
                metricValue: 0.95,
                threshold: 0.9,
                severity: create_data_quality_rule_dto_1.RuleSeverity.WARNING,
                passed: true,
                executionTime: new Date(),
                details: {},
            };
            mockDataSource.query.mockResolvedValue(mockQueryResult);
            mockResultRepository.create.mockReturnValue(mockResult);
            mockResultRepository.save.mockResolvedValue(mockResult);
            const result = await service.executeRule(mockRule);
            expect(mockDataSource.query).toHaveBeenCalledWith(`SELECT COUNT(*) as total_count,
                SUM(CASE WHEN ${mockRule.condition} THEN 1 ELSE 0 END) as valid_count
         FROM ${mockRule.tableName}`);
            expect(mockResultRepository.create).toHaveBeenCalled();
            expect(mockResultRepository.save).toHaveBeenCalled();
            expect(result).toEqual(mockResult);
        });
        it('should execute rule and send alert when rule fails', async () => {
            const mockRule = {
                id: 'rule-1',
                name: 'Test Rule',
                tableName: 'test_table',
                fieldName: 'test_field',
                condition: 'test_field IS NOT NULL',
                threshold: 0.9,
                severity: create_data_quality_rule_dto_1.RuleSeverity.ERROR,
            };
            const mockQueryResult = [
                {
                    total_count: '100',
                    valid_count: '80',
                },
            ];
            const mockResult = {
                id: 'result-1',
                ruleId: 'rule-1',
                ruleName: 'Test Rule',
                tableName: 'test_table',
                fieldName: 'test_field',
                metricValue: 0.8,
                threshold: 0.9,
                severity: create_data_quality_rule_dto_1.RuleSeverity.ERROR,
                passed: false,
                executionTime: new Date(),
                details: {},
            };
            mockDataSource.query.mockResolvedValue(mockQueryResult);
            mockResultRepository.create.mockReturnValue(mockResult);
            mockResultRepository.save.mockResolvedValue(mockResult);
            const sendAlertSpy = jest
                .spyOn(service, 'sendAlert')
                .mockResolvedValue(undefined);
            const result = await service.executeRule(mockRule);
            expect(sendAlertSpy).toHaveBeenCalled();
            expect(result).toEqual(mockResult);
        });
    });
    describe('executeAllRules', () => {
        it('should execute all active rules', async () => {
            const mockRules = [
                {
                    id: 'rule-1',
                    name: 'Rule 1',
                    tableName: 'table1',
                    isActive: true,
                },
                {
                    id: 'rule-2',
                    name: 'Rule 2',
                    tableName: 'table2',
                    isActive: true,
                },
            ];
            const mockResults = [
                { id: 'result-1', ruleId: 'rule-1' },
                { id: 'result-2', ruleId: 'rule-2' },
            ];
            mockRuleRepository.find.mockResolvedValue(mockRules);
            const executeRuleSpy = jest
                .spyOn(service, 'executeRule')
                .mockResolvedValueOnce(mockResults[0])
                .mockResolvedValueOnce(mockResults[1]);
            const result = await service.executeAllRules();
            expect(mockRuleRepository.find).toHaveBeenCalledWith({
                where: { isActive: true },
            });
            expect(executeRuleSpy).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockResults);
        });
        it('should handle errors when executing rules', async () => {
            const mockRules = [
                {
                    id: 'rule-1',
                    name: 'Rule 1',
                    tableName: 'table1',
                    isActive: true,
                },
            ];
            mockRuleRepository.find.mockResolvedValue(mockRules);
            const executeRuleSpy = jest
                .spyOn(service, 'executeRule')
                .mockRejectedValue(new Error('Execution failed'));
            const result = await service.executeAllRules();
            expect(executeRuleSpy).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });
});
//# sourceMappingURL=data-quality-monitor.service.spec.js.map