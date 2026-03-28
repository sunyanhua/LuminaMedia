# AI Agent工作流设计文档

## 概述

AI Agent工作流引擎是 LuminaMedia 2.0 的智能内容生成核心，实现分析→策划→文案三阶段自动化工作流，生成内容达到专业CMO水平。

## 架构设计

### 三阶段Agent架构
1. **分析Agent**: 市场洞察和目标客群分析
2. **策划Agent**: 营销策略和活动方案生成
3. **文案Agent**: 多平台定制化文案生成

### RAG知识库集成
- **知识检索**: 向量检索相关行业知识
- **上下文增强**: 检索结果融入生成上下文
- **知识更新**: 自动知识库优化和扩展

### 工作流引擎
- **流程管理**: Agent间协作和状态管理
- **错误处理**: 降级处理和人工干预
- **审计日志**: 完整的过程记录和追踪

## Agent详细设计

### 分析Agent
#### 输入
```typescript
interface AnalysisAgentInput {
  customerData: UserProfile4D[];  // 客户数据样本
  industryContext: string;        // 行业背景
  businessGoals: string[];        // 业务目标
  knowledgeBaseContext: string[]; // 知识库检索结果
}
```

#### 输出
```typescript
interface AnalysisAgentOutput {
  marketInsights: {
    trends: string[];      // 市场趋势
    opportunities: string[]; // 市场机会
    threats: string[];     // 市场威胁
  };
  targetAudience: {
    segments: AudienceSegment[]; // 目标客群分群
    persona: PersonaDescription; // 典型用户画像
    sizeEstimation: number;      // 规模预估
  };
  competitorAnalysis: {
    mainCompetitors: CompetitorInfo[];
    competitiveAdvantage: string[];
    gaps: string[];
  };
  recommendations: string[]; // 初步建议
}
```

#### 提示词模板
- **行业分析模板**: 深度行业趋势分析
- **竞争分析模板**: 竞争对手对比分析
- **用户分析模板**: 目标客群画像分析

### 策划Agent
#### 输入
```typescript
interface StrategyAgentInput {
  analysisResults: AnalysisAgentOutput; // 分析阶段结果
  currentEvents: EventInfo[];           // 时事热点
  holidays: HolidayInfo[];              // 节假日信息
  budgetConstraints: BudgetInfo;        // 预算约束
  timeline: DateRange;                  // 时间范围
}
```

#### 输出
```typescript
interface StrategyAgentOutput {
  campaignTheme: {
    name: string;          // 活动主题
    slogan: string;        // 活动口号
    visualStyle: string;   // 视觉风格
  };
  marketingStrategy: {
    objectives: string[];  // 营销目标
    tactics: StrategyTactic[]; // 营销策略
    channels: ChannelPlan[];   // 渠道计划
  };
  activityPlan: {
    timeline: TimelineItem[]; // 活动时间线
    keyActions: string[];     // 关键行动
    dependencies: string[];   // 依赖关系
  };
  budgetPlan: {
    totalBudget: number;      // 总预算
    breakdown: BudgetItem[];  // 预算明细
    roiEstimation: number;    // ROI预估
  };
}
```

#### 提示词模板
- **促销活动模板**: 销售导向的活动策划
- **品牌活动模板**: 品牌形象提升策划
- **引流活动模板**: 用户增长导向策划

### 文案Agent
#### 输入
```typescript
interface CopywritingAgentInput {
  strategyPlan: StrategyAgentOutput; // 策划方案
  platformSpecs: PlatformSpec[];     // 平台特性
  brandGuidelines: BrandGuideline;   // 品牌指南
  forbiddenWords: string[];          // 禁忌词列表
}
```

#### 输出
```typescript
interface CopywritingAgentOutput {
  platformContents: {
    wechat: WechatContent;      // 微信公众号内容
    xiaohongshu: XHSContent;    // 小红书内容
    weibo: WeiboContent;        // 微博内容
    douyin: DouyinContent;      // 抖音内容
  };
  visualSuggestions: {
    coverImages: ImageSuggestion[]; // 封面图建议
    contentImages: ImageSuggestion[]; // 配图建议
    videoScripts: VideoScript[];    // 视频脚本
    colorPalette: string[];         // 配色方案
  };
  schedulingPlan: {
    publishSchedule: PublishSlot[]; // 发布时间表
    contentCalendar: CalendarEvent[]; // 内容日历
    optimizationTips: string[];     // 优化建议
  };
  complianceCheck: {
    platformRules: ComplianceItem[]; // 平台规则检查
    legalReview: LegalItem[];        // 法务审查点
    riskAssessment: RiskLevel;       // 风险评估
  };
}
```

#### 提示词模板
- **微信文案模板**: 公众号文章风格
- **小红书模板**: 种草笔记风格
- **微博模板**: 短文本+话题风格
- **抖音模板**: 短视频脚本风格

