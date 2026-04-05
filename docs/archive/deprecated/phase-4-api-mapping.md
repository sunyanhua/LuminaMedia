# LuminaMedia 2.0 第四阶段前端API对接清单

**文档版本**: 1.0
**创建日期**: 2026-03-30
**创建目的**: 梳理现有dashboard-web各页面组件的静态数据占位情况，制定完整的API对接清单，明确每个页面组件需要调用的后端端点

## 概述

本文档基于对 `dashboard-web/src/` 目录下现有前端组件的分析，识别出：
1. **已有API但未对接**的页面组件（优先处理）
2. **后端API尚未实现**的页面组件（标记为第四阶段待开发）
3. **静态数据占位**情况（需要替换为真实API调用）

## 页面组件分析

### 1. 仪表盘页面 (`DashboardOverview.tsx`)

**文件位置**: `dashboard-web/src/components/dashboard/DashboardOverview.tsx`

#### 当前状态分析
- ✅ **已有API服务**: `dashboardService` 已定义多个API端点
- ⚠️ **模拟数据fallback**: 组件包含 `generateMockChartData`, `generateMockStats`, `generateMockContentPerformance` 等模拟数据生成函数
- ⚠️ **错误处理**: API调用失败时回退到模拟数据

#### API调用情况
| 组件功能 | 当前API调用 | 后端端点 | 状态 |
|---------|------------|---------|------|
| 仪表板统计卡片 | `dashboardService.getDashboardStats()` | `GET /api/v1/dashboard/stats` | ✅ 已定义，需验证实现 |
| 用户活跃度图表 | `dashboardService.getUserActivityChart(timeRange)` | `GET /api/v1/dashboard/charts/user-activity` | ✅ 已定义，需验证实现 |
| 内容表现数据 | 硬编码模拟数据 | 无对应API | ❌ 需要后端实现 |

#### 静态数据占位
1. **内容表现数据** (`ContentPerformance[]`): 完全由 `generateMockContentPerformance()` 生成
2. **图表数据fallback**: API失败时使用 `generateMockChartData()`

#### 对接优先级: **高** (已有API定义，只需验证和对接)

### 2. 零售商场数据分析页面 (`RetailAnalytics.tsx`)

**文件位置**: `dashboard-web/src/components/analytics/RetailAnalytics.tsx`

#### 当前状态分析
- ✅ **已有API服务**: `analyticsService` 已定义相关端点
- ⚠️ **硬编码统计数据**: 今日访客总数、转化率、平均停留时长直接硬编码
- ⚠️ **部分字段硬编码**: 客户分群的 `avgSpending` 和 `visitFrequency` 字段

#### API调用情况
| 组件功能 | 当前API调用 | 后端端点 | 状态 |
|---------|------------|---------|------|
| 客户分群数据 | `analyticsService.getCustomerSegments('demo')` | `GET /api/v1/customer-data/profiles/{profileId}/segments` | ✅ 已定义，需验证实现 |
| 停车消费数据 | `analyticsService.getParkingSpendingData('demo')` | `GET /api/v1/dashboard/charts/parking-spending` | ✅ 已定义，需验证实现 |
| 客流趋势数据 | `analyticsService.getTrafficTimeSeries('demo', timeRange)` | `GET /api/v1/dashboard/charts/traffic-timeseries` | ✅ 已定义，需验证实现 |
| 今日访客总数 | 硬编码 `8945` | 无对应API | ❌ 需要后端实现 |
| 转化率 | 硬编码 `68.3%` | 无对应API | ❌ 需要后端实现 |
| 平均停留时长 | 硬编码 `2.4 小时` | 无对应API | ❌ 需要后端实现 |

#### 静态数据占位
1. **关键指标卡片** (第210、224、238行): 直接硬编码数值
2. **客户分群字段**: `avgSpending: 0` (第55行), `visitFrequency: '每周1-2次'` (第56行)

#### 对接优先级: **高** (部分API已定义，关键指标需要新API)

### 3. 新媒体矩阵页面 (`MatrixControl.tsx`)

**文件位置**: `dashboard-web/src/components/matrix/MatrixControl.tsx`

