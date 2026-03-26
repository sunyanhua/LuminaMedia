# Mobile-First 开发指南

## 概述

LuminaMedia 2.0 采用 **Mobile-First（移动优先）** 设计策略，确保应用在移动设备上提供最佳用户体验，同时优雅地适配平板和桌面设备。本指南详细介绍了移动优先开发的原则、技术实现和最佳实践。

### 设计哲学

1. **移动优先**: 先为移动设备设计，再逐步增强大屏体验
2. **渐进增强**: 从小屏幕开始，逐步添加大屏幕专属功能
3. **触控优先**: 优先考虑触摸交互，兼容鼠标操作
4. **性能优先**: 移动端性能优化是首要考虑
5. **微信友好**: 确保在微信内置浏览器完美运行

### 技术栈概览

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.3.1 | UI框架 |
| **Vite** | 5.4.8 | 构建工具 |
| **TypeScript** | 5.5.3 | 类型安全 |
| **Tailwind CSS** | 3.4.13 | 原子化CSS |
| **Ant Design Mobile** | 5.42.3 | 移动端组件库 |
| **Recharts** | 2.12.7 | 图表库（移动优化） |
| **React Router** | 7.13.1 | 路由管理 |

## 响应式设计

### 1. 断点系统

基于Tailwind CSS的移动优先断点系统：

```css
/* 断点定义（从小到大） */
xs: 375px    /* 小手机屏幕 */
sm: 640px    /* 手机 */
md: 768px    /* 平板 */
lg: 1024px   /* 小桌面 */
xl: 1280px   /* 桌面 */
2xl: 1536px  /* 大桌面 */
projector: 1920px  /* 投屏模式 */
4k: 3840px   /* 4K屏幕 */
```

### 2. 响应式实用类

使用Tailwind CSS的响应式前缀：

```tsx
<div className="
  p-4          /* 所有屏幕：padding 1rem */
  md:p-6       /* 平板及以上：padding 1.5rem */
  lg:p-8       /* 桌面及以上：padding 2rem */
">
  <!-- 内容 -->
</div>
```

### 3. 移动优先CSS编写

```css
/* 错误：桌面优先 */
.container {
  padding: 2rem; /* 桌面 */
}

@media (max-width: 768px) {
  .container {
    padding: 1rem; /* 移动端覆盖 */
  }
}

/* 正确：移动优先 */
.container {
  padding: 1rem; /* 移动端 */
}

@media (min-width: 768px) {
  .container {
    padding: 2rem; /* 平板及以上 */
  }
}
```

## 移动端组件库

### 1. Ant Design Mobile 集成

已安装并配置 `antd-mobile` 组件库：

```tsx
import { Button, Dialog, Toast, List } from 'antd-mobile';
import {
  DownlandOutline,
  RedoOutline,
  EyeOutline,
  EyeInvisibleOutline
} from 'antd-mobile-icons';

// 使用示例
<Button
  color="primary"
  size="large"
  loading={isLoading}
  onClick={handleClick}
>
  <DownloadOutline /> 下载
</Button>
```

### 2. 自定义移动端组件

项目已实现以下移动端专用组件：

| 组件 | 位置 | 功能 |
|------|------|------|
| **MobileCard** | `components/mobile/MobileCard.tsx` | 移动端数据卡片 |
| **MobileForm** | `components/mobile/MobileForm.tsx` | 移动端表单组件 |
| **MobileTable** | `components/mobile/MobileTable.tsx` | 移动端表格（虚拟滚动） |
| **MobileChart** | `components/mobile/MobileChart.tsx` | 移动端图表适配器 |
| **MobileConfigProvider** | `components/mobile/MobileConfigProvider.tsx` | 移动端配置提供者 |

### 3. 组件使用示例

```tsx
import {
  MobileCard,
  MobileForm,
  MobileTable,
  MobileChart,
  MobileConfigProvider,
  useGestures,
} from '@/components/mobile';

// 在应用根组件中包装
function App() {
  return (
    <MobileConfigProvider darkMode={isDarkMode}>
      <YourApp />
    </MobileConfigProvider>
  );
}

// 使用移动端卡片
<MobileCard
  title="客户概况"
  description="最近30天活跃客户"
  actions={[
    { label: '查看详情', onClick: () => {} },
    { label: '导出数据', onClick: () => {} },
  ]}
  footer="更新时间: 2024-03-26"
>
  <div className="p-4">卡片内容</div>
</MobileCard>
```

## 手势交互

### 1. 手势Hook

