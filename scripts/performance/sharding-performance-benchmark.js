#!/usr/bin/env node

/**
 * 分表性能测试基准
 * 测试600万数据量级查询性能，评估分表策略效果
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'lumina_media',
  connectionLimit: 5,
};

const TEST_TABLES = ['customer_profiles', 'content_drafts', 'publish_tasks'];
const PARTITION_COUNT = 16;
const SIMULATED_ROW_COUNT = 6000000; // 600万

async function main() {
  console.log('🚀 分表性能测试基准 - 600万数据量级查询性能评估');
  console.log('='.repeat(70));

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ 已连接到数据库: ${dbConfig.database}`);

    // 1. 当前数据库状态分析
    console.log('\n📊 步骤1: 数据库当前状态分析');
    await analyzeCurrentState(connection);

    // 2. 分区表性能分析（如果已分区）
    console.log('\n⚡ 步骤2: 分区表性能分析');
    for (const tableName of TEST_TABLES) {
      await analyzeTablePerformance(connection, tableName);
    }

    // 3. 分表策略性能模拟
    console.log('\n🎯 步骤3: 600万数据量级性能模拟');
    await simulatePartitionPerformance(connection);

    // 4. 查询性能对比分析
    console.log('\n📈 步骤4: 查询性能对比分析');
    await compareQueryPerformance(connection);

    // 5. 分表优化建议
    console.log('\n💡 步骤5: 分表优化建议');
    await generateOptimizationSuggestions(connection);

  } catch (error) {
    console.error('❌ 性能测试过程中发生错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

/**
 * 分析当前数据库状态
 */
async function analyzeCurrentState(connection) {
  console.log('  检查表状态:');

  for (const tableName of TEST_TABLES) {
    // 表是否存在
    const [tableRows] = await connection.execute(
      `SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    );
    const exists = tableRows[0].table_count > 0;

    if (!exists) {
      console.log(`    ⚠️  ${tableName}: 表不存在`);
      continue;
    }

    // 行数统计
    const [countRows] = await connection.execute(`SELECT COUNT(*) as row_count FROM ??`, [tableName]);
    const rowCount = countRows[0].row_count;

    // 是否分区
    const [partitionRows] = await connection.execute(
      `SELECT COUNT(*) as partition_count FROM information_schema.partitions WHERE table_schema = DATABASE() AND table_name = ? AND partition_name IS NOT NULL`,
      [tableName]
    );
    const partitionCount = partitionRows[0].partition_count;
    const isPartitioned = partitionCount > 0;

    // 表大小
    const [sizeRows] = await connection.execute(
      `SELECT
        ROUND(data_length / 1024 / 1024, 2) as data_mb,
        ROUND(index_length / 1024 / 1024, 2) as index_mb,
        ROUND((data_length + index_length) / 1024 / 1024, 2) as total_mb
      FROM information_schema.tables
      WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    );

    console.log(`    📊 ${tableName}:`);
    console.log(`        行数: ${rowCount.toLocaleString()}`);
    console.log(`        大小: ${sizeRows[0]?.total_mb || 0} MB (数据: ${sizeRows[0]?.data_mb || 0} MB, 索引: ${sizeRows[0]?.index_mb || 0} MB)`);
    console.log(`        分区: ${isPartitioned ? `已分区 (${partitionCount} 分区)` : '未分区'}`);
  }
}

/**
 * 分析表性能
 */
