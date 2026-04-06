# Dashboard Web 站点地图 (Sitemap)

> **版本**: v3.1 DEMO  
> **最后更新**: 2026-04-06  
> **适用范围**: dashboard-web/government (政务版)

本文档定义了 LuminaMedia 3.1 DEMO 版政务版的完整页面结构和菜单导航体系，是前端开发的权威参考。

---

## 政务版菜单结构

```
工作台
├── 页面: /government/dashboard
├── 组件: GovernmentDashboard
└── 功能: 数据概览、待办提醒、快捷入口

智慧档案
├── 页面: /government/smart-archive
├── 组件: KnowledgeBase
└── 功能: 知识库管理、文档上传、网页采集

参考信息
├── 页面: /government/reference-info
├── 组件: ReferenceInfo
└── 功能: 政策资讯展示、一键采用、修改再生

舆情监测
├── 页面: /government/sentiment-monitor
├── 组件: SentimentMonitor
└── 功能: 舆情列表、情感分析、热度指标、筛选排序

公众号管理
├── 账号绑定
│   ├── 页面: /government/wechat-mp
│   ├── 组件: WechatAccountBinding
│   └── 功能: 扫码授权、绑定状态、数据展示
├── 内容发布 (四步流程)
│   ├── 第一步: 选题
│   │   ├── 页面: /government/topic-selection
│   │   └── 组件: TopicSelection
│   ├── 第二步: 资料补充
│   │   ├── 页面: /government/material-supplement/:id
│   │   └── 组件: MaterialSupplement
│   ├── 第三步: 内容生成
│   │   └── 注: 在 TopicSelection 中完成
│   └── 第四步: 内容确认
│       ├── 页面: /government/content-confirm/:id?
│       └── 组件: ContentConfirmation
├── 内容列表
│   ├── 页面: /government/content-list
│   ├── 组件: ContentList
│   └── 功能: 全部内容、状态筛选、搜索、审核进度
├── 一键发布
│   ├── 页面: /government/publish-queue
│   ├── 组件: PublishQueue
│   └── 功能: 待发文章、发布排序、批量发布
└── 数据看板
    ├── 页面: /government/wechat-dashboard
    ├── 组件: WechatDataDashboard
    └── 功能: 粉丝数据、内容数据、趋势图表、文章排行

三审三校
├── 页面: /government/review
├── 组件: MyPendingReviews
└── 功能: 我的待审、我已审核、审核详情、审核操作

一键报告
├── 页面: /government/intelligent-reports
├── 组件: IntelligentReports
└── 功能: 智能报告生成、自定义报告、Word导出、PPT大纲
```

---

## 路由路径速查表

| 菜单项 | 路由路径 | 组件文件 | 功能说明 |
|--------|----------|----------|----------|
| 工作台 | `/government/dashboard` | `GovernmentDashboard.tsx` | 政务仪表盘首页 |
| 智慧档案 | `/government/smart-archive` | `KnowledgeBase.tsx` | 知识库管理 |
| 参考信息 | `/government/reference-info` | `ReferenceInfo.tsx` | 政策资讯 |
| 舆情监测 | `/government/sentiment-monitor` | `SentimentMonitor.tsx` | 舆情监控面板 |
| 账号绑定 | `/government/wechat-mp` | `WechatAccountBinding.tsx` | 公众号授权 |
| 内容发布 | `/government/topic-selection` | `TopicSelection.tsx` | 选题策划入口 |
| 资料补充 | `/government/material-supplement/:id` | `MaterialSupplement.tsx` | 上传素材 |
| 内容确认 | `/government/content-confirm/:id?` | `ContentConfirmation.tsx` | 编辑确认内容 |
| 内容列表 | `/government/content-list` | `ContentList.tsx` | 内容管理列表 |
| 一键发布 | `/government/publish-queue` | `PublishQueue.tsx` | 发布队列管理 |
| 数据看板 | `/government/wechat-dashboard` | `WechatDataDashboard.tsx` | 公众号数据 |
| 三审三校 | `/government/review` | `MyPendingReviews.tsx` | 审核工作台 |
| 一键报告 | `/government/intelligent-reports` | `IntelligentReports.tsx` | 报告中心 |

---

## 菜单配置

菜单配置位于 `src/config/menu.config.ts`，政务版菜单项的 `tenantType` 应设置为 `'government'`。

### 关键配置示例

```typescript
{
  key: 'wechat-mp',
  title: '公众号管理',
  icon: 'wechat',
  tenantType: 'government',
  children: [
    { key: 'wechat-account', title: '账号绑定', path: '/government/wechat-mp' },
    { key: 'topic-selection', title: '内容发布', path: '/government/topic-selection' },
    { key: 'content-list', title: '内容列表', path: '/government/content-list' },
    { key: 'publish-queue', title: '一键发布', path: '/government/publish-queue' },
    { key: 'wechat-dashboard', title: '数据看板', path: '/government/wechat-dashboard' },
  ],
}
```

---

## 路由配置

路由配置位于 `src/routes/index.tsx`，所有政务版路由应放在 `/government` 路径下。

### 路由常量定义

```typescript
export const ROUTE_PATHS = {
  GOVERNMENT_DASHBOARD: '/government/dashboard',
  GOVERNMENT_SMART_ARCHIVE: '/government/smart-archive',
  GOVERNMENT_REFERENCE_INFO: '/government/reference-info',
  GOVERNMENT_SENTIMENT_MONITOR: '/government/sentiment-monitor',
  GOVERNMENT_WECHAT_MP: '/government/wechat-mp',
  GOVERNMENT_TOPIC_SELECTION: '/government/topic-selection',
  GOVERNMENT_MATERIAL_SUPPLEMENT: '/government/material-supplement',
  GOVERNMENT_CONTENT_CONFIRM: '/government/content-confirm',
  GOVERNMENT_CONTENT_LIST: '/government/content-list',
  GOVERNMENT_PUBLISH_QUEUE: '/government/publish-queue',
  GOVERNMENT_WECHAT_DASHBOARD: '/government/wechat-dashboard',
  GOVERNMENT_REVIEW: '/government/review',
  GOVERNMENT_INTELLIGENT_REPORTS: '/government/intelligent-reports',
};
```

---

## 开发规范

### 新增页面流程

1. **创建页面组件**在 `src/pages/{模块}/` 目录下
2. **添加路由配置**在 `src/routes/index.tsx` 中
3. **添加菜单配置**在 `src/config/menu.config.ts` 中（如需要显示在菜单）
4. **更新本文档**记录新的页面结构

### 命名规范

- 页面组件: PascalCase (如 `KnowledgeBase.tsx`)
- 路由路径: kebab-case (如 `/government/smart-archive`)
- 菜单 key: camelCase (如 `smart-archive`)

---

## 变更记录

| 日期 | 版本 | 变更内容 | 变更人 |
|------|------|----------|--------|
| 2026-04-06 | v3.1 | 初始版本，建立政务版完整菜单结构 | Claude |
