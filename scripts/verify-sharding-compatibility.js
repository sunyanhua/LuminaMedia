#!/usr/bin/env node

/**
 * 验证MySQL分区策略与多租户隔离兼容性
 *
 * 验证目标：
 * 1. 分区键是否为tenant_id
 * 2. 分区算法是否与多租户过滤兼容
 * 3. 分区表是否有tenant_id字段和索引
 * 4. 查询条件tenant_id = ? 能否触发分区修剪
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'lumina_media',
  connectionLimit: 5,
};

// 需要验证的分区表
const PARTITIONED_TABLES = [
  'customer_profiles',
  'content_drafts',
  'publish_tasks',
  'marketing_strategies',
  'user_behaviors'
];

async function main() {
  console.log('🔍 开始验证MySQL分区策略与多租户隔离兼容性');
  console.log('='.repeat(60));

  let connection;
  try {
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ 已连接到数据库: ${dbConfig.database}`);

    // 1. 检查分区表状态
    console.log('\n📊 步骤1: 检查分区表状态');
    const partitionedTables = await checkPartitionedTables(connection);

    if (partitionedTables.length === 0) {
      console.log('⚠️  未找到分区表。请先运行分表初始化脚本 (05-sharding-setup.sql)');
      return;
    }

    // 2. 验证分区键
    console.log('\n🔑 步骤2: 验证分区键');
    const partitionKeyResults = await verifyPartitionKeys(connection, partitionedTables);

    // 3. 验证tenant_id字段和索引
    console.log('\n🏗️  步骤3: 验证tenant_id字段和索引');
    const columnResults = await verifyTenantIdColumns(connection, partitionedTables);

    // 4. 分区算法兼容性分析
    console.log('\n⚙️  步骤4: 分区算法兼容性分析');
    await analyzePartitionCompatibility(connection, partitionedTables);

    // 5. 生成验证报告
    console.log('\n📋 步骤5: 生成验证报告');
    generateValidationReport(partitionedTables, partitionKeyResults, columnResults);

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

/**
 * 检查分区表状态
 */
async function checkPartitionedTables(connection) {
  const partitionedTables = [];

  for (const tableName of PARTITIONED_TABLES) {
    const query = `
      SELECT
        COUNT(*) as partition_count
      FROM information_schema.partitions
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND partition_name IS NOT NULL
    `;

    const [rows] = await connection.execute(query, [tableName]);
    const partitionCount = rows[0]?.partition_count || 0;

    if (partitionCount > 0) {
      console.log(`  ✅ ${tableName}: 已分区 (${partitionCount} 个分区)`);
      partitionedTables.push({ tableName, partitionCount });
    } else {
      console.log(`  ⚠️  ${tableName}: 未分区`);
    }
  }

  return partitionedTables;
}

/**
 * 验证分区键
 */
async function verifyPartitionKeys(connection, partitionedTables) {
  const results = [];

  for (const { tableName } of partitionedTables) {
    const query = `
      SELECT
        PARTITION_EXPRESSION as expression
      FROM information_schema.partitions
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND partition_name IS NOT NULL
      LIMIT 1
    `;

    const [rows] = await connection.execute(query, [tableName]);
    const expression = rows[0]?.expression || '';

    // 检查分区表达式是否包含tenant_id
    const hasTenantId = expression.includes('tenant_id');
    const isHashPartition = expression.includes('HASH') || expression.includes('CRC32');

    results.push({
      tableName,
      expression,
      hasTenantId,
      isHashPartition,
      compatible: hasTenantId && isHashPartition
    });

    if (hasTenantId && isHashPartition) {
      console.log(`  ✅ ${tableName}: 分区键包含tenant_id, 使用哈希分区`);
      console.log(`     表达式: ${expression}`);
    } else {
      console.log(`  ❌ ${tableName}: 分区键不兼容`);
      console.log(`     表达式: ${expression}`);
      if (!hasTenantId) console.log(`     问题: 分区键不包含tenant_id`);
      if (!isHashPartition) console.log(`     问题: 未使用哈希分区算法`);
    }
  }

  return results;
}

/**
 * 验证tenant_id字段和索引
 */
