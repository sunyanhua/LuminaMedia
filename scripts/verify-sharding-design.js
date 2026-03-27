#!/usr/bin/env node

/**
 * 分表策略设计验证
 * 验证MySQL分区策略与多租户隔离兼容性（设计层面）
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'lumina_media',
};

const TABLES_TO_CHECK = [
  'customer_profiles',
  'content_drafts',
  'publish_tasks',
  'marketing_strategies',
  'user_behaviors'
];

async function main() {
  console.log('🔍 MySQL分区策略与多租户隔离兼容性验证（设计层面）');
  console.log('='.repeat(60));

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ 已连接到数据库: ${dbConfig.database}`);

    const results = [];

    for (const tableName of TABLES_TO_CHECK) {
      console.log(`\n📋 检查表: ${tableName}`);

      // 检查表是否存在
      const tableExists = await checkTableExists(connection, tableName);
      if (!tableExists) {
        console.log(`  ⚠️  表不存在，跳过`);
        results.push({ tableName, exists: false });
        continue;
      }

      // 检查tenant_id字段
      const hasTenantId = await checkColumnExists(connection, tableName, 'tenant_id');
      const columnType = await getColumnType(connection, tableName, 'tenant_id');

      // 检查tenant_id索引
      const hasIndex = await checkIndexExists(connection, tableName, 'tenant_id');

      // 检查是否已分区
      const isPartitioned = await checkTablePartitioned(connection, tableName);
      const partitionInfo = isPartitioned ? await getPartitionInfo(connection, tableName) : null;

      // 评估兼容性
      const compatible = hasTenantId && hasIndex;
      const partitionReady = hasTenantId && !isPartitioned;

      results.push({
        tableName,
        exists: true,
        hasTenantId,
        columnType,
        hasIndex,
        isPartitioned,
        partitionCount: partitionInfo?.length || 0,
        compatible,
        partitionReady
      });

      // 输出结果
      console.log(`  ${hasTenantId ? '✅' : '❌'} tenant_id字段: ${hasTenantId ? `存在 (${columnType})` : '缺失'}`);
      console.log(`  ${hasIndex ? '✅' : '❌'} tenant_id索引: ${hasIndex ? '存在' : '缺失'}`);
      console.log(`  ${isPartitioned ? '✅' : '🔧'} 分区状态: ${isPartitioned ? `已分区 (${partitionInfo?.length} 分区)` : '未分区'}`);

      if (isPartitioned && partitionInfo) {
        const expression = await getPartitionExpression(connection, tableName);
        console.log(`  分区表达式: ${expression || '未知'}`);
      }

      if (!hasTenantId) {
        console.log(`  ⚠️  不兼容: 缺少tenant_id字段，无法实现多租户隔离和分区`);
      } else if (!hasIndex) {
        console.log(`  ⚠️  警告: 缺少tenant_id索引，查询性能可能受影响`);
      }

      if (partitionReady) {
        console.log(`  💡 建议: 可运行分区脚本应用分表策略`);
      }
    }

    // 生成总体报告
    console.log('\n' + '='.repeat(60));
    console.log('📋 总体兼容性报告');
    console.log('='.repeat(60));

    const existingTables = results.filter(r => r.exists);
    const compatibleTables = existingTables.filter(r => r.compatible);
    const partitionedTables = existingTables.filter(r => r.isPartitioned);

    console.log(`\n📊 统计:`);
    console.log(`  检查表数量: ${TABLES_TO_CHECK.length}`);
    console.log(`  存在表数量: ${existingTables.length}`);
    console.log(`  兼容表数量: ${compatibleTables.length}`);
    console.log(`  已分区表数量: ${partitionedTables.length}`);

    console.log(`\n🎯 设计兼容性结论:`);
    if (compatibleTables.length === existingTables.length && existingTables.length > 0) {
      console.log(`  ✅ 所有表的设计都与分表策略兼容`);
      console.log(`  ✅ tenant_id字段和索引完整，支持多租户隔离`);
      console.log(`  ✅ 可按tenant_id进行哈希分区`);
      if (partitionedTables.length === existingTables.length) {
        console.log(`  ✅ 所有表已分区，分表策略已完全实施`);
      } else {
        console.log(`  🔧 部分表未分区，需要运行分表初始化脚本`);
      }
    } else {
      console.log(`  ⚠️  存在兼容性问题:`);
      results.filter(r => r.exists && !r.compatible).forEach(r => {
        console.log(`     - ${r.tableName}: ${!r.hasTenantId ? '缺少tenant_id字段' : '缺少tenant_id索引'}`);
      });
    }

    console.log(`\n💡 实施建议:`);
    console.log(`  1. 确保所有表都有tenant_id字段和索引`);
    console.log(`  2. 运行分表初始化脚本: scripts/05-sharding-setup.sql`);
    console.log(`  3. 分区算法: HASH(MOD(CRC32(tenant_id), 16))`);
    console.log(`  4. 分区数量: 16 (可根据数据量调整)`);
    console.log(`  5. 查询时始终包含tenant_id条件以利用分区修剪`);

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

async function checkTableExists(connection, tableName) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  );
  return rows[0].count > 0;
}

async function checkColumnExists(connection, tableName, columnName) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [tableName, columnName]
  );
  return rows[0].count > 0;
}

async function getColumnType(connection, tableName, columnName) {
  const [rows] = await connection.execute(
    `SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [tableName, columnName]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return `${row.DATA_TYPE}${row.CHARACTER_MAXIMUM_LENGTH ? `(${row.CHARACTER_MAXIMUM_LENGTH})` : ''}`;
}

async function checkIndexExists(connection, tableName, columnName) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) as count FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [tableName, columnName]
  );
  return rows[0].count > 0;
}

async function checkTablePartitioned(connection, tableName) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) as count FROM information_schema.partitions WHERE table_schema = DATABASE() AND table_name = ? AND partition_name IS NOT NULL`,
    [tableName]
  );
  return rows[0].count > 0;
}

async function getPartitionInfo(connection, tableName) {
  const [rows] = await connection.execute(
    `SELECT PARTITION_NAME, PARTITION_ORDINAL_POSITION, TABLE_ROWS FROM information_schema.partitions WHERE table_schema = DATABASE() AND table_name = ? AND partition_name IS NOT NULL ORDER BY PARTITION_ORDINAL_POSITION`,
    [tableName]
  );
  return rows;
}

async function getPartitionExpression(connection, tableName) {
  const [rows] = await connection.execute(
    `SELECT PARTITION_EXPRESSION FROM information_schema.partitions WHERE table_schema = DATABASE() AND table_name = ? AND partition_name IS NOT NULL LIMIT 1`,
    [tableName]
  );
  return rows[0]?.PARTITION_EXPRESSION || null;
}

main().catch(console.error);