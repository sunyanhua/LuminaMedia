import { Injectable, Logger } from '@nestjs/common';
import { Connection } from 'typeorm';
import { ShardingUtils } from '../repositories/sharding.repository';

/**
 * 分表管理服务
 * 提供分表策略的执行、监控和管理功能
 */
@Injectable()
export class ShardingService {
  private readonly logger = new Logger(ShardingService.name);

  constructor(private readonly connection: Connection) {}

  /**
   * 初始化表分区
   * @param tableNames 表名数组，如果为空则使用默认表列表
   */
  async initializePartitions(tableNames?: string[]): Promise<any[]> {
    const tables = tableNames || [
      'customer_profiles',
      'content_drafts',
      'publish_tasks',
      'marketing_strategies',
      'user_behaviors'
    ];

    const results: any[] = [];
    for (const tableName of tables) {
      try {
        const result = await this.partitionTable(tableName);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to partition table ${tableName}:`, error);
        results.push({
          tableName,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * 为单个表添加分区
   */
  async partitionTable(tableName: string, partitionCount: number = 16): Promise<any> {
    // 检查表是否存在
    const tableExists = await this.checkTableExists(tableName);
    if (!tableExists) {
      return {
        tableName,
        success: false,
        message: `Table ${tableName} does not exist`
      };
    }

    // 检查表是否已分区
    const isPartitioned = await this.isTablePartitioned(tableName);
    if (isPartitioned) {
      return {
        tableName,
        success: true,
        message: `Table ${tableName} is already partitioned`,
        partitionInfo: await this.getPartitionInfo(tableName)
      };
    }

    // 检查表是否有tenant_id字段
    const hasTenantId = await this.checkColumnExists(tableName, 'tenant_id');
    if (!hasTenantId) {
      return {
        tableName,
        success: false,
        message: `Table ${tableName} does not have tenant_id column`
      };
    }

    // 执行分区DDL
    const ddl = ShardingUtils.generatePartitionDDL(tableName, partitionCount);
    try {
      await this.connection.query(ddl);

      const partitionInfo = await this.getPartitionInfo(tableName);
      return {
        tableName,
        success: true,
        message: `Table ${tableName} partitioned successfully`,
        ddl,
        partitionInfo
      };
    } catch (error) {
      throw new Error(`Failed to execute partition DDL for ${tableName}: ${error.message}`);
    }
  }

  /**
   * 获取表的分区信息
   */
  async getPartitionInfo(tableName: string): Promise<any[]> {
    const query = `
      SELECT
        partition_name,
        partition_ordinal_position AS position,
        table_rows,
        ROUND(data_length / 1024 / 1024, 2) AS data_size_mb,
        ROUND(index_length / 1024 / 1024, 2) AS index_size_mb,
        ROUND((data_length + index_length) / 1024 / 1024, 2) AS total_size_mb,
        create_time
      FROM information_schema.partitions
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND partition_name IS NOT NULL
      ORDER BY partition_ordinal_position
    `;
    return this.connection.query(query, [tableName]);
  }

  /**
   * 检查表是否已分区
   */
  async isTablePartitioned(tableName: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as partition_count
      FROM information_schema.partitions
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND partition_name IS NOT NULL
    `;
    const result = await this.connection.query(query, [tableName]);
    return result[0]?.partition_count > 0;
  }

  /**
   * 检查表是否存在
   */
  async checkTableExists(tableName: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?
    `;
    const result = await this.connection.query(query, [tableName]);
    if (!result || !Array.isArray(result) || result.length === 0) return false;
    return result[0]?.table_count > 0;
  }

  /**
   * 检查列是否存在
   */
  async checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as column_count
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?
    `;
    const result = await this.connection.query(query, [tableName, columnName]);
    return result[0]?.column_count > 0;
  }

  /**
   * 获取所有分区表的统计信息
   */
  async getAllPartitionStats(): Promise<any[]> {
    const query = `
      SELECT
        table_name,
        COUNT(partition_name) as partition_count,
        SUM(table_rows) as total_rows,
        ROUND(SUM(data_length) / 1024 / 1024, 2) AS total_data_mb,
        ROUND(SUM(index_length) / 1024 / 1024, 2) AS total_index_mb,
        MIN(table_rows) as min_partition_rows,
        MAX(table_rows) as max_partition_rows,
        ROUND(AVG(table_rows), 2) as avg_partition_rows,
        ROUND((MAX(table_rows) - MIN(table_rows)) / NULLIF(AVG(table_rows), 0) * 100, 2) AS imbalance_percentage
      FROM information_schema.partitions
      WHERE table_schema = DATABASE()
        AND partition_name IS NOT NULL
      GROUP BY table_name
      ORDER BY total_data_mb DESC
    `;
    return this.connection.query(query);
  }

  /**
   * 分析分区平衡性
   */
  async analyzePartitionBalance(tableName: string): Promise<any> {
    const partitionInfo = await this.getPartitionInfo(tableName);
    if (partitionInfo.length === 0) {
      return { tableName, isPartitioned: false };
    }

    const totalRows = partitionInfo.reduce((sum, p) => sum + (p.table_rows || 0), 0);
    const avgRows = totalRows / partitionInfo.length;
    const imbalances = partitionInfo.filter(p => {
      const deviation = Math.abs((p.table_rows || 0) - avgRows);
      return deviation > avgRows * 0.3; // 偏差超过30%
    });

    return {
      tableName,
      isPartitioned: true,
      partitionCount: partitionInfo.length,
      totalRows,
      avgRows: Math.round(avgRows),
      imbalances: imbalances.map(p => ({
        partition: p.partition_name,
        rows: p.table_rows,
        deviation: Math.abs((p.table_rows || 0) - avgRows),
        deviationPercent: avgRows > 0 ? Math.abs(((p.table_rows || 0) - avgRows) / avgRows * 100) : 0
      })),
      isBalanced: imbalances.length === 0,
      recommendation: imbalances.length > 0 ?
        `Consider increasing partition count or using different partition key` :
        'Partition distribution is balanced'
    };
  }

  /**
   * 获取租户数据分布
   */
  async getTenantDistribution(tableName: string, limit: number = 20): Promise<any[]> {
    const query = `
      SELECT
        tenant_id,
        COUNT(*) as record_count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ??), 2) as percentage,
        MOD(CRC32(tenant_id), 16) as partition_number
      FROM ??
      GROUP BY tenant_id
      ORDER BY record_count DESC
      LIMIT ?
    `;
    return this.connection.query(query, [tableName, tableName, limit]);
  }

  /**
   * 生成分表迁移报告
   */
  async generateMigrationReport(tableName: string): Promise<any> {
    const tableExists = await this.checkTableExists(tableName);
    if (!tableExists) {
      return {
        tableName,
        exists: false,
        message: `Table ${tableName} does not exist`
      };
    }

    const isPartitioned = await this.isTablePartitioned(tableName);
    const rowCount = await this.getRowCount(tableName);
    const shouldShard = ShardingUtils.shouldShardTable(rowCount, 1024); // 假设每行1KB

    return {
      tableName,
      exists: true,
      isPartitioned,
      rowCount,
      shouldShard,
      migrationPlan: isPartitioned ? null : ShardingUtils.generateMigrationPlan(tableName),
      estimatedDowntime: this.estimateDowntime(rowCount)
    };
  }

  /**
   * 获取表的行数
   */
  private async getRowCount(tableName: string): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ??`;
    const result = await this.connection.query(query, [tableName]);
    return result[0]?.count || 0;
  }

  /**
   * 预估迁移所需停机时间
   */
  private estimateDowntime(rowCount: number): string {
    // 假设迁移速度：10,000行/秒
    const seconds = rowCount / 10000;
    if (seconds < 60) {
      return `${Math.ceil(seconds)} seconds`;
    } else if (seconds < 3600) {
      return `${Math.ceil(seconds / 60)} minutes`;
    } else {
      return `${Math.ceil(seconds / 3600)} hours`;
    }
  }

  /**
   * 监控分区表性能
   */
  async monitorPartitionPerformance(tableName: string): Promise<any> {
    const query = `
      SELECT
        TABLE_NAME,
        ENGINE,
        TABLE_ROWS,
        AVG_ROW_LENGTH,
        DATA_LENGTH,
        INDEX_LENGTH,
        CREATE_TIME,
        UPDATE_TIME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    `;
    const tableInfo = await this.connection.query(query, [tableName]);

    const partitionQuery = `
      SELECT
        PARTITION_NAME,
        PARTITION_ORDINAL_POSITION,
        TABLE_ROWS,
        AVG_ROW_LENGTH,
        DATA_LENGTH,
        INDEX_LENGTH
      FROM information_schema.PARTITIONS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND PARTITION_NAME IS NOT NULL
      ORDER BY PARTITION_ORDINAL_POSITION
    `;
    const partitions = await this.connection.query(partitionQuery, [tableName]);

    return {
      tableInfo: tableInfo[0] || {},
      partitions,
      analysis: this.analyzePerformance(partitions)
    };
  }

  /**
   * 分析分区性能
   */
  private analyzePerformance(partitions: any[]): any {
    if (partitions.length === 0) return {};

    const totalRows = partitions.reduce((sum, p) => sum + (p.TABLE_ROWS || 0), 0);
    const avgRows = totalRows / partitions.length;
    const maxRows = Math.max(...partitions.map(p => p.TABLE_ROWS || 0));
    const minRows = Math.min(...partitions.map(p => p.TABLE_ROWS || 0));

    const imbalanceRatio = avgRows > 0 ? (maxRows - minRows) / avgRows : 0;

    return {
      totalRows,
      partitionCount: partitions.length,
      avgRowsPerPartition: Math.round(avgRows),
      maxRowsPerPartition: maxRows,
      minRowsPerPartition: minRows,
      imbalanceRatio: imbalanceRatio.toFixed(2),
      recommendation: imbalanceRatio > 0.5 ?
        'Significant partition imbalance detected. Consider re-partitioning.' :
        'Partition distribution is acceptable.'
    };
  }
}