使用 `useGestures` Hook添加手势支持：

```tsx
import { useGestures } from '@/components/mobile/gestures';

function SwipeableComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isGesturing } = useGestures(containerRef, {
    onSwipeLeft: () => {
      Toast.show('向左滑动');
      // 下一页
    },
    onSwipeRight: () => {
      Toast.show('向右滑动');
      // 上一页
    },
    onLongPress: () => {
      Dialog.confirm({
        content: '确定要删除吗？',
        onConfirm: () => {},
      });
    },
    onPinch: (event) => {
      // 缩放处理
      console.log('缩放比例:', event.scale);
    },
  });

  return (
    <div ref={containerRef} className="h-64 bg-gray-100">
      {isGesturing ? '手势进行中...' : '请尝试滑动、长按或缩放'}
    </div>
  );
}
```

### 2. 手势类型

支持的手势类型：

| 手势 | 描述 | 适用场景 |
|------|------|----------|
| **滑动 (Swipe)** | 单指快速滑动 | 翻页、导航、删除 |
| **点击 (Tap)** | 单指轻点 | 选择、确认 |
| **双击 (Double Tap)** | 快速连续点击两次 | 放大、喜欢 |
| **长按 (Long Press)** | 长时间按压 | 上下文菜单、拖拽准备 |
| **缩放 (Pinch)** | 双指捏合/展开 | 图片缩放、地图缩放 |
| **平移 (Pan)** | 单指拖拽 | 地图移动、列表滑动 |

### 3. 手势配置选项

```typescript
const options: GestureOptions = {
  swipeThreshold: 30,        // 滑动阈值（像素）
  longPressThreshold: 500,   // 长按时间阈值（毫秒）
  doubleTapThreshold: 300,   // 双击时间阈值（毫秒）
  pinchThreshold: 0.1,       // 缩放阈值
  passive: true,            // 被动事件监听（性能优化）
  preventDefault: true,     // 阻止默认行为
};
```

## 性能优化

### 1. 图片优化

```tsx
// 使用懒加载和响应式图片
<img
  src="/image-small.jpg"
  srcSet="
    /image-small.jpg 375w,
    /image-medium.jpg 768w,
    /image-large.jpg 1024w
  "
  sizes="(max-width: 375px) 375px,
         (max-width: 768px) 768px,
         1024px"
  loading="lazy"
  alt="响应式图片"
/>
```

### 2. 代码分割

```tsx
// 动态导入组件
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function MyPage() {
  return (
    <React.Suspense fallback={<Loading />}>
      <HeavyComponent />
    </React.Suspense>
  );
}

// 路由级别的代码分割
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "dashboard",
        lazy: () => import("./pages/Dashboard"),
      },
      {
        path: "analytics",
        lazy: () => import("./pages/Analytics"),
      },
    ],
  },
]);
```

### 3. 虚拟滚动

对于长列表使用虚拟滚动：

```tsx
import { MobileTable } from '@/components/mobile';

function UserList({ users }) {
  const columns = [
    { key: 'name', title: '姓名', width: 100 },
    { key: 'email', title: '邮箱', width: 200 },
    { key: 'role', title: '角色', width: 100 },
  ];

  return (
    <MobileTable
      data={users}
      columns={columns}
      rowHeight={60}           // 行高
      virtualScroll={true}     // 启用虚拟滚动
      buffer={10}              // 缓冲区大小
      estimatedRowCount={1000} // 预估行数
    />
  );
}
```

## 微信浏览器适配

### 1. 常见问题与解决

| 问题 | 表现 | 解决方案 |
|------|------|----------|
| **fixed定位失效** | 底部固定元素抖动 | 使用 `position: fixed` + `transform: translateZ(0)` |
| **输入框遮挡** | 键盘弹出时输入框被遮挡 | 监听 `focus` 事件滚动到可视区域 |
| **下拉刷新冲突** | 微信下拉刷新与页面滚动冲突 | 禁用微信下拉刷新：`document.body.style.overscrollBehavior = 'contain'` |
| **字体大小调整** | 微信自动调整字体大小 | 设置 `-webkit-text-size-adjust: 100%` |
| **点击延迟** | 点击有300ms延迟 | 使用 `fastclick` 或 `touch-action: manipulation` |

### 2. 微信JSSDK集成（可选）

如需微信分享、登录等功能：

