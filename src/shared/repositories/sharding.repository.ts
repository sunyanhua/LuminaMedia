import { SelectQueryBuilder, Connection } from 'typeorm';
import { TenantEntity } from '../interfaces/tenant-entity.interface';
import { TenantRepository } from './tenant.repository';

/**
 * 分表（分区）管理Repository基类
 * 提供分表策略相关的工具方法和查询优化
 * 继承TenantRepository，具有多租户支持
 */
export abstract class ShardingRepository<T extends TenantEntity> extends TenantRepository<T> {
  /**
   * 默认分区数量
   */
  protected readonly PARTITION_COUNT = 16;

  /**
   * 计算租户ID对应的分区号
   * @param tenantId 租户ID
   * @returns 分区号 (0 到 PARTITION_COUNT-1)
   */
  protected calculatePartitionNumber(tenantId: string): number {
    // 使用CRC32哈希算法，与MySQL分区算法保持一致
    const hash = this.crc32(tenantId);
    return Math.abs(hash) % this.PARTITION_COUNT;
  }

  /**
   * CRC32哈希函数（JavaScript实现）
   * 与MySQL的CRC32函数结果保持一致
   */
  private crc32(str: string): number {
    let crc = 0 ^ (-1);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      crc = (crc >>> 8) ^ this.crc32Table[(crc ^ char) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  /**
   * CRC32查找表
   */
  private readonly crc32Table = (() => {
    const table = new Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    return table;
  })();

  /**
   * 获取表的分区信息（需要数据库连接）
   */
  async getPartitionInfo(connection: Connection, tableName: string): Promise<any[]> {
    const query = `
      SELECT
        partition_name,
        partition_ordinal_position AS position,
        table_rows,
        data_length,
        index_length,
        create_time
      FROM information_schema.partitions
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND partition_name IS NOT NULL
      ORDER BY partition_ordinal_position
    `;
    return connection.query(query, [tableName]);
  }

  /**
   * 检查表是否已分区
   */
  async isTablePartitioned(connection: Connection, tableName: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as partition_count
      FROM information_schema.partitions
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND partition_name IS NOT NULL
    `;
    const result = await connection.query(query, [tableName]);
    return result[0]?.partition_count > 0;
  }

  /**
   * 获取租户数据分布统计
   */
  async getTenantDistribution(connection: Connection, tableName: string): Promise<any[]> {
    const query = `
      SELECT
        tenant_id,
        COUNT(*) as record_count,
        MOD(CRC32(tenant_id), ?) as partition_number
      FROM ??
      GROUP BY tenant_id
      ORDER BY record_count DESC
      LIMIT 50
    `;
    return connection.query(query, [this.PARTITION_COUNT, tableName]);
  }

  /**
   * 分表查询优化：添加分区提示
   * 注意：MySQL分区查询优化器通常会自动选择正确分区，此方法用于特殊情况
   */
  protected addPartitionHint(
    queryBuilder: SelectQueryBuilder<T>,
    tenantId?: string
  ): SelectQueryBuilder<T> {
    // 如果提供了tenantId，可以添加分区提示注释
    if (tenantId) {
      const partitionNumber = this.calculatePartitionNumber(tenantId);
      // 添加MySQL提示注释（可选）
      // queryBuilder.comment(`PARTITION_HINT: p${partitionNumber}`);
    }
    return queryBuilder;
  }

  /**
   * 创建分表查询构建器（带分区优化）
   */
  createShardingQueryBuilder(alias?: string, tenantId?: string): SelectQueryBuilder<T> {
    const queryBuilder = this.createQueryBuilder(alias);
    return this.addPartitionHint(queryBuilder, tenantId);
  }

  /**
   * 获取分区表的大小统计
   */
  async getPartitionSizes(connection: Connection): Promise<any[]> {
    const query = `
      SELECT
        table_name,
        SUM(data_length) as total_data_size,
        SUM(index_length) as total_index_size,
        SUM(table_rows) as total_rows,
        COUNT(partition_name) as partition_count
      FROM information_schema.partitions
      WHERE table_schema = DATABASE()
        AND partition_name IS NOT NULL
        AND table_name IN ('customer_profiles', 'content_drafts', 'publish_tasks', 'marketing_strategies', 'user_behaviors')
      GROUP BY table_name
      ORDER BY total_data_size DESC
    `;
    return connection.query(query);
  }

  /**
   * 预估数据增长和分区平衡建议
   */
  async getPartitionBalanceAdvice(connection: Connection, tableName: string): Promise<any> {
    const distribution = await this.getTenantDistribution(connection, tableName);
    const partitionCounts = new Array(this.PARTITION_COUNT).fill(0);
    let totalRecords = 0;
    let maxRecordsPerTenant = 0;
    let maxRecordsTenantId = '';

    distribution.forEach(item => {
      const partition = item.partition_number;
      const count = item.record_count;
      partitionCounts[partition] = (partitionCounts[partition] || 0) + count;
      totalRecords += count;
      if (count > maxRecordsPerTenant) {
        maxRecordsPerTenant = count;
        maxRecordsTenantId = item.tenant_id;
      }
    });

    const avgPerPartition = totalRecords / this.PARTITION_COUNT;
    const imbalances = partitionCounts.map((count, index) => ({
      partition: index,
      count,
      deviation: Math.abs(count - avgPerPartition),
      percentage: avgPerPartition > 0 ? (count / avgPerPartition) * 100 : 0
    })).filter(item => item.deviation > avgPerPartition * 0.3); // 偏差超过30%

    return {
      tableName,
      totalRecords,
      avgPerPartition,
      partitionCounts,
      imbalances,
      suggestions: imbalances.length > 0 ?
        `Consider rebalancing partitions or increasing PARTITION_COUNT to ${this.PARTITION_COUNT * 2}` :
        'Partition distribution is balanced',
      largestTenant: {
        tenantId: maxRecordsTenantId,
        recordCount: maxRecordsPerTenant,
        partition: this.calculatePartitionNumber(maxRecordsTenantId)
      }
    };
  }
}

/**
 * 分表工具函数（独立于Repository）
 */
export class ShardingUtils {
  /**
   * 计算表是否需要分表（基于预估数据量）
   */
  static shouldShardTable(
    estimatedRowCount: number,
    rowSizeBytes: number = 1024
  ): { shouldShard: boolean; reason: string } {
    const estimatedSizeMB = (estimatedRowCount * rowSizeBytes) / (1024 * 1024);

    // 分表决策规则
    if (estimatedRowCount > 1000000) {
      return {
        shouldShard: true,
        reason: `Estimated ${estimatedRowCount.toLocaleString()} rows (${estimatedSizeMB.toFixed(2)} MB) exceeds 1M threshold`
      };
    } else if (estimatedSizeMB > 1024) {
      return {
        shouldShard: true,
        reason: `Estimated size ${estimatedSizeMB.toFixed(2)} MB exceeds 1GB threshold`
      };
    } else {
      return {
        shouldShard: false,
        reason: `Estimated ${estimatedRowCount.toLocaleString()} rows (${estimatedSizeMB.toFixed(2)} MB) below thresholds`
      };
    }
  }

  /**
   * 生成分表DDL语句
   */
  static generatePartitionDDL(
    tableName: string,
    partitionCount: number = 16
  ): string {
    return `ALTER TABLE ${tableName}
PARTITION BY HASH(MOD(CRC32(tenant_id), ${partitionCount}))
PARTITIONS ${partitionCount};`;
  }

  /**
   * 生成分表迁移计划
   */
  static generateMigrationPlan(
    sourceTable: string,
    partitionCount: number = 16
  ): string[] {
    const steps = [
      `-- Step 1: 创建备份表`,
      `CREATE TABLE ${sourceTable}_backup LIKE ${sourceTable};`,
      `INSERT INTO ${sourceTable}_backup SELECT * FROM ${sourceTable};`,
      ``,
      `-- Step 2: 创建分区表`,
      `CREATE TABLE ${sourceTable}_partitioned LIKE ${sourceTable};`,
      `ALTER TABLE ${sourceTable}_partitioned ${this.generatePartitionDDL(sourceTable + '_partitioned', partitionCount).replace('ALTER TABLE', '')}`,
      ``,
      `-- Step 3: 迁移数据（分批进行）`,
      `INSERT INTO ${sourceTable}_partitioned SELECT * FROM ${sourceTable}_backup;`,
      ``,
      `-- Step 4: 重命名表（需要短暂停机）`,
      `RENAME TABLE ${sourceTable} TO ${sourceTable}_old, ${sourceTable}_partitioned TO ${sourceTable};`,
      ``,
      `-- Step 5: 验证数据完整性`,
      `SELECT COUNT(*) as old_count FROM ${sourceTable}_old;`,
      `SELECT COUNT(*) as new_count FROM ${sourceTable};`,
      ``,
      `-- Step 6: 清理备份（验证后执行）`,
      `-- DROP TABLE ${sourceTable}_old;`,
      `-- DROP TABLE ${sourceTable}_backup;`
    ];
    return steps;
  }
}