## 工作流引擎

### 执行流程
```typescript
class AgentWorkflowEngine {
  async executeCampaignPlan(customerData, industry, goals) {
    // 1. 分析阶段
    const analysis = await analysisAgent.execute({
      customerData,
      industryContext: industry,
      businessGoals: goals
    });

    // 2. 策划阶段
    const strategy = await strategyAgent.execute({
      analysisResults: analysis,
      currentEvents: await getCurrentEvents(),
      holidays: await getHolidays(),
      budgetConstraints: { maxBudget: 50000 }
    });

    // 3. 文案阶段
    const copywriting = await copywritingAgent.execute({
      strategyPlan: strategy,
      platformSpecs: await getPlatformSpecs(),
      brandGuidelines: await getBrandGuidelines()
    });

    return { analysis, strategy, copywriting };
  }
}
```

### 状态管理
- **工作流状态**: 运行中、暂停、完成、失败
- **Agent状态**: 每个Agent的执行状态
- **数据传递**: 阶段间数据传递和验证

### 错误处理
- **重试机制**: 可配置的重试策略
- **降级处理**: AI失败时使用规则引擎
- **人工干预**: 支持人工接管和调整

## RAG知识库集成

### 检索服务
- **向量检索**: 基于文本相似度的文档检索
- **混合检索**: 结合关键词和向量检索
- **相关性排序**: 按相关性分数排序结果

### 上下文构建
- **文档处理**: 提取关键信息和摘要
- **窗口管理**: 控制上下文长度和相关性
- **多源整合**: 整合多个知识源的信息

### 知识更新
- **反馈循环**: 用户反馈优化检索结果
- **自动扩展**: 新知识自动入库和索引
- **质量评估**: 知识质量评估和过滤

## API接口

### 工作流控制
- `POST /api/ai-engine/workflow/start` - 启动工作流
- `GET /api/ai-engine/workflow/{workflowId}` - 获取工作流状态
- `POST /api/ai-engine/workflow/{workflowId}/pause` - 暂停工作流
- `POST /api/ai-engine/workflow/{workflowId}/resume` - 继续工作流
- `POST /api/ai-engine/workflow/{workflowId}/cancel` - 取消工作流

### Agent执行
- `POST /api/ai-engine/agents/analysis/execute` - 执行分析Agent
- `POST /api/ai-engine/agents/strategy/execute` - 执行策划Agent
- `POST /api/ai-engine/agents/copywriting/execute` - 执行文案Agent

### 知识库操作
- `POST /api/ai-engine/knowledge/search` - 知识检索
- `POST /api/ai-engine/knowledge/feedback` - 提供反馈
- `GET /api/ai-engine/knowledge/stats` - 知识库统计

## 配置指南

### AI提供商配置
```bash
# Gemini API配置
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-pro-exp-03-25

# 阿里云百炼配置
ALIBABA_AI_ACCESS_KEY_ID=your_access_key_id
ALIBABA_AI_ACCESS_KEY_SECRET=your_access_key_secret
ALIBABA_AI_MODEL=qwen-max

# 本地模型配置（Docker）
LOCAL_AI_ENABLED=true
LOCAL_AI_MODEL_PATH=/models/qwen-7b
```

### RAG配置
```bash
# 向量数据库配置
VECTOR_DB_TYPE=qdrant
VECTOR_DB_URL=http://localhost:6333

# 检索配置
RETRIEVAL_TOP_K=5
SIMILARITY_THRESHOLD=0.7
```

## 性能指标

### 成功率指标
- **工作流执行成功率**: ≥95%
- **Agent生成成功率**: ≥98%
- **RAG检索准确率**: ≥85%

### 质量指标
- **内容专业性**: 达到专业CMO水平
- **平台适应性**: 符合各平台特性
- **合规性**: 通过法务和平台规则检查

### 性能指标
- **工作流执行时间**: <5分钟（典型场景）
- **Agent响应时间**: <30秒（单个Agent）
- **RAG检索时间**: <2秒

## 监控与维护

### 健康检查
- `GET /health/ai-engine` - AI引擎健康状态

### 性能监控
- Agent执行时间监控
- 工作流成功率监控
- Token使用量监控

### 质量监控
- 内容质量评估
- 用户反馈收集
- 知识库效果评估

## 常见问题

### AI生成质量低
1. 检查提示词模板是否合适
2. 验证输入数据质量
3. 考虑切换AI提供商

### 工作流执行失败
1. 检查Agent依赖服务
2. 验证数据传递格式
3. 查看详细错误日志

### RAG检索不准确
1. 优化知识库文档质量
2. 调整检索参数
3. 增加训练数据

---

**版本**: 1.0
**更新日期**: 2026-03-29
**相关模块**: `src/modules/ai-engine/agents/`