```typescript
// 安装微信JSSDK
npm install weixin-js-sdk @types/weixin-js-sdk

// 初始化
import wx from 'weixin-js-sdk';

function initWechatSDK() {
  // 从后端获取配置
  const config = await getWechatConfig();

  wx.config({
    debug: false,
    appId: config.appId,
    timestamp: config.timestamp,
    nonceStr: config.nonceStr,
    signature: config.signature,
    jsApiList: [
      'updateAppMessageShareData',
      'updateTimelineShareData',
      'onMenuShareWeibo',
      'chooseImage',
      'previewImage',
    ],
  });

  wx.ready(() => {
    // 配置分享
    wx.updateAppMessageShareData({
      title: '分享标题',
      desc: '分享描述',
      link: window.location.href,
      imgUrl: '/share-image.png',
    });
  });
}
```

### 3. 微信样式适配

```css
/* 微信特定样式修复 */
.wechat-fix {
  /* 修复iOS输入框圆角 */
  -webkit-appearance: none;
  border-radius: 0;

  /* 修复点击高亮 */
  -webkit-tap-highlight-color: transparent;

  /* 修复滚动回弹 */
  overflow-scrolling: touch;
  -webkit-overflow-scrolling: touch;
}

/* 微信内禁止用户缩放 */
@media screen and (max-width: 768px) {
  body {
    -webkit-text-size-adjust: 100% !important;
    text-size-adjust: 100% !important;
  }
}
```

## 无障碍访问

### 1. WCAG 2.1 合规

确保移动端应用符合无障碍标准：

| 要求 | 实现 | 检查点 |
|------|------|--------|
| **触摸目标大小** | ≥44×44px | 所有可点击元素 |
| **颜色对比度** | ≥4.5:1（文本） | 文本与背景色 |
| **字体大小** | ≥16px（正文） | 可读性 |
| **焦点指示器** | 清晰可见的焦点样式 | 键盘导航 |
| **屏幕阅读器** | ARIA标签和角色 | VoiceOver/TalkBack |

### 2. 触摸目标优化

```tsx
// 确保按钮足够大
<button className="
  min-h-[44px]    /* 最小高度44px */
  min-w-[44px]    /* 最小宽度44px */
  px-4           /* 水平内边距 */
  py-3           /* 垂直内边距 */
">
  可访问按钮
</button>

// 小图标按钮使用padding增大触摸区域
<button className="p-3">
  <Icon size={20} />
</button>
```

### 3. ARIA属性

```tsx
<div
  role="button"
  aria-label="关闭对话框"
  tabIndex={0}
  onClick={handleClose}
  onKeyDown={(e) => e.key === 'Enter' && handleClose()}
  className="close-button"
>
  ×
</div>

// 表单标签关联
<label htmlFor="username" className="sr-only">
  用户名
</label>
<input
  id="username"
  aria-describedby="username-help"
  placeholder="请输入用户名"
/>
<span id="username-help" className="sr-only">
  用户名应为3-20个字符
</span>
```

## 测试策略

### 1. 设备测试矩阵

| 设备类型 | 操作系统 | 浏览器 | 测试重点 |
|----------|----------|--------|----------|
| **iPhone** | iOS 15+ | Safari | 手势、性能、UI适配 |
| **Android手机** | Android 10+ | Chrome | 兼容性、内存使用 |
| **微信内置浏览器** | iOS/Android | 微信浏览器 | 特定问题、分享功能 |
| **iPad/Android平板** | iOS/Android | Safari/Chrome | 响应式布局、分屏模式 |

### 2. 自动化测试

```typescript
// 使用Playwright进行移动端测试
import { test, expect, devices } from '@playwright/test';

test.describe('移动端测试', () => {
  // iPhone 12测试
  test.use({ ...devices['iPhone 12'] });

  test('移动端首页加载', async ({ page }) => {
    await page.goto('/');

    // 验证移动端特定元素
    await expect(page.locator('.mobile-nav')).toBeVisible();

    // 测试手势
    await page.touchscreen.swipe(100, 100, 300, 100);

    // 验证响应式
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(390); // iPhone 12宽度
  });

  // 微信浏览器模拟
  test('微信浏览器兼容性', async ({ page }) => {
    // 设置微信User-Agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.0',
    });

    await page.goto('/');
    // 测试微信特定功能
  });
});
```

### 3. 性能测试指标

