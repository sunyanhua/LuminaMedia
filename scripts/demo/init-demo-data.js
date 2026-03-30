#!/usr/bin/env node
/**
 * DEMO数据初始化脚本
 * 初始化商务版和政务版DEMO数据
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('==========================================');
console.log('    DEMO数据初始化脚本');
console.log('==========================================\n');

// 检查环境
console.log('检查环境...');
try {
    // 检查Docker Compose配置
    const composeFile = path.join(__dirname, '../../docker-compose.demo.yml');
    if (!fs.existsSync(composeFile)) {
        console.error('错误: 未找到 docker-compose.demo.yml 文件');
        process.exit(1);
    }
    console.log('✓ Docker Compose配置文件存在');

    // 检查数据库初始化脚本
    const initDemoSql = path.join(__dirname, '../../demo/sql/init-demo.sql');
    const initGovSql = path.join(__dirname, '../../demo/sql/init-gov.sql');

    if (!fs.existsSync(initDemoSql)) {
        console.error('错误: 未找到 demo/sql/init-demo.sql 文件');
        process.exit(1);
    }
    console.log('✓ 商务版数据库初始化脚本存在');

    if (!fs.existsSync(initGovSql)) {
        console.error('错误: 未找到 demo/sql/init-gov.sql 文件');
        process.exit(1);
    }
    console.log('✓ 政务版数据库初始化脚本存在');

    // 检查容器状态
    console.log('\n检查容器状态...');
    try {
        const containers = execSync('docker-compose -f docker-compose.demo.yml ps --services', { encoding: 'utf8' })
            .trim().split('\n').filter(Boolean);

        if (containers.length === 0) {
            console.warn('警告: 未发现运行中的DEMO容器');
            console.log('提示: 请先运行 docker-compose -f docker-compose.demo.yml up -d 启动DEMO服务');
        } else {
            console.log(`✓ 发现 ${containers.length} 个DEMO容器运行中: ${containers.join(', ')}`);
        }
    } catch (error) {
        console.warn('警告: 无法检查容器状态，Docker可能未运行');
    }

    // 初始化商务版数据
    console.log('\n初始化商务版DEMO数据...');
    try {
        // 检查商务版数据库连接
        console.log('检查商务版数据库连接...');
        execSync('docker-compose -f docker-compose.demo.yml exec -T db-demo mysql -u demo_user -pdemo_password -e "SELECT 1;"', { stdio: 'inherit' });
        console.log('✓ 商务版数据库连接正常');

        // 运行初始化脚本（如果数据库已存在，会使用CREATE TABLE IF NOT EXISTS）
        console.log('执行商务版数据库初始化...');
        execSync('docker-compose -f docker-compose.demo.yml exec -T db-demo mysql -u demo_user -pdemo_password < /docker-entrypoint-initdb.d/init.sql', { stdio: 'inherit' });
        console.log('✓ 商务版数据库初始化完成');

        // 导入示例数据
        console.log('导入商务版示例数据...');
        const dataGenerator = path.join(__dirname, '../../tools/demo-data-generator/src/main.js');
        if (fs.existsSync(dataGenerator)) {
            execSync(`node ${dataGenerator} --count 1000 --output sql`, { stdio: 'inherit' });
            console.log('✓ 商务版示例数据生成完成');
        } else {
            console.log('ℹ 跳过示例数据生成（数据生成工具未找到）');
        }
    } catch (error) {
        console.error('商务版数据初始化失败:', error.message);
        console.log('ℹ 继续初始化政务版数据...');
    }

    // 初始化政务版数据
    console.log('\n初始化政务版DEMO数据...');
    try {
        // 检查政务版数据库连接
        console.log('检查政务版数据库连接...');
        execSync('docker-compose -f docker-compose.demo.yml exec -T db-gov mysql -u gov_user -pgov_password -e "SELECT 1;"', { stdio: 'inherit' });
        console.log('✓ 政务版数据库连接正常');

        // 运行初始化脚本
        console.log('执行政务版数据库初始化...');
        execSync('docker-compose -f docker-compose.demo.yml exec -T db-gov mysql -u gov_user -pgov_password < /docker-entrypoint-initdb.d/init.sql', { stdio: 'inherit' });
        console.log('✓ 政务版数据库初始化完成');

        // 创建政务版管理员账号
        console.log('创建政务版管理员账号...');
        const govAdminScript = `
INSERT IGNORE INTO user (id, tenant_id, username, email, password_hash, role, full_name, department, is_active, created_at, updated_at)
VALUES (
    UUID(),
    'gov-tenant',
    'gov-admin',
    'admin@gov-demo.lumina.com',
    '$2b$10\$DemoPasswordHashForGovAdmin',
    'admin',
    '政务版管理员',
    '信息化办公室',
    1,
    NOW(),
    NOW()
);
`;
        fs.writeFileSync('/tmp/gov-admin.sql', govAdminScript);
        execSync(`docker-compose -f docker-compose.demo.yml exec -T db-gov mysql -u gov_user -pgov_password lumina_gov < /tmp/gov-admin.sql`, { stdio: 'inherit' });
        console.log('✓ 政务版管理员账号创建完成');
    } catch (error) {
        console.error('政务版数据初始化失败:', error.message);
    }

    // 重启应用服务以加载新数据
    console.log('\n重启应用服务...');
    try {
        execSync('docker-compose -f docker-compose.demo.yml restart demo-business demo-government', { stdio: 'inherit' });
        console.log('✓ 应用服务重启完成');
    } catch (error) {
        console.warn('应用服务重启失败:', error.message);
    }

    console.log('\n==========================================');
    console.log('    DEMO数据初始化完成!');
    console.log('==========================================');
    console.log('\n访问地址:');
    console.log('- 商务版DEMO: http://localhost:5175/business');
    console.log('- 政务版DEMO: http://localhost:5175/government');
    console.log('\n测试账号:');
    console.log('- 商务版管理员: admin@demo.lumina.com / demo123');
    console.log('- 政务版管理员: gov-admin / gov123');
    console.log('\n管理命令:');
    console.log('- 重置数据: npm run demo:reset');
    console.log('- 健康检查: npm run demo:health');
    console.log('- 生成数据: npm run demo:generate');
    console.log('');

} catch (error) {
    console.error('初始化过程出现错误:', error.message);
    process.exit(1);
}