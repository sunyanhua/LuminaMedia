# LuminaMedia Dashboard

基于 Vite + React + TypeScript + Tailwind CSS 的灵曜智媒管理后台原型。

## 功能特性

- 🎯 **数智洞察看板**: 用户活跃度曲线、消费频次分布、地域分布图表
- 🤖 **AI 智策中心**: 基于 Gemini AI 的营销策略生成，流式打印效果
- 🌐 **矩阵管理墙**: 多平台账号状态监控与同步管理
- 🎨 **专业设计**: 深邃蓝 + 曜金色调，现代化 SaaS 界面
- 📱 **响应式布局**: 完美适配桌面端和移动端

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **图标库**: Lucide React
- **图表库**: ECharts + echarts-for-react
- **HTTP 客户端**: Axios
- **代码质量**: ESLint + Prettier

## 项目结构

```
dashboard-web/
├── src/
│   ├── components/          # React 组件
│   │   ├── Dashboard.tsx    # 数智洞察看板
│   │   ├── AICenter.tsx     # AI 智策中心
│   │   └── MatrixWall.tsx   # 矩阵管理墙
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── package.json             # 依赖配置
├── tailwind.config.js       # Tailwind 配置
├── postcss.config.js        # PostCSS 配置
├── vite.config.ts           # Vite 配置
└── tsconfig.json            # TypeScript 配置
```

## 快速开始

### 1. 安装依赖

```bash
cd dashboard-web
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:5174](http://localhost:5174)

### 3. 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

## 与后端 API 联调

前端已配置代理，将所有 `/api` 请求转发到后端服务器（默认 `http://localhost:3001`）。

### 可用的后端 API 端点

- `GET /api/v1/analytics/behavior/{userId}/summary` - 用户行为分析
- `POST /api/v1/analytics/strategies/generate` - 生成营销策略
- `GET /api/v1/analytics/campaigns` - 获取营销活动列表
- `GET /api/v1/analytics/reports/behavior/{userId}` - 生成行为报告

## 设计系统

### 颜色主题

- **主色调**: 深邃蓝 (`#0f172a` - `#0c4a6e`)
- **点缀色**: 曜金 (`#fbbf24` - `#b45309`)
- **背景色**:
  - 主背景: `#0f172a`
  - 卡片背景: `#1e293b`
  - 悬停状态: `#334155`

### 字体

- **主要字体**: Inter (系统默认 sans-serif 回退)
- **代码字体**: JetBrains Mono

### 组件样式

- **卡片**: 圆角 `0.75rem`，深色背景，渐变边框
- **按钮**: 主按钮使用曜金色，次按钮使用深蓝色
- **徽章**: 小型状态标签，支持成功/警告/错误状态
- **表格**: 深色背景，悬停高亮，边框分隔

## 开发指南

### 添加新页面

1. 在 `src/components/` 中创建新组件
2. 在 `App.tsx` 的 `tabs` 数组中添加新标签页
3. 在 `renderContent` 函数中添加路由逻辑

### 添加新图表

1. 安装所需的 ECharts 扩展（如地图数据）
2. 在组件中导入 `ReactECharts`
3. 配置 ECharts 选项对象
4. 渲染 `<ReactECharts option={...} />`

### 样式开发

- 使用 Tailwind CSS 工具类进行快速样式开发
- 自定义样式请添加到 `tailwind.config.js` 的 `extend` 部分
- 组件特定样式使用 CSS Modules 或内联样式

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本 (推荐 18+)
   - 删除 `node_modules` 并重新安装依赖
   - 确保 TypeScript 配置正确

2. **图表不显示**
   - 检查 ECharts 选项配置
   - 确保图表容器有明确的高度
   - 查看浏览器控制台错误信息

3. **代理不工作**
   - 确保后端服务器正在运行 (`npm run start:dev`)
   - 检查 `vite.config.ts` 中的代理配置
   - 查看网络请求是否正确转发

4. **样式问题**
   - 检查 Tailwind CSS 类名拼写
   - 确保 `index.css` 正确导入
   - 查看元素是否应用了预期的类名

### 调试工具

- **React DevTools**: 组件层次结构检查
- **Redux DevTools**: 状态管理调试
- **网络面板**: API 请求监控
- **控制台**: 错误日志查看

## 部署

### 静态托管

构建产物可直接部署到任何静态托管服务：

```bash
npm run build
# 将 dist/` 目录上传到托管服务
```

### Docker 部署

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 许可证

MIT

## 支持与反馈

如有问题或建议，请联系开发团队。

---

**灵曜智媒** - AI 驱动的自动化内容矩阵管理系统
