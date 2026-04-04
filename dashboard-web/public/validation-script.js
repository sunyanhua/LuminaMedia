/**
 * LuminaMedia 2.0 前端功能验证脚本
 *
 * 此脚本用于验证第四阶段前端适配任务的完成情况
 */

console.log('🔍 开始验证 LuminaMedia 2.0 前端功能...');

// 验证函数定义
const validateFeatures = () => {
  console.log('\n📋 验证任务清单：');

  // 1. 检查版本选择界面
  const checkVersionSelector = () => {
    const versionSelectorExists = document.querySelector('[data-testid="version-selector"]') ||
                                  document.querySelector('.version-selector') ||
                                  document.querySelector('div').querySelector('button[data-testid*="business"]') ||
                                  document.querySelector('button[data-testid*="government"]');

    const businessBtn = document.querySelector('button')?.textContent?.includes('商务版') ||
                       document.querySelector('button')?.textContent?.includes('进入商务版');
    const governmentBtn = document.querySelector('button')?.textContent?.includes('政务版') ||
                         document.querySelector('button')?.textContent?.includes('进入政务版');

    console.log(`✅ 版本选择界面: ${versionSelectorExists || businessBtn || governmentBtn ? '已找到' : '未找到'}`);
    return versionSelectorExists || businessBtn || governmentBtn;
  };

  // 2. 检查演示环境横幅
  const checkDemoBanner = () => {
    const banner = document.querySelector('[data-testid="demo-banner"]') ||
                   document.querySelector('.demo-banner') ||
                   document.querySelector('.bg-blue-900') ||
                   document.querySelector('div')?.textContent?.includes('演示环境');

    console.log(`✅ 演示环境横幅: ${banner ? '已找到' : '未找到'}`);
    return !!banner;
  };

  // 3. 检查配额显示组件
  const checkQuotaDisplay = () => {
    const quotaComponents = document.querySelectorAll('[data-testid*="quota"]') ||
                           document.querySelectorAll('.quota-display') ||
                           document.querySelectorAll('.progress') ||
                           document.querySelectorAll('div')?.length > 0;

    // 检查是否存在配额相关元素
    let hasQuotaElements = false;
    const allDivs = document.querySelectorAll('div');
    for (let div of allDivs) {
      if (div.textContent?.includes('AI调用') ||
          div.textContent?.includes('内容发布') ||
          div.textContent?.includes('数据导入')) {
        hasQuotaElements = true;
        break;
      }
    }

    console.log(`✅ 配额显示组件: ${hasQuotaElements ? '已找到' : '未找到'}`);
    return hasQuotaElements;
  };

  // 4. 检查重置演示按钮
  const checkResetButton = () => {
    const resetButtons = Array.from(document.querySelectorAll('button'))
      .some(btn => btn.textContent?.includes('重置演示') ||
                   btn.textContent?.includes('重置数据'));

    console.log(`✅ 演示重置按钮: ${resetButtons ? '已找到' : '未找到'}`);
    return resetButtons;
  };

  // 5. 检查功能配置管理界面
  const checkFeatureConfig = () => {
    // 检查是否存在功能配置相关的路由或页面元素
    const isInFeatureConfig = window.location.pathname.includes('/admin/feature-config') ||
                             document.querySelector('h1')?.textContent?.includes('功能配置') ||
                             document.querySelector('h1')?.textContent?.includes('功能配置管理');

    console.log(`✅ 功能配置管理界面: ${isInFeatureConfig ? '已找到' : '未找到 (预期在 /admin/feature-config 路径下)'}`);
    return isInFeatureConfig;
  };

  // 6. 检查租户功能管理界面
  const checkTenantFeature = () => {
    const isInTenantFeature = window.location.pathname.includes('/admin/tenant-feature') ||
                             document.querySelector('h1')?.textContent?.includes('租户功能') ||
                             document.querySelector('h1')?.textContent?.includes('租户功能管理');

    console.log(`✅ 租户功能管理界面: ${isInTenantFeature ? '已找到' : '未找到 (预期在 /admin/tenant-feature 路径下)'}`);
    return isInTenantFeature;
  };

  // 7. 检查配额管理界面
  const checkQuotaManagement = () => {
    const isInQuotaManagement = window.location.pathname.includes('/admin/quota') ||
                               document.querySelector('h1')?.textContent?.includes('配额') ||
                               document.querySelector('h1')?.textContent?.includes('配额管理');

    console.log(`✅ 配额管理界面: ${isInQuotaManagement ? '已找到' : '未找到 (预期在 /admin/quota-management 或 /admin/quota-config 路径下)'}`);
    return isInQuotaManagement;
  };

  // 8. 检查响应式设计
  const checkResponsiveness = () => {
    // 简单检查是否有响应式相关的CSS类
    const hasResponsiveClasses = document.querySelector('[class*="mobile"]') ||
                                 document.querySelector('[class*="xs:"]') ||
                                 document.querySelector('[class*="sm:"]') ||
                                 document.querySelector('[class*="md:"]') ||
                                 document.querySelector('[class*="lg:"]') ||
                                 document.querySelector('[class*="xl:"]');

    console.log(`✅ 响应式设计基础: ${hasResponsiveClasses ? '已找到响应式类' : '未找到明显的响应式类'}`);
    return !!hasResponsiveClasses;
  };

  // 9. 检查导航组件中的动态菜单
  const checkDynamicMenu = () => {
    const menuItems = document.querySelectorAll('nav a') ||
                     document.querySelectorAll('nav link') ||
                     document.querySelectorAll('.sidebar')?.[0]?.querySelectorAll('a');

    const hasMenu = menuItems && menuItems.length > 0;
    console.log(`✅ 动态菜单加载: ${hasMenu ? '已找到菜单项' : '未找到菜单项'}`);
    return hasMenu;
  };

  // 执行验证
  const results = {
    versionSelector: checkVersionSelector(),
    demoBanner: checkDemoBanner(),
    quotaDisplay: checkQuotaDisplay(),
    resetButton: checkResetButton(),
    featureConfig: checkFeatureConfig(),
    tenantFeature: checkTenantFeature(),
    quotaManagement: checkQuotaManagement(),
    responsiveness: checkResponsiveness(),
    dynamicMenu: checkDynamicMenu()
  };

  // 计算完成率
  const completed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  const completionRate = (completed / total) * 100;

  console.log(`\n📊 验证结果总结:`);
  console.log(`   完成项目: ${completed}/${total}`);
  console.log(`   完成率: ${completionRate.toFixed(1)}%`);

  if (completionRate >= 80) {
    console.log(`\n🎉 前端适配任务基本完成！`);
    console.log(`   您已成功实现核心功能，包括版本选择、演示横幅、配额显示等关键组件。`);
  } else {
    console.log(`\n⚠️  还有一些功能需要实现或验证，请检查未完成的项目。`);
  }

  return results;
};

// 运行验证
try {
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validateFeatures);
  } else {
    validateFeatures();
  }
} catch (error) {
  console.error('❌ 验证过程中出现错误:', error);
}

console.log('\n💡 提示：如果某些组件未被检测到，请确保您在正确的页面路径上运行此脚本。');