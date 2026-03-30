const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const CUSTOMERS_CSV = path.join(OUTPUT_DIR, 'customers.csv');
const PURCHASES_CSV = path.join(OUTPUT_DIR, 'purchases.csv');
const ACTIVITIES_CSV = path.join(OUTPUT_DIR, 'activities.csv');
const SOCIAL_CSV = path.join(OUTPUT_DIR, 'social.csv');

const SQL_OUTPUT_DIR = path.join(OUTPUT_DIR, 'sql');
const CUSTOMERS_SQL = path.join(SQL_OUTPUT_DIR, '01-demo_customer_profiles.sql');
const PURCHASES_SQL = path.join(SQL_OUTPUT_DIR, '02-demo_purchase_records.sql');
const ACTIVITIES_SQL = path.join(SQL_OUTPUT_DIR, '03-demo_activities.sql');
const SOCIAL_SQL = path.join(SQL_OUTPUT_DIR, '04-demo_social_interactions.sql');

// 确保SQL输出目录存在
if (!fs.existsSync(SQL_OUTPUT_DIR)) {
  fs.mkdirSync(SQL_OUTPUT_DIR, { recursive: true });
}

// 读取CSV文件
function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// 转义SQL字符串
function escapeSqlString(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// 生成客户数据SQL
function generateCustomerSql(customers) {
  const tenantId = 'demo-tenant';
  const lines = [];

  lines.push('-- DEMO客户数据表 - 插入脚本');
  lines.push('-- 生成时间: ' + new Date().toISOString());
  lines.push('-- 总记录数: ' + customers.length);
  lines.push('');

  lines.push('INSERT INTO `demo_customer_profiles` (');
  lines.push('  `id`, `tenant_id`, `name`, `gender`, `age`, `mobile`, `email`,');
  lines.push('  `registration_date`, `membership_level`, `points`, `total_spent`,');
  lines.push('  `last_purchase_date`, `created_at`, `updated_at`');
  lines.push(') VALUES');

  for (let i = 0; i < customers.length; i++) {
    const c = customers[i];
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const values = [
      escapeSqlString(c.id),
      escapeSqlString(tenantId),
      escapeSqlString(c.name),
      escapeSqlString(c.gender),
      c.age,
      escapeSqlString(c.mobile),
      escapeSqlString(c.email),
      escapeSqlString(c.registration_date),
      escapeSqlString(c.membership_level),
      c.points,
      parseFloat(c.total_spent).toFixed(2),
      c.last_purchase_date ? escapeSqlString(c.last_purchase_date) : 'NULL',
      `'${now}'`,
      `'${now}'`
    ];

    lines.push(`  (${values.join(', ')})${i < customers.length - 1 ? ',' : ';'}`);
  }

  return lines.join('\n');
}

// 生成消费记录SQL
function generatePurchaseSql(purchases) {
  const tenantId = 'demo-tenant';
  const lines = [];

  lines.push('-- DEMO消费记录表 - 插入脚本');
  lines.push('-- 生成时间: ' + new Date().toISOString());
  lines.push('-- 总记录数: ' + purchases.length);
  lines.push('');

  lines.push('INSERT INTO `demo_purchase_records` (');
  lines.push('  `id`, `customer_id`, `tenant_id`, `purchase_date`, `store_id`,');
  lines.push('  `product_category`, `product_name`, `quantity`, `unit_price`,');
  lines.push('  `total_amount`, `payment_method`, `created_at`');
  lines.push(') VALUES');

  for (let i = 0; i < purchases.length; i++) {
    const p = purchases[i];
    const purchaseDate = new Date(p.purchase_date).toISOString().slice(0, 19).replace('T', ' ');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const values = [
      escapeSqlString(p.id),
      escapeSqlString(p.customer_id),
      escapeSqlString(tenantId),
      `'${purchaseDate}'`,
      escapeSqlString(p.store_id),
      escapeSqlString(p.product_category),
      escapeSqlString(p.product_name),
      p.quantity,
      parseFloat(p.unit_price).toFixed(2),
      parseFloat(p.total_amount).toFixed(2),
      escapeSqlString(p.payment_method),
      `'${now}'`
    ];

    lines.push(`  (${values.join(', ')})${i < purchases.length - 1 ? ',' : ';'}`);
  }

  return lines.join('\n');
}

// 生成活动记录SQL
function generateActivitySql(activities) {
  const tenantId = 'demo-tenant';
  const lines = [];

  lines.push('-- DEMO活动记录表 - 插入脚本');
  lines.push('-- 生成时间: ' + new Date().toISOString());
  lines.push('-- 总记录数: ' + activities.length);
  lines.push('');

  lines.push('CREATE TABLE IF NOT EXISTS `demo_activity_records` (');
  lines.push('  `id` CHAR(36) NOT NULL,');
  lines.push('  `customer_id` CHAR(36) NOT NULL,');
  lines.push('  `tenant_id` CHAR(36) DEFAULT \'demo-tenant\',');
  lines.push('  `activity_type` VARCHAR(50) NOT NULL,');
  lines.push('  `activity_date` DATE NOT NULL,');
  lines.push('  `details` JSON,');
  lines.push('  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  INDEX `idx_customer_id` (`customer_id`),');
  lines.push('  INDEX `idx_activity_date` (`activity_date`)');
  lines.push(') COMMENT=\'DEMO活动记录表\';');
  lines.push('');

  lines.push('INSERT INTO `demo_activity_records` (');
  lines.push('  `id`, `customer_id`, `tenant_id`, `activity_type`, `activity_date`, `details`');
  lines.push(') VALUES');

  for (let i = 0; i < activities.length; i++) {
    const a = activities[i];

    const values = [
      escapeSqlString(a.id),
      escapeSqlString(a.customer_id),
      escapeSqlString(tenantId),
      escapeSqlString(a.activity_type),
      escapeSqlString(a.activity_date),
      escapeSqlString(a.details)
    ];

    lines.push(`  (${values.join(', ')})${i < activities.length - 1 ? ',' : ';'}`);
  }

  return lines.join('\n');
}

// 生成社交媒体记录SQL
function generateSocialSql(socials) {
  const tenantId = 'demo-tenant';
  const lines = [];

  lines.push('-- DEMO社交媒体互动表 - 插入脚本');
  lines.push('-- 生成时间: ' + new Date().toISOString());
  lines.push('-- 总记录数: ' + socials.length);
  lines.push('');

  lines.push('CREATE TABLE IF NOT EXISTS `demo_social_interactions` (');
  lines.push('  `id` CHAR(36) NOT NULL,');
  lines.push('  `customer_id` CHAR(36) NOT NULL,');
  lines.push('  `tenant_id` CHAR(36) DEFAULT \'demo-tenant\',');
  lines.push('  `platform` VARCHAR(50) NOT NULL,');
  lines.push('  `action_type` VARCHAR(50) NOT NULL,');
  lines.push('  `action_date` DATETIME NOT NULL,');
  lines.push('  `content_id` VARCHAR(100),');
  lines.push('  `content_title` VARCHAR(200),');
  lines.push('  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  INDEX `idx_customer_id` (`customer_id`),');
  lines.push('  INDEX `idx_action_date` (`action_date`),');
  lines.push('  INDEX `idx_platform` (`platform`)');
  lines.push(') COMMENT=\'DEMO社交媒体互动表\';');
  lines.push('');

  lines.push('INSERT INTO `demo_social_interactions` (');
  lines.push('  `id`, `customer_id`, `tenant_id`, `platform`, `action_type`, `action_date`, `content_id`, `content_title`');
  lines.push(') VALUES');

  for (let i = 0; i < socials.length; i++) {
    const s = socials[i];
    const actionDate = new Date(s.action_date).toISOString().slice(0, 19).replace('T', ' ');

    const values = [
      escapeSqlString(s.id),
      escapeSqlString(s.customer_id),
      escapeSqlString(tenantId),
      escapeSqlString(s.platform),
      escapeSqlString(s.action_type),
      `'${actionDate}'`,
      escapeSqlString(s.content_id),
      escapeSqlString(s.content_title)
    ];

    lines.push(`  (${values.join(', ')})${i < socials.length - 1 ? ',' : ';'}`);
  }

  return lines.join('\n');
}

// 主函数
async function main() {
  console.log('📤 开始导出SQL文件...');

  // 检查CSV文件是否存在
  if (!fs.existsSync(CUSTOMERS_CSV)) {
    console.error('❌ 客户数据CSV文件不存在，请先运行生成器');
    process.exit(1);
  }

  try {
    // 读取CSV文件
    console.log('正在读取数据文件...');
    const [customers, purchases, activities, socials] = await Promise.all([
      readCsv(CUSTOMERS_CSV),
      readCsv(PURCHASES_CSV),
      readCsv(ACTIVITIES_CSV),
      readCsv(SOCIAL_CSV),
    ]);

    console.log(`📊 数据统计: 客户=${customers.length}, 消费=${purchases.length}, 活动=${activities.length}, 社交=${socials.length}`);

    // 生成SQL
    console.log('正在生成SQL插入语句...');
    const customerSql = generateCustomerSql(customers);
    const purchaseSql = generatePurchaseSql(purchases);
    const activitySql = generateActivitySql(activities);
    const socialSql = generateSocialSql(socials);

    // 写入SQL文件
    fs.writeFileSync(CUSTOMERS_SQL, customerSql);
    fs.writeFileSync(PURCHASES_SQL, purchaseSql);
    fs.writeFileSync(ACTIVITIES_SQL, activitySql);
    fs.writeFileSync(SOCIAL_SQL, socialSql);

    console.log('✅ SQL文件已生成:');
    console.log(`   ${CUSTOMERS_SQL}`);
    console.log(`   ${PURCHASES_SQL}`);
    console.log(`   ${ACTIVITIES_SQL}`);
    console.log(`   ${SOCIAL_SQL}`);

    // 生成数据库初始化脚本
    const initScript = `-- LuminaMedia DEMO数据库初始化脚本
-- 生成时间: ${new Date().toISOString()}

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS \`lumina_demo\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`lumina_demo\`;

-- 2. 创建DEMO客户数据表
CREATE TABLE IF NOT EXISTS \`demo_customer_profiles\` (
    \`id\` CHAR(36) NOT NULL,
    \`tenant_id\` CHAR(36) DEFAULT 'demo-tenant',
    \`name\` VARCHAR(100) NOT NULL,
    \`gender\` ENUM('M', 'F') NOT NULL,
    \`age\` INT NOT NULL,
    \`mobile\` VARCHAR(20) NOT NULL,
    \`email\` VARCHAR(100),
    \`registration_date\` DATE NOT NULL,
    \`membership_level\` ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    \`points\` INT DEFAULT 0,
    \`total_spent\` DECIMAL(10, 2) DEFAULT 0.00,
    \`last_purchase_date\` DATE,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    INDEX \`idx_tenant_id\` (\`tenant_id\`),
    INDEX \`idx_membership_level\` (\`membership_level\`),
    INDEX \`idx_last_purchase_date\` (\`last_purchase_date\`)
) COMMENT='DEMO客户数据表';

-- 3. 创建DEMO消费记录表
CREATE TABLE IF NOT EXISTS \`demo_purchase_records\` (
    \`id\` CHAR(36) NOT NULL,
    \`customer_id\` CHAR(36) NOT NULL,
    \`tenant_id\` CHAR(36) DEFAULT 'demo-tenant',
    \`purchase_date\` DATETIME NOT NULL,
    \`store_id\` VARCHAR(50) NOT NULL,
    \`product_category\` VARCHAR(100) NOT NULL,
    \`product_name\` VARCHAR(200) NOT NULL,
    \`quantity\` INT NOT NULL,
    \`unit_price\` DECIMAL(10, 2) NOT NULL,
    \`total_amount\` DECIMAL(10, 2) NOT NULL,
    \`payment_method\` ENUM('alipay', 'wechat', 'card', 'cash') NOT NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    INDEX \`idx_customer_id\` (\`customer_id\`),
    INDEX \`idx_purchase_date\` (\`purchase_date\`),
    INDEX \`idx_product_category\` (\`product_category\`),
    FOREIGN KEY (\`customer_id\`) REFERENCES \`demo_customer_profiles\`(\`id\`) ON DELETE CASCADE
) COMMENT='DEMO消费记录表';

-- 4. 运行插入脚本（请依次执行以下脚本）
--    source ${path.relative(OUTPUT_DIR, CUSTOMERS_SQL).replace(/\\/g, '/')};
--    source ${path.relative(OUTPUT_DIR, PURCHASES_SQL).replace(/\\/g, '/')};
--    source ${path.relative(OUTPUT_DIR, ACTIVITIES_SQL).replace(/\\/g, '/')};
--    source ${path.relative(OUTPUT_DIR, SOCIAL_SQL).replace(/\\/g, '/')};

SELECT 'DEMO数据库初始化完成!' AS message;
`;

    const initScriptPath = path.join(SQL_OUTPUT_DIR, '00-init-database.sql');
    fs.writeFileSync(initScriptPath, initScript);
    console.log(`   ${initScriptPath}`);

    console.log('\n🎉 SQL导出完成！');
    console.log('\n📝 使用方法:');
    console.log('   1. 启动MySQL数据库');
    console.log('   2. 运行初始化脚本: mysql -u root -p < output/sql/00-init-database.sql');
    console.log('   3. 依次导入数据文件');
    console.log('   4. 或者使用MySQL source命令导入各个SQL文件');

  } catch (error) {
    console.error('❌ 导出过程中发生错误:', error);
    process.exit(1);
  }
}

// 执行主函数
main().catch(console.error);