import { test, expect } from '@playwright/test';

// 测试路由矩阵
const routes = [
  { path: '/', name: '首页' },
  { path: '/dashboard', name: '仪表盘' },
  { path: '/analytics', name: '数据分析' },
  { path: '/matrix', name: '新媒体矩阵' },
  { path: '/ai-strategy', name: 'AI智策中心' },
  { path: '/governance', name: '发稿审核' },
];

// 响应式设备矩阵 - 与playwright.config.ts中的项目对应
const devices = [
  { name: 'mobile-small', width: 375, height: 667 },
  { name: 'mobile-large', width: 430, height: 932 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

// 响应式设计验收测试
test.describe('响应式设计全面验收', () => {
  // 对每个路由进行测试
  routes.forEach((route) => {
    test.describe(`路由: ${route.name} (${route.path})`, () => {
      // 对每个设备尺寸进行测试
      devices.forEach((device) => {
        test(`应在 ${device.name} (${device.width}x${device.height}) 上正确显示`, async ({ page }) => {
          // 设置视口尺寸
          await page.setViewportSize({ width: device.width, height: device.height });

          // 导航到路由
          await page.goto(route.path);

          // 等待页面加载完成
          await page.waitForLoadState('networkidle');

          // 验证页面标题存在
          await expect(page).toHaveTitle(/LuminaMedia|灵曜智媒/);

          // 验证页面已加载 - 检查body是否可见
          await expect(page.locator('body')).toBeVisible();

          // 验证无显著横向滚动条（响应式设计基本要求，允许1像素误差）
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
          });
          expect(hasHorizontalScroll).toBe(false);

          // 验证关键UI元素可见 - 根据实际页面结构调整
          const criticalElements = [
            'header', 'nav', 'main',
            'button', 'a[href]', 'img[alt]',
          ];

          for (const selector of criticalElements) {
            const elements = page.locator(selector);
            const count = await elements.count();
            if (count > 0) {
              await expect(elements.first()).toBeVisible();
            }
          }

          // 截取屏幕截图用于视觉回归测试
          await page.screenshot({
            path: `test-results/screenshots/${route.name.replace(/\s+/g, '-')}-${device.name}.png`,
            fullPage: true,
          });
        });
      });

      // 无障碍访问性测试
      test('应满足基本的无障碍访问性要求', async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        // 检查页面有正确的lang属性
        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBe('zh-CN');

        // 检查图片有alt属性
        const imagesWithoutAlt = await page.$$eval('img', (imgs) =>
          imgs.filter(img => !img.hasAttribute('alt') || img.getAttribute('alt') === '').length
        );
        expect(imagesWithoutAlt).toBe(0);

        // 检查表单元素有标签（如果有表单元素）
        const formInputs = await page.$$('input, textarea, select');
        if (formInputs.length > 0) {
          const formInputsWithoutLabels = await page.$$eval('input, textarea, select', (elements) =>
            elements.filter(el => {
              const id = el.id;
              if (!id) return true;
              const label = document.querySelector(`label[for="${id}"]`);
              return !label;
            }).length
          );
          expect(formInputsWithoutLabels).toBe(0);
        }

        // 检查颜色对比度（基本检查）
        // 注意：完整的颜色对比度检查需要专用工具
      });
    });
  });

  // 跨设备一致性测试
  test.describe('跨设备一致性', () => {
    test('主要布局元素应在所有设备上保持一致', async ({ page }) => {
      const layoutSelectors = [
        'header', 'nav', 'main',
        'button', 'a[href]',
      ];

      // 收集每个设备上的元素可见性状态
      const deviceLayoutStatus: Record<string, Record<string, boolean>> = {};

      for (const device of devices) {
        await page.setViewportSize({ width: device.width, height: device.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        deviceLayoutStatus[device.name] = {};

        for (const selector of layoutSelectors) {
          const element = page.locator(selector).first();
          const isVisible = await element.isVisible().catch(() => false);
          deviceLayoutStatus[device.name][selector] = isVisible;
        }
      }

      // 验证布局一致性：同一元素在所有设备上要么都可见，要么都不可见
      for (const selector of layoutSelectors) {
        const visibilitySet = new Set<boolean>();
        for (const device of devices) {
          visibilitySet.add(deviceLayoutStatus[device.name][selector]);
        }
        // 允许最多一种状态（全部可见或全部不可见）
        expect(visibilitySet.size).toBeLessThanOrEqual(1);
      }
    });
  });

  // 触摸交互测试（移动设备）
  test.describe('移动端触摸交互', () => {
    test('移动设备上的触摸目标应足够大', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // 小屏手机
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 检查所有按钮和链接的最小尺寸
      const touchElements = await page.$$eval('button, a[href], input[type="button"], input[type="submit"]', (elements) =>
        elements.map(el => {
          const rect = el.getBoundingClientRect();
          return {
            tagName: el.tagName,
            text: el.textContent?.trim() || '',
            width: rect.width,
            height: rect.height,
            minSize: Math.min(rect.width, rect.height),
          };
        })
      );

      // WCAG要求触摸目标至少44x44像素
      const smallTargets = touchElements.filter(el => el.minSize < 44);
      expect(smallTargets.length).toBe(0);
    });
  });
});