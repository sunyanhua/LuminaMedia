"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShardingUtils = exports.ShardingRepository = void 0;
const tenant_repository_1 = require("./tenant.repository");
class ShardingRepository extends tenant_repository_1.TenantRepository {
    PARTITION_COUNT = 16;
    calculatePartitionNumber(tenantId) {
        const hash = this.crc32(tenantId);
        return Math.abs(hash) % this.PARTITION_COUNT;
    }
    crc32(str) {
        let crc = 0 ^ -1;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            crc = (crc >>> 8) ^ this.crc32Table[(crc ^ char) & 0xff];
        }
        return (crc ^ -1) >>> 0;
    }
    crc32Table = (() => {
        const table = new Array(256);
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) {
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            }
            table[i] = c;
        }
        return table;
    })();
    async getPartitionInfo(connection, tableName) {
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
    async isTablePartitioned(connection, tableName) {
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
    async getTenantDistribution(connection, tableName) {
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
    addPartitionHint(queryBuilder, tenantId) {
        if (tenantId) {
            const partitionNumber = this.calculatePartitionNumber(tenantId);
        }
        return queryBuilder;
    }
    createShardingQueryBuilder(alias, tenantId) {
        const queryBuilder = this.createQueryBuilder(alias);
        return this.addPartitionHint(queryBuilder, tenantId);
    }
    async getPartitionSizes(connection) {
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
    async getPartitionBalanceAdvice(connection, tableName) {
        const distribution = await this.getTenantDistribution(connection, tableName);
        const partitionCounts = new Array(this.PARTITION_COUNT).fill(0);
        let totalRecords = 0;
        let maxRecordsPerTenant = 0;
        let maxRecordsTenantId = '';
        distribution.forEach((item) => {
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
        const imbalances = partitionCounts
            .map((count, index) => ({
            partition: index,
            count,
            deviation: Math.abs(count - avgPerPartition),
            percentage: avgPerPartition > 0 ? (count / avgPerPartition) * 100 : 0,
        }))
            .filter((item) => item.deviation > avgPerPartition * 0.3);
        return {
            tableName,
            totalRecords,
            avgPerPartition,
            partitionCounts,
            imbalances,
            suggestions: imbalances.length > 0
                ? `Consider rebalancing partitions or increasing PARTITION_COUNT to ${this.PARTITION_COUNT * 2}`
                : 'Partition distribution is balanced',
            largestTenant: {
                tenantId: maxRecordsTenantId,
                recordCount: maxRecordsPerTenant,
                partition: this.calculatePartitionNumber(maxRecordsTenantId),
            },
        };
    }
}
exports.ShardingRepository = ShardingRepository;
class ShardingUtils {
    static shouldShardTable(estimatedRowCount, rowSizeBytes = 1024) {
        const estimatedSizeMB = (estimatedRowCount * rowSizeBytes) / (1024 * 1024);
        if (estimatedRowCount > 1000000) {
            return {
                shouldShard: true,
                reason: `Estimated ${estimatedRowCount.toLocaleString()} rows (${estimatedSizeMB.toFixed(2)} MB) exceeds 1M threshold`,
            };
        }
        else if (estimatedSizeMB > 1024) {
            return {
                shouldShard: true,
                reason: `Estimated size ${estimatedSizeMB.toFixed(2)} MB exceeds 1GB threshold`,
            };
        }
        else {
            return {
                shouldShard: false,
                reason: `Estimated ${estimatedRowCount.toLocaleString()} rows (${estimatedSizeMB.toFixed(2)} MB) below thresholds`,
            };
        }
    }
    static generatePartitionDDL(tableName, partitionCount = 16) {
        return `ALTER TABLE ${tableName}
PARTITION BY HASH(MOD(CRC32(tenant_id), ${partitionCount}))
PARTITIONS ${partitionCount};`;
    }
    static generateMigrationPlan(sourceTable, partitionCount = 16) {
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
            `-- DROP TABLE ${sourceTable}_backup;`,
        ];
        return steps;
    }
}
exports.ShardingUtils = ShardingUtils;
//# sourceMappingURL=sharding.repository.js.map