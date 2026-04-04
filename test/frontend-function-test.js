/**
 * LuminaMedia 2.0 前端功能测试脚本
 *
 * 此脚本用于验证前端功能，包括演示环境标识、配额显示、动态菜单等
 */

// 前端功能测试类
class FrontendTester {
  constructor() {
    this.results = {
      demoBanner: false,
      quotaDisplay: false,
      dynamicMenu: false,
      versionSelector: false,
      resetFunction: false,
      responsiveDesign: false
    };
  }

  // 检查演示环境横幅
  testDemoBanner() {
    console.log('\n🔍 演示环境横幅测试...');

    // 检查横幅元素
    const banner = document.querySelector('.demo-banner') ||
                  document.querySelector('[data-testid="demo-banner"]') ||
                  Array.from(document.querySelectorAll('div')).find(div =>
                    div.textContent?.includes('演示环境') ||
                    div.classList.contains('bg-blue-900')
                  );

    if (banner) {
      console.log('✅ 演示环境横幅存在');
      this.results.demoBanner = true;
    } else {
      console.log('❌ 未找到演示环境横幅');
    }
  }

  // 检查配额显示组件
  testQuotaDisplay() {
    console.log('\n🔍 配额显示组件测试...');

    // 查找配额相关的元素
    const quotaElements = Array.from(document.querySelectorAll('*')).filter(el =>
      el.textContent?.includes('AI调用') ||
      el.textContent?.includes('内容发布') ||
      el.textContent?.includes('数据导入') ||
      el.querySelector('.progress') ||
      el.classList.contains('quota-display')
    );

    if (quotaElements.length > 0) {
      console.log(`✅ 发现 ${quotaElements.length} 个配额相关元素`);
      this.results.quotaDisplay = true;
    } else {
      console.log('❌ 未找到配额显示组件');
    }
  }

  // 检查动态菜单
  testDynamicMenu() {
    console.log('\n🔍 动态菜单加载测试...');

    // 查找侧边栏菜单
    const sidebar = document.querySelector('.sidebar') ||
                   document.querySelector('[data-testid="sidebar"]') ||
                   document.querySelector('nav');

    if (sidebar) {
      const menuItems = sidebar.querySelectorAll('a, button');
      console.log(`✅ 发现侧边栏，包含 ${menuItems.length} 个菜单项`);

      // 检查是否包含动态内容
      const hasDynamicContent = Array.from(menuItems).some(item =>
        item.textContent?.includes('AI智策') ||
        item.textContent?.includes('矩阵') ||
        item.textContent?.includes('分析')
      );

      if (hasDynamicContent) {
        console.log('✅ 包含动态菜单内容');
        this.results.dynamicMenu = true;
      } else {
        console.log('⚠️ 未检测到动态菜单内容');
      }
    } else {
      console.log('❌ 未找到侧边栏菜单');
    }
  }

  // 检查版本选择功能
  testVersionSelector() {
    console.log('\n🔍 版本选择功能测试...');

    const versionButtons = Array.from(document.querySelectorAll('button, a')).filter(el =>
      el.textContent?.includes('商务版') ||
      el.textContent?.includes('政务版') ||
      el.textContent?.includes('进入')
    );

    if (versionButtons.length >= 2) {
      console.log(`✅ 发现 ${versionButtons.length} 个版本选择按钮`);
      this.results.versionSelector = true;
    } else {
      console.log('❌ 版本选择功能不完整');
    }
  }

  // 检查重置功能
  testResetFunction() {
    console.log('\n🔍 演示数据重置功能测试...');

    const resetButtons = Array.from(document.querySelectorAll('button')).filter(el =>
      el.textContent?.toLowerCase().includes('重置') ||
      el.textContent?.toLowerCase().includes('reset') ||
      el.innerHTML.toLowerCase().includes('reset') ||
      el.title?.toLowerCase().includes('重置')
    );

    if (resetButtons.length > 0) {
      console.log(`✅ 发现 ${resetButtons.length} 个重置相关按钮`);
      this.results.resetFunction = true;
    } else {
      console.log('❌ 未找到重置功能按钮');
    }
  }

  // 检查响应式设计
  testResponsiveDesign() {
    console.log('\n🔍 响应式设计测试...');

    // 检查CSS类中的响应式断点
    let hasResponsiveClasses = false;
    const allElements = document.querySelectorAll('*');

    for (let el of allElements) {
      const classes = el.className || '';
      if (classes.includes('mobile:') ||
          classes.includes('xs:') ||
          classes.includes('sm:') ||
          classes.includes('md:') ||
          classes.includes('lg:') ||
          classes.includes('xl:')) {
        hasResponsiveClasses = true;
        break;
      }
    }

    // 检查meta viewport标签
    const viewport = document.querySelector('meta[name="viewport"]');

    if (hasResponsiveClasses || viewport) {
      console.log('✅ 检测到响应式设计元素');
      this.results.responsiveDesign = true;
    } else {
      console.log('❌ 未检测到响应式设计元素');
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log('📱 开始 LuminaMedia 2.0 前端功能测试...\n');

    this.testDemoBanner();
    this.testQuotaDisplay();
    this.testDynamicMenu();
    this.testVersionSelector();
    this.testResetFunction();
    this.testResponsiveDesign();

    // 输出测试结果
    console.log('\n📊 前端功能测试结果:');
    console.log(`演示环境横幅: ${this.results.demoBanner ? '✅' : '❌'}`);
    console.log(`配额显示组件: ${this.results.quotaDisplay ? '✅' : '❌'}`);
    console.log(`动态菜单加载: ${this.results.dynamicMenu ? '✅' : '❌'}`);
    console.log(`版本选择功能: ${this.results.versionSelector ? '✅' : '❌'}`);
    console.log(`重置功能: ${this.results.resetFunction ? '✅' : '❌'}`);
    console.log(`响应式设计: ${this.results.responsiveDesign ? '✅' : '❌'}`);

    const completedTests = Object.values(this.results).filter(r => r).length;
    const totalTests = Object.keys(this.results).length;
    const completionRate = (completedTests / totalTests) * 100;

    console.log(`\n📈 完成率: ${completedTests}/${totalTests} (${completionRate.toFixed(1)}%)`);

    if (completionRate >= 80) {
      console.log('🎉 前端功能测试基本通过！');
    } else {
      console.log('⚠️  建议检查未通过的测试项目。');
    }

    return this.results;
  }
}

// 页面加载完成后运行测试
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      const tester = new FrontendTester();
      await tester.runAllTests();
    });
  } else {
    const tester = new FrontendTester();
    tester.runAllTests();
  }
} else {
  console.log('⚠️ 此脚本需要在浏览器环境中运行');
}

export default FrontendTester;