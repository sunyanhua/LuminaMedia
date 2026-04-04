"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ShardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShardingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const sharding_repository_1 = require("../repositories/sharding.repository");
let ShardingService = ShardingService_1 = class ShardingService {
    connection;
    logger = new common_1.Logger(ShardingService_1.name);
    constructor(connection) {
        this.connection = connection;
    }
    async initializePartitions(tableNames) {
        const tables = tableNames || [
            'customer_profiles',
            'content_drafts',
            'publish_tasks',
            'marketing_strategies',
            'user_behaviors',
        ];
        const results = [];
        for (const tableName of tables) {
            try {
                const result = await this.partitionTable(tableName);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`Failed to partition table ${tableName}:`, error);
                results.push({
                    tableName,
                    success: false,
                    error: error.message,
                });
            }
        }
        return results;
    }
    async partitionTable(tableName, partitionCount = 16) {
        const tableExists = await this.checkTableExists(tableName);
        if (!tableExists) {
            return {
                tableName,
                success: false,
                message: `Table ${tableName} does not exist`,
            };
        }
        const isPartitioned = await this.isTablePartitioned(tableName);
        if (isPartitioned) {
            return {
                tableName,
                success: true,
                message: `Table ${tableName} is already partitioned`,
                partitionInfo: await this.getPartitionInfo(tableName),
            };
        }
        const hasTenantId = await this.checkColumnExists(tableName, 'tenant_id');
        if (!hasTenantId) {
            return {
                tableName,
                success: false,
                message: `Table ${tableName} does not have tenant_id column`,
            };
        }
        const ddl = sharding_repository_1.ShardingUtils.generatePartitionDDL(tableName, partitionCount);
        try {
            await this.connection.query(ddl);
            const partitionInfo = await this.getPartitionInfo(tableName);
            return {
                tableName,
                success: true,
                message: `Table ${tableName} partitioned successfully`,
                ddl,
                partitionInfo,
            };
        }
        catch (error) {
            throw new Error(`Failed to execute partition DDL for ${tableName}: ${error.message}`);
        }
    }
    async getPartitionInfo(tableName) {
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
    async isTablePartitioned(tableName) {
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
    async checkTableExists(tableName) {
        const query = `
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?
    `;
        const result = await this.connection.query(query, [tableName]);
        if (!result || !Array.isArray(result) || result.length === 0)
            return false;
        return result[0]?.table_count > 0;
    }
    async checkColumnExists(tableName, columnName) {
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
    async getAllPartitionStats() {
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
    async analyzePartitionBalance(tableName) {
        const partitionInfo = await this.getPartitionInfo(tableName);
        if (partitionInfo.length === 0) {
            return { tableName, isPartitioned: false };
        }
        const totalRows = partitionInfo.reduce((sum, p) => sum + (p.table_rows || 0), 0);
        const avgRows = totalRows / partitionInfo.length;
        const imbalances = partitionInfo.filter((p) => {
            const deviation = Math.abs((p.table_rows || 0) - avgRows);
            return deviation > avgRows * 0.3;
        });
        return {
            tableName,
            isPartitioned: true,
            partitionCount: partitionInfo.length,
            totalRows,
            avgRows: Math.round(avgRows),
            imbalances: imbalances.map((p) => ({
                partition: p.partition_name,
                rows: p.table_rows,
                deviation: Math.abs((p.table_rows || 0) - avgRows),
                deviationPercent: avgRows > 0
                    ? Math.abs((((p.table_rows || 0) - avgRows) / avgRows) * 100)
                    : 0,
            })),
            isBalanced: imbalances.length === 0,
            recommendation: imbalances.length > 0
                ? `Consider increasing partition count or using different partition key`
                : 'Partition distribution is balanced',
        };
    }
    async getTenantDistribution(tableName, limit = 20) {
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
    async generateMigrationReport(tableName) {
        const tableExists = await this.checkTableExists(tableName);
        if (!tableExists) {
            return {
                tableName,
                exists: false,
                message: `Table ${tableName} does not exist`,
            };
        }
        const isPartitioned = await this.isTablePartitioned(tableName);
        const rowCount = await this.getRowCount(tableName);
        const shouldShard = sharding_repository_1.ShardingUtils.shouldShardTable(rowCount, 1024);
        return {
            tableName,
            exists: true,
            isPartitioned,
            rowCount,
            shouldShard,
            migrationPlan: isPartitioned
                ? null
                : sharding_repository_1.ShardingUtils.generateMigrationPlan(tableName),
            estimatedDowntime: this.estimateDowntime(rowCount),
        };
    }
    async getRowCount(tableName) {
        const query = `SELECT COUNT(*) as count FROM ??`;
        const result = await this.connection.query(query, [tableName]);
        return result[0]?.count || 0;
    }
    estimateDowntime(rowCount) {
        const seconds = rowCount / 10000;
        if (seconds < 60) {
            return `${Math.ceil(seconds)} seconds`;
        }
        else if (seconds < 3600) {
            return `${Math.ceil(seconds / 60)} minutes`;
        }
        else {
            return `${Math.ceil(seconds / 3600)} hours`;
        }
    }
    async monitorPartitionPerformance(tableName) {
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
            analysis: this.analyzePerformance(partitions),
        };
    }
    analyzePerformance(partitions) {
        if (partitions.length === 0)
            return {};
        const totalRows = partitions.reduce((sum, p) => sum + (p.TABLE_ROWS || 0), 0);
        const avgRows = totalRows / partitions.length;
        const maxRows = Math.max(...partitions.map((p) => p.TABLE_ROWS || 0));
        const minRows = Math.min(...partitions.map((p) => p.TABLE_ROWS || 0));
        const imbalanceRatio = avgRows > 0 ? (maxRows - minRows) / avgRows : 0;
        return {
            totalRows,
            partitionCount: partitions.length,
            avgRowsPerPartition: Math.round(avgRows),
            maxRowsPerPartition: maxRows,
            minRowsPerPartition: minRows,
            imbalanceRatio: imbalanceRatio.toFixed(2),
            recommendation: imbalanceRatio > 0.5
                ? 'Significant partition imbalance detected. Consider re-partitioning.'
                : 'Partition distribution is acceptable.',
        };
    }
};
exports.ShardingService = ShardingService;
exports.ShardingService = ShardingService = ShardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.Connection])
], ShardingService);
//# sourceMappingURL=sharding.service.js.map