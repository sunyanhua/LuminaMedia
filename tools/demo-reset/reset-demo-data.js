#!/usr/bin/env node

/**
 * DEMO数据重置工具
 *
 * 功能：清空DEMO数据库中的所有表并重新插入示例数据
 * 用法：node reset-demo-data.js [--host HOST] [--port PORT] [--user USER] [--password PASSWORD] [--database DATABASE]
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// 默认数据库连接配置
const DEFAULT_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3308,
  user: process.env.DB_USERNAME || 'demo_user',
  password: process.env.DB_PASSWORD || 'demo_password',
  database: process.env.DB_DATABASE || 'lumina_demo',
  charset: 'utf8mb4',
  timezone: '+08:00', // 中国时区
};

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--host' && args[i + 1]) {
      config.host = args[++i];
    } else if (args[i] === '--port' && args[i + 1]) {
      config.port = parseInt(args[++i], 10);
    } else if (args[i] === '--user' && args[i + 1]) {
      config.user = args[++i];
    } else if (args[i] === '--password' && args[i + 1]) {
      config.password = args[++i];
    } else if (args[i] === '--database' && args[i + 1]) {
      config.database = args[++i];
    } else if (args[i] === '--help' || args[i] === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return config;
}

// 打印帮助信息
function printHelp() {
  console.log(`
DEMO数据重置工具

用法: node reset-demo-data.js [选项]

选项:
  --host HOST          数据库主机地址 (默认: ${DEFAULT_CONFIG.host})
  --port PORT          数据库端口 (默认: ${DEFAULT_CONFIG.port})
  --user USER          数据库用户名 (默认: ${DEFAULT_CONFIG.user})
  --password PASSWORD  数据库密码 (默认: ${DEFAULT_CONFIG.password})
  --database DATABASE  数据库名称 (默认: ${DEFAULT_CONFIG.database})
  --help, -h           显示此帮助信息

环境变量:
  DB_HOST              数据库主机地址
  DB_PORT              数据库端口
  DB_USERNAME          数据库用户名
  DB_PASSWORD          数据库密码
  DB_DATABASE          数据库名称

示例:
  node reset-demo-data.js
  node reset-demo-data.js --host 127.0.0.1 --port 3308 --user demo_user --password demo_password
  DB_HOST=localhost DB_PORT=3308 node reset-demo-data.js
  `);
}

// 读取SQL文件
async function readSqlFile(filePath) {
  try {
    const sql = await fs.promises.readFile(filePath, 'utf8');
    return sql;
  } catch (error) {
    console.error(`❌ 无法读取SQL文件: ${filePath}`);
    console.error(`错误信息: ${error.message}`);
    throw error;
  }
}

// 执行SQL语句
async function executeSql(connection, sql) {
  try {
    // 将SQL语句分割成单独的语句
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    console.log(`🔧 正在执行 ${statements.length} 条SQL语句...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await connection.execute(statement);
        console.log(`  ✅ 语句 ${i + 1}/${statements.length} 执行成功`);
      } catch (error) {
        console.error(`  ❌ 语句 ${i + 1}/${statements.length} 执行失败`);
        console.error(`      SQL: ${statement.substring(0, 100)}...`);
        console.error(`      错误: ${error.message}`);
        // 继续执行下一条语句
      }
    }
  } catch (error) {
    console.error(`❌ 执行SQL时发生错误: ${error.message}`);
    throw error;
  }
}

// 主函数
async function main() {
  console.log('🚀 开始重置DEMO数据...\n');

  // 解析配置
  const config = parseArgs();
  console.log('📊 数据库配置:');
  console.log(`   主机: ${config.host}`);
  console.log(`   端口: ${config.port}`);
  console.log(`   数据库: ${config.database}`);
  console.log(`   用户: ${config.user}`);
  console.log('');

  // 检查SQL文件是否存在
  const sqlFilePath = path.join(__dirname, 'reset-data.sql');
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`❌ SQL文件不存在: ${sqlFilePath}`);
    console.error('请确保 reset-data.sql 文件存在于同一目录中');
    process.exit(1);
  }

  let connection;
  try {
    // 连接到数据库
    console.log('🔗 正在连接到数据库...');
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功\n');

    // 读取并执行SQL文件
    console.log(`📖 正在读取SQL文件: ${sqlFilePath}`);
    const sql = await readSqlFile(sqlFilePath);
    console.log(`✅ SQL文件读取成功，大小: ${sql.length} 字符\n`);

    // 执行SQL
    await executeSql(connection, sql);

    console.log('\n🎉 DEMO数据重置完成！');
    console.log('💡 提示: DEMO数据库已重置为初始状态，包含示例数据');

  } catch (error) {
    console.error(`\n❌ DEMO数据重置失败: ${error.message}`);
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('\n🔌 数据库连接已关闭');
      } catch (error) {
        console.error(`❌ 关闭数据库连接时发生错误: ${error.message}`);
      }
    }
  }
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error(`❌ 未处理的错误: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, parseArgs, executeSql };