| 指标 | 目标值 | 测量工具 |
|------|--------|----------|
| **首次内容绘制 (FCP)** | <1.8s | Lighthouse |
| **最大内容绘制 (LCP)** | <2.5s | Lighthouse |
| **首次输入延迟 (FID)** | <100ms | Lighthouse |
| **累计布局偏移 (CLS)** | <0.1 | Lighthouse |
| **Time to Interactive (TTI)** | <3.5s | Lighthouse |
| **Bundle大小** | <200KB | Webpack Bundle Analyzer |

## 开发工作流

### 1. 环境设置

```bash
# 1. 安装依赖
cd dashboard-web
npm install

# 2. 启动开发服务器
npm run dev

# 3. 构建生产版本
npm run build

# 4. 类型检查
npm run typecheck

# 5. 代码检查
npm run lint
```

### 2. 组件开发规范

```tsx
// 1. 使用TypeScript定义Props
interface MobileComponentProps {
  title: string;
  description?: string;
  onAction?: () => void;
  darkMode?: boolean;
}

// 2. 导出类型
export type { MobileComponentProps };

// 3. 默认导出组件
export default function MobileComponent(props: MobileComponentProps) {
  const { title, description, onAction, darkMode = false } = props;

  // 4. 使用CSS-in-JS或Tailwind
  const className = cn(
    'mobile-component',
    darkMode && 'dark-mode',
    props.className
  );

  // 5. 响应式设计
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold md:text-xl lg:text-2xl">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-600 md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
```

### 3. 代码质量检查

在提交前运行：

```bash
# 类型检查
npm run typecheck

# ESLint检查
npm run lint

# 预提交钩子（package.json配置）
"husky": {
  "hooks": {
    "pre-commit": "npm run typecheck && npm run lint"
  }
}
```

## 部署与监控

### 1. Docker容器化

```dockerfile
# dashboard-web/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Nginx移动端优化配置

```nginx
# nginx.conf
server {
    listen 80;
    server_name _;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 移动端特定配置
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;

        # 安全头部
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

### 3. 监控与告警

```typescript
// 前端性能监控
import { init, track } from '@frontend-monitoring/sdk';

init({
  appId: 'lumina-media-mobile',
  endpoint: 'https://monitoring.example.com',
  sampleRate: 0.1, // 10%采样
});

// 关键性能指标
track('fcp', { value: 1200 });
track('lcp', { value: 2500 });
track('cls', { value: 0.05 });

// 错误监控
window.addEventListener('error', (event) => {
  track('error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

// 用户行为分析
track('gesture', {
  type: 'swipe',
  direction: 'left',
  page: 'dashboard',
});
```

## 常见问题解决

### Q1: 移动端页面滚动卡顿

**问题**: 在低端Android设备上页面滚动不流畅

**解决方案**:
```css
/* 启用GPU加速 */
.scroll-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
  will-change: transform;
}

/* 减少重绘 */
.static-element {
  position: fixed;
  transform: translateZ(0);
}
```

### Q2: 移动端内存泄漏

**问题**: 长时间使用后应用变慢

**解决方案**:
```typescript
// 1. 清理事件监听器
useEffect(() => {
  const handleResize = () => {};
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// 2. 清理定时器
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
}, []);

// 3. 虚拟化长列表
```

### Q3: 不同Android厂商样式差异

**问题**: 在不同Android手机上样式表现不一致

**解决方案**:
```css
/* 使用标准化样式 */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 避免使用厂商前缀属性 */
.box {
  /* 避免: -webkit-border-radius */
  border-radius: 8px;

  /* 使用标准属性 */
  appearance: none;
}

/* 字体回退 */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
```

## 附录

### A. 移动端组件清单

- `MobileCard` - 数据卡片组件
- `MobileForm` - 表单组件
- `MobileTable` - 虚拟滚动表格
- `MobileChart` - 图表组件
- `MobileConfigProvider` - 配置提供者
- `useGestures` - 手势Hook
- `withGestures` - 手势高阶组件

### B. 推荐工具

- **Chrome DevTools Device Mode**: 移动端模拟
- **Lighthouse**: 性能测试
- **PageSpeed Insights**: 页面速度分析
- **WebPageTest**: 多地点性能测试
- **Sentry**: 错误监控
- **Playwright**: 自动化测试

### C. 参考资源

1. [Google Mobile-First Indexing](https://developers.google.com/search/mobile-sites/mobile-first-indexing)
2. [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
3. [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
4. [Material Design Guidelines](https://material.io/design)
5. [Can I use...](https://caniuse.com/) - 浏览器兼容性查询

---

**文档版本**: 1.0
**最后更新**: 2026-03-26
**维护者**: LuminaMedia 前端团队
**状态**: 正式发布