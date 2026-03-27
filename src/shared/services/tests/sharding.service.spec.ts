import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'typeorm';
import { ShardingService } from '../sharding.service';

describe('ShardingService', () => {
  let service: ShardingService;
  let mockConnection: jest.Mocked<Connection>;

  beforeEach(async () => {
    mockConnection = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Connection>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShardingService,
        { provide: Connection, useValue: mockConnection },
      ],
    }).compile();

    service = module.get<ShardingService>(ShardingService);
  });

  describe('initializePartitions', () => {
    it('should initialize partitions for default tables', async () => {
      mockConnection.query.mockResolvedValueOnce([{ table_count: 1 }]); // table exists
      mockConnection.query.mockResolvedValueOnce([{ partition_count: 0 }]); // not partitioned
      mockConnection.query.mockResolvedValueOnce([{ column_count: 1 }]); // has tenant_id
      mockConnection.query.mockResolvedValueOnce({ affectedRows: 1 }); // DDL execution
      mockConnection.query.mockResolvedValueOnce([ // partition info
        { partition_name: 'p0', position: 1, table_rows: 0, data_size_mb: 0, index_size_mb: 0, total_size_mb: 0, create_time: new Date() }
      ]);

      const results = await service.initializePartitions();
      expect(results).toHaveLength(5); // 5 default tables
      expect(results[0].success).toBe(true);
    });
  });

  describe('isTablePartitioned', () => {
    it('should return true when table is partitioned', async () => {
      mockConnection.query.mockResolvedValueOnce([{ partition_count: 3 }]);
      const result = await service.isTablePartitioned('customer_profiles');
      expect(result).toBe(true);
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as partition_count'),
        ['customer_profiles']
      );
    });

    it('should return false when table is not partitioned', async () => {
      mockConnection.query.mockResolvedValueOnce([{ partition_count: 0 }]);
      const result = await service.isTablePartitioned('customer_profiles');
      expect(result).toBe(false);
    });
  });

  describe('getPartitionInfo', () => {
    it('should return partition information', async () => {
      const mockPartitions = [
        { partition_name: 'p0', position: 1, table_rows: 100, data_size_mb: 1.5, index_size_mb: 0.5, total_size_mb: 2.0, create_time: new Date() }
      ];
      mockConnection.query.mockResolvedValueOnce(mockPartitions);
      const result = await service.getPartitionInfo('customer_profiles');
      expect(result).toEqual(mockPartitions);
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('information_schema.partitions'),
        ['customer_profiles']
      );
    });
  });

  describe('analyzePartitionBalance', () => {
    it('should analyze partition balance', async () => {
      const mockPartitions = [
        { partition_name: 'p0', table_rows: 100 },
        { partition_name: 'p1', table_rows: 120 },
        { partition_name: 'p2', table_rows: 80 },
        { partition_name: 'p3', table_rows: 100 },
      ];
      mockConnection.query.mockResolvedValueOnce(mockPartitions);
      const result = await service.analyzePartitionBalance('customer_profiles');
      expect(result.tableName).toBe('customer_profiles');
      expect(result.isPartitioned).toBe(true);
      expect(result.partitionCount).toBe(4);
      expect(result.totalRows).toBe(400);
      expect(result.avgRows).toBe(100);
    });

    it('should detect imbalances', async () => {
      const mockPartitions = [
        { partition_name: 'p0', table_rows: 400 },
        { partition_name: 'p1', table_rows: 400 },
        { partition_name: 'p2', table_rows: 400 },
        { partition_name: 'p3', table_rows: 1000 }, // 偏差超过30%
      ];
      mockConnection.query.mockResolvedValueOnce(mockPartitions);
      const result = await service.analyzePartitionBalance('customer_profiles');
      expect(result.imbalances).toHaveLength(1);
      expect(result.imbalances[0].partition).toBe('p3');
      expect(result.isBalanced).toBe(false);
    });
  });

  describe('getTenantDistribution', () => {
    it('should return tenant distribution', async () => {
      const mockDistribution = [
        { tenant_id: 'tenant1', record_count: 100, percentage: 50.0, partition_number: 5 },
        { tenant_id: 'tenant2', record_count: 100, percentage: 50.0, partition_number: 10 },
      ];
      mockConnection.query.mockResolvedValueOnce(mockDistribution);
      const result = await service.getTenantDistribution('customer_profiles', 20);
      expect(result).toEqual(mockDistribution);
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('tenant_id'),
        ['customer_profiles', 'customer_profiles', 20]
      );
    });
  });

  describe('getAllPartitionStats', () => {
    it('should return all partition statistics', async () => {
      const mockStats = [
        { table_name: 'customer_profiles', partition_count: 16, total_rows: 10000, total_data_mb: 10.5, total_index_mb: 2.5 }
      ];
      mockConnection.query.mockResolvedValueOnce(mockStats);
      const result = await service.getAllPartitionStats();
      expect(result).toEqual(mockStats);
    });
  });

  describe('generateMigrationReport', () => {
    it('should generate migration report for non-partitioned table', async () => {
      mockConnection.query.mockResolvedValueOnce([{ table_count: 1 }]); // table exists
      mockConnection.query.mockResolvedValueOnce([{ partition_count: 0 }]); // not partitioned
      mockConnection.query.mockResolvedValueOnce([{ count: 500000 }]); // row count
      const result = await service.generateMigrationReport('customer_profiles');
      expect(result.exists).toBe(true);
      expect(result.isPartitioned).toBe(false);
      expect(result.rowCount).toBe(500000);
      expect(result.shouldShard).toBeDefined();
      expect(result.migrationPlan).toBeDefined();
    });

    it('should generate migration report for partitioned table', async () => {
      mockConnection.query.mockResolvedValueOnce([{ table_count: 1 }]); // table exists
      mockConnection.query.mockResolvedValueOnce([{ partition_count: 16 }]); // partitioned
      mockConnection.query.mockResolvedValueOnce([{ count: 500000 }]); // row count
      const result = await service.generateMigrationReport('customer_profiles');
      expect(result.exists).toBe(true);
      expect(result.isPartitioned).toBe(true);
      expect(result.migrationPlan).toBe(null);
    });
  });
});