#### 当前状态分析
- ⚠️ **完全静态数据**: `platforms` 数组和 `mockTasks` 数组完全硬编码
- ✅ **内容生成API**: `contentGenerationService.generateContentForMatrix` 已定义
- ⚠️ **任务队列硬编码**: 第384-432行硬编码任务队列数据

#### API调用情况
| 组件功能 | 当前API调用 | 后端端点 | 状态 |
|---------|------------|---------|------|
| 多平台内容生成 | `contentGenerationService.generateContentForMatrix()` | `POST /api/v1/content-generation/generate/marketing-content` | ✅ 已定义，需验证实现 |
| 平台连接状态 | 硬编码 `platforms` 数组 | 无对应API | ❌ 需要后端实现 |
| 任务执行状态 | 硬编码 `mockTasks` 数组 | 无对应API | ❌ 需要后端实现 |
| 任务队列 | 硬编码任务队列数据 | 无对应API | ❌ 需要后端实现 |

#### 静态数据占位
1. **平台列表** (第32-68行): 完全硬编码的平台连接状态、帖子数、粉丝数
2. **任务列表** (第71-99行): 完全硬编码的任务状态和进度
3. **任务队列** (第384-432行): 硬编码的定时发布任务

#### 对接优先级: **中** (内容生成API已定义，但核心数据需要新API)

### 4. AI策略中心页面 (`AIStrategy.tsx`)

**文件位置**: `dashboard-web/src/components/ai/AIStrategy.tsx`

#### 当前状态分析
- ✅ **完整的API集成**: 已集成多个API服务
- ⚠️ **模拟数据fallback**: 有 `mockCampaign` 作为API失败时的回退
- ⚠️ **预设模板硬编码**: `PRESET_TEMPLATES` 硬编码演示模板

#### API调用情况
| 组件功能 | 当前API调用 | 后端端点 | 状态 |
|---------|------------|---------|------|
| Gemini健康检查 | `contentGenerationService.getGeminiHealth()` | `GET /api/v1/content-generation/health` | ✅ 已定义，需验证实现 |
| 创建营销活动 | `analyticsService.createCampaign()` | `POST /api/v1/analytics/campaigns` | ✅ 已定义，需验证实现 |
| 生成营销策略 | `strategyService.generateStrategy()` | `POST /api/v1/analytics/strategies/generate` | ✅ 已定义，需验证实现 |
| 演示模板数据 | 硬编码 `PRESET_TEMPLATES` | 无对应API | ⚠️ 可保留为前端预设 |

#### 静态数据占位
1. **模拟活动数据** (第271-365行): `mockCampaign` 作为API失败时的fallback
2. **预设模板** (第368-385行): 硬编码的演示模板
3. **默认时间线** (第48-80行): `DEFAULT_TIMELINE` 硬编码

#### 对接优先级: **低** (API集成较完整，主要需要验证现有API)

### 5. 发稿审核页面 (`Governance.tsx`)

**文件位置**: `dashboard-web/src/components/governance/Governance.tsx`

#### 当前状态分析
- ❌ **完全静态**: 无任何API调用，所有数据硬编码
- ⚠️ **模拟审核任务**: `mockTasks` 数组完全硬编码
- ⚠️ **统计数字硬编码**: 今日已批准(12)、标记问题(2)等硬编码

#### API调用情况
| 组件功能 | 当前API调用 | 后端端点 | 状态 |
|---------|------------|---------|------|
| 审核任务列表 | 无API调用 | 无对应API | ❌ 需要后端实现 |
| 审核统计数据 | 无API调用 | 无对应API | ❌ 需要后端实现 |
| 数据保护设置 | 无API调用 | 无对应API | ❌ 需要后端实现 |

#### 静态数据占位
1. **审核任务列表** (第20-66行): 完全硬编码的 `mockTasks` 数组
2. **统计卡片** (第125、140、154行): 硬编码的统计数字
3. **数据保护设置** (第295-343行): 硬编码的开关配置

#### 对接优先级: **高** (完全静态页面，需要完整的后端API支持)

