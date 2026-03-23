# Google Gemini API 集成指南

## 概述

本文档介绍了如何在 LuminaMedia（灵曜智媒）项目中集成 Google Gemini API，用于生成智能营销策略方案。系统将现有的模拟营销策略生成逻辑升级为基于 Gemini 1.5 Flash 模型的 AI 生成逻辑。

## 功能特性

- ✅ AI 扮演"灵曜智媒首席营销专家"生成完整营销方案
- ✅ 支持 9 个关键字段的 JSON 方案生成
- ✅ 优雅降级机制：API 不可用时自动使用模拟模板
- ✅ 完整的错误处理和日志记录
- ✅ 向后兼容现有 API 接口

## 环境配置

### 1. 获取 Gemini API Key

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录 Google 账户
3. 创建新的 API Key
4. 复制生成的 API Key

### 2. 配置环境变量

编辑项目根目录下的 `.env` 文件，添加以下配置：

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=2048
GEMINI_TOP_P=0.95
GEMINI_TOP_K=40
```

### 3. 安装依赖

```bash
npm install
```

系统会自动安装 `@google/generative-ai` 包。

## 数据库迁移

### 1. 运行迁移脚本

```bash
mysql -u username -p lumina_media < scripts/gemini-integration-migration.sql
```

### 2. 验证迁移结果

迁移脚本会为 `marketing_strategies` 表添加以下新字段：

| 字段名 | 类型 | 描述 |
|--------|------|------|
| campaign_name | VARCHAR(255) | 活动名称 |
| target_audience_analysis | JSON | 目标人群分析 |
| core_idea | TEXT | 核心创意 |
| xhs_content | TEXT | 小红书文案 |
| recommended_execution_time | JSON | 建议执行时间 |
| expected_performance_metrics | JSON | 预期效果指标 |
| execution_steps | JSON | 执行步骤计划 |
| risk_assessment | JSON | 风险评估 |
| budget_allocation | JSON | 预算分配方案 |
| ai_response_raw | TEXT | 原始 AI 响应（调试用） |

## API 使用

### 1. 测试 API 连接

```bash
npm run test:gemini
```

### 2. 生成营销策略

**Endpoint:**
```
POST /api/v1/analytics/strategies/generate
```

**请求体:**
```json
{
  "campaignId": "campaign-uuid-here",
  "strategyType": "CONTENT",  // 可选: CONTENT, CHANNEL, TIMING, BUDGET_ALLOCATION
  "generatedBy": "AI_GENERATED",  // 可选: AI_GENERATED, TEMPLATE_BASED
  "useGemini": true  // 可选: true/false，默认 true
}
```

**响应示例 (成功):**
```json
{
  "success": true,
  "message": "Strategy generated successfully",
  "data": {
    "id": "strategy-uuid",
    "campaignId": "campaign-uuid",
    "strategyType": "CONTENT",
    "description": "基于CONTENT的AI生成营销策略",
    "campaignName": "小红书春季推广（优化版）",
    "coreIdea": "通过情感化内容建立品牌连接...",
    "xhsContent": "【春季焕新】...",
    "expectedROI": 42.5,
    "confidenceScore": 85,
    "aiGenerated": true,
    // ... 其他字段
  },
  "insights": {
    "confidenceLevel": "高",
    "expectedImpact": "预期效果显著",
    "implementationComplexity": "中等"
  }
}
```

### 3. API 参数说明

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| campaignId | string | ✓ | - | 营销活动 ID |
| strategyType | enum | ✗ | 随机选择 | 策略类型：CONTENT, CHANNEL, TIMING, BUDGET_ALLOCATION |
| generatedBy | enum | ✗ | AI_GENERATED | 生成方式：AI_GENERATED, TEMPLATE_BASED |
| useGemini | boolean | ✗ | true | 是否使用 Gemini AI 生成 |

## 降级机制

系统实现了多级降级策略确保服务连续性：

### 1. 主要降级场景

| 场景 | 处理方式 | 用户体验 |
|------|----------|----------|
| API Key 未配置 | 使用模拟模板 | 无感知降级 |
| API Key 无效 | 使用模拟模板 | 返回警告日志 |
| 网络超时 (30秒) | 使用模拟模板 | 延迟后返回结果 |
| 配额超限 | 使用模拟模板 | 返回警告信息 |
| 响应解析失败 | 使用模拟模板 | 返回标准格式数据 |

### 2. 降级策略触发条件

- `GEMINI_API_KEY` 未设置或为默认值
- API 调用超时 (30秒)
- HTTP 错误状态码 (4xx, 5xx)
- 响应格式不符合预期
- 安全策略阻止

## 故障排除

### 常见问题

#### Q1: API Key 无效
```
错误: Gemini API 连接失败: API_KEY_INVALID
```
**解决方案:**
1. 验证 API Key 是否正确复制
2. 在 Google AI Studio 中检查 Key 状态
3. 确保 Key 有足够的配额

#### Q2: 网络连接问题
```
错误: 网络错误 / 请求超时
```
**解决方案:**
1. 检查网络连接
2. 确保可以访问 `generativelanguage.googleapis.com`
3. 可能需要配置代理

#### Q3: 配额超限
```
错误: QUOTA_EXCEEDED
```
**解决方案:**
1. 检查当前使用量
2. 升级到付费计划
3. 等待配额重置（通常每月1日）

#### Q4: 响应解析失败
```
警告: Failed to parse Gemini response
```
**解决方案:**
1. 检查提示词格式
2. 验证响应 JSON 格式
3. 查看 `ai_response_raw` 字段调试

### 调试日志

启用调试日志查看详细错误信息：

```typescript
// 在 .env 中设置
TYPEORM_LOGGING=true
```

检查应用日志中的 `GeminiService` 和 `MarketingStrategyService` 相关记录。

## 性能优化

### 1. 缓存策略

可选的缓存实现（未来版本）：
```typescript
// 相同活动参数的策略缓存1小时
const cacheKey = `strategy:${campaignId}:${strategyType}`;
const cached = cache.get(cacheKey);
if (cached) return cached;
```

### 2. 异步处理

对于大型生成任务，建议实现异步处理：
```typescript
// 创建生成任务
POST /api/v1/analytics/strategies/generate-async
// 查询任务状态
GET /api/v1/analytics/strategies/tasks/{taskId}
```

### 3. 批量生成

支持批量生成多个策略类型：
```json
{
  "campaignId": "campaign-uuid",
  "strategyTypes": ["CONTENT", "CHANNEL", "BUDGET_ALLOCATION"]
}
```

## 安全考虑

### 1. API Key 安全

- 永远不要将 API Key 提交到版本控制系统
- 使用环境变量管理敏感信息
- 定期轮换 API Key
- 设置使用配额和预算警报

### 2. 内容安全

- Gemini API 内置安全过滤器
- 不发送用户敏感数据到外部 API
- 验证响应内容符合业务规范
- 实现输入输出验证

### 3. 错误信息

- 不向客户端暴露详细的 API 错误信息
- 记录完整的错误日志供内部调试
- 返回友好的用户提示信息

## 监控与告警

### 1. 关键指标

建议监控以下指标：
- API 调用成功率
- 平均响应时间
- 降级使用率
- 配额使用情况
- 错误类型分布

### 2. 告警规则

设置以下告警：
- 连续5次 API 调用失败
- 降级率超过30%
- 平均响应时间超过10秒
- 配额使用超过80%

## 扩展开发

### 1. 自定义提示词

修改 `GeminiService.buildStrategyPrompt()` 方法调整 AI 角色和生成要求。

### 2. 添加新的策略类型

1. 在 `StrategyType` 枚举中添加新类型
2. 更新模拟模板
3. 调整提示词逻辑

### 3. 集成其他 AI 服务

遵循相同模式集成 Claude、GPT 等其他 AI 服务：
```typescript
interface AIService {
  generateMarketingStrategy(options): Promise<StrategyResponse>;
}
```

## 版本历史

### v1.0.0 (2026-03-14)
- ✅ 初始 Gemini API 集成
- ✅ 9字段完整营销方案生成
- ✅ 优雅降级机制
- ✅ 完整错误处理
- ✅ 数据库迁移脚本
- ✅ 测试脚本和文档

## 支持与反馈

如遇问题，请：
1. 查看本文档的故障排除部分
2. 检查应用日志
3. 运行测试脚本：`npm run test:gemini`
4. 联系开发团队

---

**重要提醒:** 定期检查 Gemini API 的[官方文档](https://ai.google.dev/gemini-api/docs)了解更新和变更。