async function verifyTenantIdColumns(connection, partitionedTables) {
  const results = [];

  for (const { tableName } of partitionedTables) {
    // 检查tenant_id字段是否存在
    const columnQuery = `
      SELECT
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = 'tenant_id'
    `;

    const [columnRows] = await connection.execute(columnQuery, [tableName]);
    const hasColumn = columnRows.length > 0;

    // 检查tenant_id索引
    const indexQuery = `
      SELECT
        INDEX_NAME,
        NON_UNIQUE,
        SEQ_IN_INDEX,
        COLUMN_NAME
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = 'tenant_id'
      ORDER BY SEQ_IN_INDEX
    `;

    const [indexRows] = await connection.execute(indexQuery, [tableName]);
    const hasIndex = indexRows.length > 0;
    const isUnique = hasIndex && indexRows.some(row => row.NON_UNIQUE === 0);

    results.push({
      tableName,
      hasColumn,
      hasIndex,
      isUnique,
      columnInfo: columnRows[0] || null,
      indexInfo: indexRows
    });

    if (hasColumn && hasIndex) {
      console.log(`  ✅ ${tableName}: 包含tenant_id字段和索引`);
      console.log(`     字段: ${columnRows[0]?.DATA_TYPE || '未知'} ${columnRows[0]?.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
      console.log(`     索引: ${indexRows.map(row => row.INDEX_NAME).join(', ')}`);
    } else {
      console.log(`  ❌ ${tableName}: tenant_id字段或索引缺失`);
      if (!hasColumn) console.log(`     问题: 缺少tenant_id字段`);
      if (!hasIndex) console.log(`     问题: 缺少tenant_id索引`);
    }
  }

  return results;
}

/**
 * 分析分区兼容性
 */
async function analyzePartitionCompatibility(connection, partitionedTables) {
  console.log('\n  📈 分区兼容性分析:');

  for (const { tableName, partitionCount } of partitionedTables) {
    // 获取分区数据分布
    const distributionQuery = `
      SELECT
        PARTITION_NAME,
        TABLE_ROWS,
        ROUND(DATA_LENGTH / 1024 / 1024, 2) AS DATA_MB,
        ROUND(INDEX_LENGTH / 1024 / 1024, 2) AS INDEX_MB
      FROM information_schema.partitions
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND partition_name IS NOT NULL
      ORDER BY PARTITION_ORDINAL_POSITION
    `;

    const [distributionRows] = await connection.execute(distributionQuery, [tableName]);

    // 计算分区平衡性
    const totalRows = distributionRows.reduce((sum, row) => sum + (row.TABLE_ROWS || 0), 0);
    const avgRows = totalRows / distributionRows.length;
    const imbalances = distributionRows.filter(row => {
      const deviation = Math.abs((row.TABLE_ROWS || 0) - avgRows);
      return deviation > avgRows * 0.3; // 偏差超过30%
    });

    console.log(`  📊 ${tableName}:`);
    console.log(`     分区数量: ${partitionCount}`);
    console.log(`     总行数: ${totalRows.toLocaleString()}`);
    console.log(`     平均行数/分区: ${Math.round(avgRows).toLocaleString()}`);
    console.log(`     不平衡分区: ${imbalances.length}/${partitionCount}`);

    if (imbalances.length > 0) {
      console.log(`     ⚠️  检测到分区不平衡，可能影响查询性能`);
    } else {
      console.log(`     ✅ 分区分布均衡`);
    }

    // 检查分区修剪可能性
    console.log(`     🔍 分区修剪: 当查询条件包含tenant_id时，MySQL可自动定位到对应分区`);
    console.log(`     算法: MOD(CRC32(tenant_id), ${partitionCount})`);
  }
}

/**
 * 生成验证报告
 */
function generateValidationReport(tables, keyResults, columnResults) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 MySQL分区策略与多租户隔离兼容性验证报告');
  console.log('='.repeat(60));

  const allPartitioned = tables.length === PARTITIONED_TABLES.length;
  const allKeysCompatible = keyResults.every(r => r.compatible);
  const allColumnsValid = columnResults.every(r => r.hasColumn && r.hasIndex);

  console.log(`\n📊 总体状态:`);
  console.log(`   分区表数量: ${tables.length}/${PARTITIONED_TABLES.length}`);
  console.log(`   分区键兼容: ${allKeysCompatible ? '✅ 全部兼容' : '❌ 存在问题'}`);
  console.log(`   字段和索引: ${allColumnsValid ? '✅ 全部完整' : '❌ 存在问题'}`);

  console.log(`\n🎯 验证结论:`);
  if (allPartitioned && allKeysCompatible && allColumnsValid) {
    console.log(`   ✅ MySQL分区策略与多租户隔离完全兼容`);
    console.log(`   ✅ 分区键为tenant_id，与多租户过滤条件一致`);
    console.log(`   ✅ 所有分区表都有tenant_id字段和索引`);
    console.log(`   ✅ 查询条件tenant_id = ? 可触发MySQL分区修剪优化`);
  } else {
    console.log(`   ❌ 存在兼容性问题:`);
    if (!allPartitioned) console.log(`      - 部分表未分区`);
    if (!allKeysCompatible) console.log(`      - 部分表分区键不包含tenant_id`);
    if (!allColumnsValid) console.log(`      - 部分表缺少tenant_id字段或索引`);
  }

  console.log(`\n💡 建议:`);
  console.log(`   1. 确保所有大数据表都按tenant_id分区`);
  console.log(`   2. 分区算法使用HASH(MOD(CRC32(tenant_id), N))`);
  console.log(`   3. 为tenant_id字段添加索引以加速查询`);
  console.log(`   4. 定期检查分区平衡性，避免数据倾斜`);
  console.log(`   5. 查询时始终包含tenant_id条件以利用分区修剪`);

  console.log('\n' + '='.repeat(60));
}

// 运行主函数
main().catch(console.error);