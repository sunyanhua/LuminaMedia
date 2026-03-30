#!/usr/bin/env node
/**
 * DEMO健康检查脚本
 * 检查DEMO环境各项服务健康状况
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('==========================================');
console.log('    DEMO健康检查脚本');
console.log('==========================================\n');

// 检查函数
function checkService(name, url, timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const req = http.request(url, { timeout }, (res) => {
            const duration = Date.now() - startTime;
            if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve({ success: true, duration, statusCode: res.statusCode });
            } else {
                resolve({ success: false, duration, statusCode: res.statusCode, error: `HTTP ${res.statusCode}` });
            }
        });

        req.on('error', (error) => {
            const duration = Date.now() - startTime;
            resolve({ success: false, duration, error: error.message });
        });

        req.on('timeout', () => {
            const duration = Date.now() - startTime;
            req.destroy();
            resolve({ success: false, duration, error: '请求超时' });
        });

        req.end();
    });
}

function checkContainer(name) {
    try {
        const output = execSync(`docker ps --filter "name=${name}" --format "{{.Status}}"`, { encoding: 'utf8' }).trim();
        return { success: output.includes('Up'), status: output };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function checkDatabase(container, user, pass, db) {
    try {
        execSync(`docker exec ${container} mysql -u ${user} -p${pass} -e "SELECT 1;" ${db}`, { stdio: 'pipe' });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function runChecks() {
    const checks = [];

    console.log('1. 检查容器运行状态...\n');

    // 容器检查
    const containers = [
        { name: '商务版API', container: 'lumina-demo-business' },
        { name: '政务版API', container: 'lumina-demo-government' },
        { name: '商务版数据库', container: 'lumina-demo-db' },
        { name: '政务版数据库', container: 'lumina-gov-db' },
        { name: '前端服务', container: 'lumina-demo-frontend' },
    ];

    for (const { name, container } of containers) {
        const result = checkContainer(container);
        checks.push({ type: 'container', name, container, ...result });

        if (result.success) {
            console.log(`   ✓ ${name} (${container}): ${result.status}`);
        } else {
            console.log(`   ✗ ${name} (${container}): ${result.error || '未运行'}`);
        }
    }

    console.log('\n2. 检查服务健康端点...\n');

    // 服务检查
    const services = [
        { name: '商务版API', url: 'http://localhost:3004/health' },
        { name: '政务版API', url: 'http://localhost:3005/health' },
        { name: '前端服务', url: 'http://localhost:5175' },
    ];

    for (const { name, url } of services) {
        const result = await checkService(name, url);
        checks.push({ type: 'service', name, url, ...result });

        if (result.success) {
            console.log(`   ✓ ${name}: 响应时间 ${result.duration}ms, 状态码 ${result.statusCode}`);
        } else {
            console.log(`   ✗ ${name}: ${result.error} (${result.duration}ms)`);
        }
    }

    console.log('\n3. 检查数据库连接...\n');

    // 数据库检查
    const databases = [
        { name: '商务版数据库', container: 'lumina-demo-db', user: 'demo_user', pass: 'demo_password', db: 'lumina_demo' },
        { name: '政务版数据库', container: 'lumina-gov-db', user: 'gov_user', pass: 'gov_password', db: 'lumina_gov' },
    ];

    for (const { name, container, user, pass, db } of databases) {
        const result = checkDatabase(container, user, pass, db);
        checks.push({ type: 'database', name, container, db, ...result });

        if (result.success) {
            console.log(`   ✓ ${name}: 连接正常`);
        } else {
            console.log(`   ✗ ${name}: ${result.error}`);
        }
    }

    console.log('\n4. 检查详细健康信息...\n');

    // 详细健康检查
    try {
        console.log('商务版API详细健康信息:');
        const bizHealth = execSync('curl -s http://localhost:3004/health/db', { encoding: 'utf8' });
        console.log('   ' + bizHealth.trim().replace(/\n/g, '\n   '));
    } catch (error) {
        console.log('   ✗ 无法获取商务版详细健康信息');
    }

    console.log('');
    try {
        console.log('政务版API详细健康信息:');
        const govHealth = execSync('curl -s http://localhost:3005/health/db', { encoding: 'utf8' });
        console.log('   ' + govHealth.trim().replace(/\n/g, '\n   '));
    } catch (error) {
        console.log('   ✗ 无法获取政务版详细健康信息');
    }

    // 生成报告
    console.log('\n==========================================');
    console.log('   健康检查报告');
    console.log('==========================================\n');

    const totalChecks = checks.length;
    const passedChecks = checks.filter(c => c.success).length;
    const failedChecks = totalChecks - passedChecks;

    console.log(`检查总数: ${totalChecks}`);
    console.log(`通过检查: ${passedChecks}`);
    console.log(`失败检查: ${failedChecks}`);
    console.log(`通过率: ${((passedChecks / totalChecks) * 100).toFixed(1)}%\n`);

    if (failedChecks > 0) {
        console.log('失败详情:');
        checks.filter(c => !c.success).forEach(check => {
            console.log(`  - ${check.name}: ${check.error || check.status || '未知错误'}`);
        });
        console.log('');
    }

    // 总结
    if (failedChecks === 0) {
        console.log('✅ 所有健康检查通过! DEMO环境运行正常。\n');
        console.log('访问地址:');
        console.log('- DEMO前端: http://localhost:5175');
        console.log('- 商务版API文档: http://localhost:3004/api/docs');
        console.log('- 政务版API文档: http://localhost:3005/api/docs');
    } else if (failedChecks <= 2) {
        console.log('⚠️ DEMO环境基本正常，但有少量问题需要关注。\n');
        console.log('建议检查:');
        console.log('1. 确保所有容器正常运行');
        console.log('2. 检查端口是否被占用');
        console.log('3. 查看服务日志: docker-compose -f docker-compose.demo.yml logs');
    } else {
        console.log('❌ DEMO环境存在较多问题，需要修复。\n');
        console.log('修复建议:');
        console.log('1. 重启DEMO服务: docker-compose -f docker-compose.demo.yml restart');
        console.log('2. 查看详细日志: docker-compose -f docker-compose.demo.yml logs -f');
        console.log('3. 重新部署: ./scripts/demo/deploy-demo.sh');
        process.exit(1);
    }

    console.log('\n管理命令:');
    console.log('- 重启服务: docker-compose -f docker-compose.demo.yml restart');
    console.log('- 查看日志: docker-compose -f docker-compose.demo.yml logs -f');
    console.log('- 停止服务: docker-compose -f docker-compose.demo.yml down');
    console.log('- 重置数据: npm run demo:reset');
    console.log('');
}

// 运行检查
runChecks().catch(error => {
    console.error('健康检查过程出错:', error.message);
    process.exit(1);
});