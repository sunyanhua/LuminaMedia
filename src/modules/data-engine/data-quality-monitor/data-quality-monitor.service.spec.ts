import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataQualityMonitorService } from './data-quality-monitor.service';
import { DataQualityRule } from './entities/data-quality-rule.entity';
import { DataQualityResult } from './entities/data-quality-result.entity';
import {
  CreateDataQualityRuleDto,
  RuleSeverity,
} from './dto/create-data-quality-rule.dto';
import { DataSource } from 'typeorm';

describe('DataQualityMonitorService', () => {
  let service: DataQualityMonitorService;
  let ruleRepository: Repository<DataQualityRule>;
  let resultRepository: Repository<DataQualityResult>;
  let dataSource: DataSource;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataQualityMonitorService,
        {
          provide: getRepositoryToken(DataQualityRule),
          useValue: mockRuleRepository,
        },
        {
          provide: getRepositoryToken(DataQualityResult),
          useValue: mockResultRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DataQualityMonitorService>(DataQualityMonitorService);
    ruleRepository = module.get<Repository<DataQualityRule>>(
      getRepositoryToken(DataQualityRule),
    );
    resultRepository = module.get<Repository<DataQualityResult>>(
      getRepositoryToken(DataQualityResult),
    );
    dataSource = module.get<DataSource>(DataSource);

    // 重置模拟函数
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRule', () => {
    it('should create a new data quality rule', async () => {
      const createDto: CreateDataQualityRuleDto = {
        name: 'Test Rule',
        tableName: 'test_table',
        fieldName: 'test_field',
        condition: 'test_field IS NOT NULL',
        threshold: 0.95,
        severity: RuleSeverity.WARNING,
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
        severity: RuleSeverity.WARNING,
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
        severity: RuleSeverity.WARNING,
        passed: true,
        executionTime: new Date(),
        details: {},
      };

      mockDataSource.query.mockResolvedValue(mockQueryResult);
      mockResultRepository.create.mockReturnValue(mockResult);
      mockResultRepository.save.mockResolvedValue(mockResult);

      const result = await service.executeRule(mockRule as DataQualityRule);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        `SELECT COUNT(*) as total_count,
                SUM(CASE WHEN ${mockRule.condition} THEN 1 ELSE 0 END) as valid_count
         FROM ${mockRule.tableName}`,
      );
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
        severity: RuleSeverity.ERROR,
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
        severity: RuleSeverity.ERROR,
        passed: false,
        executionTime: new Date(),
        details: {},
      };

      mockDataSource.query.mockResolvedValue(mockQueryResult);
      mockResultRepository.create.mockReturnValue(mockResult);
      mockResultRepository.save.mockResolvedValue(mockResult);

      const sendAlertSpy = jest
        .spyOn(service as any, 'sendAlert')
        .mockResolvedValue(undefined);

      const result = await service.executeRule(mockRule as DataQualityRule);

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
        .mockResolvedValueOnce(mockResults[0] as DataQualityResult)
        .mockResolvedValueOnce(mockResults[1] as DataQualityResult);

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