## 后端API状态检查

基于前端服务定义，已识别以下后端API端点需要验证：

### 数据看板相关 (`dashboardService`)
1. `GET /api/v1/dashboard/stats` - 仪表板统计
2. `GET /api/v1/dashboard/charts/user-activity` - 用户活跃度图表
3. `GET /api/v1/dashboard/charts/parking-spending` - 停车消费数据
4. `GET /api/v1/dashboard/charts/traffic-timeseries` - 客流趋势数据

### 分析服务相关 (`analyticsService`)
1. `GET /api/v1/customer-data/profiles/{profileId}/segments` - 客户分群
2. `POST /api/v1/analytics/campaigns` - 创建营销活动
3. `GET /api/v1/analytics/campaigns` - 获取活动列表

### 内容生成相关 (`contentGenerationService`)
1. `GET /api/v1/content-generation/health` - Gemini健康检查
2. `POST /api/v1/content-generation/generate/marketing-content` - 生成营销内容
3. `POST /api/v1/content-generation/generate/text` - 生成单条文案

### 策略服务相关 (`strategyService`)
1. `POST /api/v1/analytics/strategies/generate` - 生成营销策略
2. `GET /api/v1/analytics/strategies/campaign/{campaignId}` - 获取活动策略

## 后端待实现API清单

根据前端需求，需要后端实现以下新API端点：

### 高优先级 (影响核心功能)
1. **矩阵管理API**
   - `GET /api/v1/matrix/platforms` - 获取已连接平台状态
   - `GET /api/v1/matrix/tasks` - 获取任务执行状态
   - `GET /api/v1/matrix/queue` - 获取任务队列

2. **审核工作流API**
   - `GET /api/v1/governance/tasks` - 获取审核任务列表
   - `GET /api/v1/governance/stats` - 获取审核统计数据
   - `POST /api/v1/governance/tasks/{taskId}/approve` - 批准任务
   - `POST /api/v1/governance/tasks/{taskId}/reject` - 驳回任务

3. **零售分析API**
   - `GET /api/v1/analytics/daily-stats` - 获取每日关键指标（访客数、转化率等）
   - `GET /api/v1/analytics/customer-segments/{segmentId}/details` - 获取分群详细信息

### 中优先级 (功能增强)
1. **内容表现API**
   - `GET /api/v1/dashboard/content-performance` - 获取各平台内容表现数据

2. **数据保护API**
   - `GET /api/v1/governance/settings` - 获取数据保护设置
   - `PUT /api/v1/governance/settings` - 更新数据保护设置

## 对接实施建议

### 第一阶段: 验证现有API (第1-2周)
1. 启动后端服务，验证Swagger文档中现有API端点
2. 针对每个已定义API，测试连通性和数据格式
3. 更新前端服务层，修复可能的路径/参数不匹配

### 第二阶段: 对接核心数据 (第3-4周)
1. 优先对接 `DashboardOverview` 和 `RetailAnalytics` 的已有API
2. 实现零售分析的新API（每日关键指标）
3. 移除模拟数据fallback，完善错误处理

### 第三阶段: 实现新功能API (第5-6周)
1. 实现矩阵管理API，替换硬编码的 `platforms` 和 `mockTasks`
2. 实现审核工作流API，替换硬编码的 `mockTasks`
3. 实现数据保护设置API

### 第四阶段: 优化和完善 (第7-8周)
1. 添加加载状态、错误处理、空状态等用户体验优化
2. 性能优化：缓存、分页、懒加载
3. 端到端测试和用户验收测试

## 注意事项

1. **数据隔离**: DEMO数据与真实数据需严格隔离，参考 `phase-4-demo-development.md` 中的数据隔离策略
2. **错误处理**: API调用失败时应有明确提示，可暂时保留模拟数据作为开发期fallback
3. **移动端优化**: 确保API响应数据适配移动端展示，避免过大响应体
4. **性能考虑**: 图表数据应考虑分页和时间范围筛选，避免一次性加载过多数据

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|---------|
| 2026-03-30 | 1.0 | 初始版本创建，基于前端代码分析 |