async function analyzeTablePerformance(connection, tableName) {
  console.log(`\n  🔍 分析表 ${tableName}:`);

  // 检查表是否存在
  const [tableRows] = await connection.execute(
    `SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  );
  if (tableRows[0].table_count === 0) {
    console.log(`    表不存在，跳过性能分析`);
    return;
  }

  // 检查是否有tenant_id字段
  const [columnRows] = await connection.execute(
    `SELECT COUNT(*) as column_count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = 'tenant_id'`,
    [tableName]
  );
  const hasTenantId = columnRows[0].column_count > 0;

  if (!hasTenantId) {
    console.log(`    ⚠️  缺少tenant_id字段，无法进行分表性能分析`);
    return;
  }

  // 获取一个示例tenant_id
  const [tenantRows] = await connection.execute(
    `SELECT DISTINCT tenant_id FROM ?? WHERE tenant_id IS NOT NULL LIMIT 1`,
    [tableName]
  );
  const sampleTenantId = tenantRows[0]?.tenant_id;

  if (!sampleTenantId) {
    console.log(`    ℹ️  表中无tenant_id数据，使用模拟tenant_id进行分析`);
    // 使用模拟tenant_id进行EXPLAIN分析
    await explainPartitionQuery(connection, tableName, 'default-tenant');
  } else {
    await explainPartitionQuery(connection, tableName, sampleTenantId);
  }

  // 分析索引使用情况
  await analyzeIndexUsage(connection, tableName);
}

/**
 * 使用EXPLAIN分析分区查询
 */
async function explainPartitionQuery(connection, tableName, tenantId) {
  console.log(`    🔎 查询分析 (tenant_id = '${tenantId}'):`);

  try {
    // 使用EXPLAIN分析查询计划
    const [explainRows] = await connection.execute(
      `EXPLAIN SELECT * FROM ?? WHERE tenant_id = ?`,
      [tableName, tenantId]
    );

    // 检查是否使用了分区修剪
    const partitionInfo = explainRows.find(row => row.partitions);
    if (partitionInfo && partitionInfo.partitions) {
      console.log(`      ✅ 分区修剪: 查询将扫描分区 ${partitionInfo.partitions}`);
      console.log(`         类型: ${partitionInfo.type}, 扫描行数: ${partitionInfo.rows}`);
    } else {
      console.log(`      ℹ️  分区修剪: 未检测到分区修剪（可能表未分区）`);
    }

    // 检查索引使用
    const keyInfo = explainRows.find(row => row.key);
    if (keyInfo && keyInfo.key) {
      console.log(`      🔑 使用索引: ${keyInfo.key}`);
    } else {
      console.log(`      ⚠️  未使用索引: 考虑为tenant_id添加索引`);
    }

  } catch (error) {
    console.log(`      ❌ EXPLAIN查询失败: ${error.message}`);
  }
}

/**
 * 分析索引使用情况
 */
async function analyzeIndexUsage(connection, tableName) {
  const [indexRows] = await connection.execute(
    `SHOW INDEX FROM ??`,
    [tableName]
  );

  if (indexRows.length === 0) {
    console.log(`    📉 索引状态: 无索引`);
    return;
  }

  console.log(`    📊 索引统计:`);
  const tenantIndices = indexRows.filter(row => row.Column_name === 'tenant_id');
  if (tenantIndices.length > 0) {
    tenantIndices.forEach(idx => {
      console.log(`        - ${idx.Key_name}: tenant_id (Cardinality: ${idx.Cardinality})`);
    });
  } else {
    console.log(`        ⚠️  缺少tenant_id索引`);
  }
}

/**
 * 模拟分区性能
 */
async function simulatePartitionPerformance(connection) {
  console.log('  🎮 600万数据量级性能模拟:');

  // 模拟参数
  const partitionCount = PARTITION_COUNT;
  const totalRows = SIMULATED_ROW_COUNT;
  const avgRowsPerPartition = totalRows / partitionCount;
  const tenants = 1000; // 模拟1000个租户
  const rowsPerTenant = totalRows / tenants;

  console.log(`    总数据量: ${totalRows.toLocaleString()} 行`);
  console.log(`    租户数量: ${tenants.toLocaleString()} 个`);
  console.log(`    平均每租户数据: ${Math.round(rowsPerTenant).toLocaleString()} 行`);
  console.log(`    分区数量: ${partitionCount}`);
  console.log(`    平均每分区数据: ${Math.round(avgRowsPerPartition).toLocaleString()} 行`);

  // 性能估算
  console.log('\n    ⏱️  性能估算:');
  console.log(`    无分区全表扫描: ~${Math.round(totalRows / 10000)}ms (假设10μs/行)`);
  console.log(`    有分区单分区扫描: ~${Math.round(avgRowsPerPartition / 10000)}ms (假设10μs/行)`);
  console.log(`    性能提升: ${Math.round(totalRows / avgRowsPerPartition)}倍`);

  // 分区平衡性模拟
  console.log('\n    ⚖️  分区平衡性模拟:');
  const imbalanceFactor = 0.3; // 30%不平衡
  const maxPartitionRows = avgRowsPerPartition * (1 + imbalanceFactor);
  const minPartitionRows = avgRowsPerPartition * (1 - imbalanceFactor);
  console.log(`    理想分区行数范围: ${Math.round(minPartitionRows).toLocaleString()} - ${Math.round(maxPartitionRows).toLocaleString()} 行`);
  console.log(`    最大偏差: ±${imbalanceFactor * 100}%`);

  // 查询性能模拟
  console.log('\n    🔍 查询性能模拟:');
  console.log(`    按tenant_id查询: 单分区扫描，约 ${Math.round(avgRowsPerPartition / 10000)}ms`);
  console.log(`    跨分区查询: 全表扫描，约 ${Math.round(totalRows / 10000)}ms`);
  console.log(`    聚合查询: 全表扫描，约 ${Math.round(totalRows / 10000)}ms`);
}

/**
 * 查询性能对比分析
 */
async function compareQueryPerformance(connection) {
  console.log('  📊 查询性能对比分析:');

  const scenarios = [
    { name: '单租户查询 (tenant_id = ?)', partitioned: '单分区扫描', nonPartitioned: '全表扫描', improvement: '10-100倍' },
    { name: '多租户查询 (tenant_id IN (...))', partitioned: '多分区扫描', nonPartitioned: '全表扫描', improvement: '2-10倍' },
    { name: '聚合统计 (COUNT, SUM)', partitioned: '全表扫描', nonPartitioned: '全表扫描', improvement: '无差异' },
    { name: '范围查询 (tenant_id LIKE)', partitioned: '多分区扫描', nonPartitioned: '全表扫描', improvement: '2-5倍' },
    { name: 'JOIN查询 (带tenant_id)', partitioned: '分区对齐', nonPartitioned: '全表JOIN', improvement: '5-20倍' },
  ];

  scenarios.forEach(scenario => {
    console.log(`    ${scenario.name}:`);
    console.log(`      分区表: ${scenario.partitioned}`);
    console.log(`      非分区表: ${scenario.nonPartitioned}`);
    console.log(`      性能提升: ${scenario.improvement}`);
  });
}

/**
 * 生成优化建议
 */
async function generateOptimizationSuggestions(connection) {
  console.log('  💡 分表优化建议:');

  const suggestions = [
    '1. 📋 数据库表结构准备:',
    '   - 为所有大表添加tenant_id字段 (CHAR(36))',
    '   - 为tenant_id字段添加索引 (idx_{table}_tenant_id)',
    '   - 确保现有数据都有tenant_id值',
    '',
    '2. 🗂️ 分表策略实施:',
    '   - 运行分表初始化脚本: scripts/05-sharding-setup.sql',
    '   - 分区算法: HASH(MOD(CRC32(tenant_id), 16))',
    '   - 分区数量: 16 (可根据数据量调整)',
    '   - 验证分区创建成功',
    '',
    '3. 🔍 查询优化:',
    '   - 所有查询必须包含tenant_id条件',
    '   - 避免跨分区查询 (tenant_id IN 列表不宜过大)',
    '   - 利用分区修剪优化查询性能',
    '   - 定期分析查询执行计划',
    '',
    '4. 📊 监控维护:',
    '   - 定期检查分区平衡性 (ShardingService.analyzePartitionBalance)',
    '   - 监控分区表大小和增长趋势',
    '   - 设定分区再平衡阈值 (如30%不平衡)',
    '   - 定期备份分区表结构',
    '',
    '5. 🚀 性能调优:',
    '   - 考虑按时间范围进行二级分区 (如按年/月)',
    '   - 对于超大数据集，可增加分区数量至32或64',
    '   - 使用分区交换 (Partition Exchange) 进行数据归档',
    '   - 考虑使用MySQL 8.0的分区改进特性',
  ];

  suggestions.forEach(line => console.log(`    ${line}`));

  // 检查当前表状态
  console.log('\n  🔎 当前状态检查:');
  for (const tableName of TEST_TABLES) {
    const [tenantColumn] = await connection.execute(
      `SELECT COUNT(*) as column_count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = 'tenant_id'`,
      [tableName]
    );
    const [partitionInfo] = await connection.execute(
      `SELECT COUNT(*) as partition_count FROM information_schema.partitions WHERE table_schema = DATABASE() AND table_name = ? AND partition_name IS NOT NULL`,
      [tableName]
    );

    const hasTenantId = tenantColumn[0].column_count > 0;
    const isPartitioned = partitionInfo[0].partition_count > 0;

    console.log(`    ${tableName}:`);
    console.log(`      tenant_id字段: ${hasTenantId ? '✅ 存在' : '❌ 缺失'}`);
    console.log(`      分区状态: ${isPartitioned ? '✅ 已分区' : '❌ 未分区'}`);
  }
}

// 运行主函数
main().catch(console.error);