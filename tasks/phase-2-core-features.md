# LuminaMedia 2.0 实施任务清单 - 第二阶段: 核心功能开发

## 阶段概述
**时间**: 3-5个月
**目标**: 实现五大功能模块中的核心功能，包括SmartDataEngine、AI Agent工作流引擎和矩阵分发中心
**核心交付物**: SmartDataEngine完整实现、AI Agent工作流引擎、内容发布平台基础功能、Mobile-First前端框架

## 详细任务分解

### 里程碑4: SmartDataEngine (智能数据引擎) (4周)

#### 任务4.1: 数据导入适配器
- **任务描述**: 实现Excel/CSV智能解析和API数据流式接收
- **技术方案**:
  - 创建 `src/modules/data-engine/import/` 模块
  - 实现 `ExcelParserService` 支持.xlsx/.csv文件解析
  - 实现 `ApiDataReceiverService` 支持实时API数据接收
  - 设计数据验证和清洗管道
- **文件格式支持**:
  - Excel (.xlsx, .xls) - 使用xlsx或exceljs库
  - CSV (.csv) - 支持UTF-8/BOM编码
  - JSON (.json) - 结构化数据导入
- **智能字段映射**:
  ```typescript
  // AI自动识别非标表头映射到标准4维度
  const fieldMapping = {
    '顾客姓名': 'customer_name',
    '手机号': 'mobile',
    '消费金额': 'purchase_amount',
    // AI自动推断映射关系
  };
  ```
- **验收标准**:
  - 支持100MB以内文件上传
  - 自动识别常见中文表头
  - 数据验证错误报告详细
  - 支持增量导入和去重

#### 任务4.2: AI字段自动映射引擎
- **任务描述**: AI自动识别非标Excel/API表头，转换为标准4维度字段
- **技术方案**:
  - 创建 `FieldMappingService` 使用LLM分析表头语义
  - 建立标准字段词典（4维度共50+标准字段）
  - 实现映射规则学习和缓存
  - 提供人工修正和确认界面
- **AI提示词设计**:
  ```
  你是一个数据字段映射专家。请将以下Excel表头映射到标准字段：
  输入表头: ['顾客名', '手机', '消费额', '购买时间']
  标准维度: [基础信息, 联系方式, 消费行为, 时间戳]
  请输出JSON映射关系。
  ```
- **标准4维度字段体系**:
  1. **基础生命周期属性**: age_group, education, family_role, potential_value
  2. **消费性格属性**: consumption_level, shopping_width, decision_speed
  3. **实时状态属性**: activity_level, growth_trend, engagement_score
  4. **社交与活动属性**: fission_potential, activity_preference, social_influence
- **验收标准**:
  - 常见中文表头映射准确率≥90%
  - 支持人工修正和规则保存
  - 映射结果可导出为模板

#### 任务4.3: 离线标签计算引擎
- **任务描述**: 基于SQL的高效离线标签计算，避免Token浪费
- **技术方案**:
  - 设计标签计算SQL模板系统
  - 实现 `TagCalculatorService` 执行批量计算
  - 使用MySQL窗口函数进行复杂计算
  - Redis缓存中间结果
- **计算示例**:
  ```sql
  -- 计算用户消费等级标签
  WITH user_stats AS (
    SELECT
      customer_id,
      SUM(purchase_amount) as total_spent,
      COUNT(DISTINCT purchase_date) as active_days,
      NTILE(4) OVER (ORDER BY SUM(purchase_amount) DESC) as spending_quartile
    FROM purchase_records
    WHERE purchase_date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    GROUP BY customer_id
  )
  UPDATE customer_tags
  SET consumption_level =
    CASE
      WHEN spending_quartile = 1 THEN 'high'
      WHEN spending_quartile = 2 THEN 'medium_high'
      WHEN spending_quartile = 3 THEN 'medium_low'
      ELSE 'low'
    END
  FROM user_stats;
  ```
- **标签类型**:
  - **统计型标签**: RFM模型、活跃度、消费频次
  - **规则型标签**: 会员等级、生命周期阶段
  - **模型型标签**: 流失风险预测、价值评分
- **验收标准**:
  - 100万数据标签计算时间<10分钟
  - 支持增量更新和全量重算
  - 计算过程可监控和中断

#### 任务4.4: 4维度用户画像系统
- **任务描述**: 基于标签计算生成完整的4维度用户画像
- **技术方案**:
  - 创建 `UserProfileService` 整合4维度数据
  - 设计画像数据模型和API
  - 实现画像可视化组件
  - 支持画像对比和趋势分析
- **画像数据结构**:
  ```typescript
  interface UserProfile4D {
    // 基础生命周期维度
    basicLifecycle: {
      ageGroup: '18-25' | '26-35' | '36-45' | '46+';
      education: 'high_school' | 'bachelor' | 'master' | 'phd';
      familyRole: 'single' | 'married_no_kids' | 'married_with_kids';
      potentialValue: 'low' | 'medium' | 'high';
    };
    // 消费性格维度
    consumptionPersonality: {
      consumptionLevel: 'low' | 'medium' | 'high' | 'premium';
      shoppingWidth: 'narrow' | 'medium' | 'wide'; // 品类宽度
      decisionSpeed: 'fast' | 'medium' | 'slow'; // 决策速度
    };
    // 实时状态维度
    realtimeStatus: {
      activityLevel: number; // 0-100活跃度分数
      growthTrend: 'declining' | 'stable' | 'growing' | 'fast_growing';
      engagementScore: number; // 0-100参与度分数
    };
    // 社交与活动维度
    socialActivity: {
      fissionPotential: 'low' | 'medium' | 'high'; // 裂变潜力
      activityPreference: string[]; // 活动偏好标签
      socialInfluence: number; // 社交影响力分数
    };
  }
  ```
- **验收标准**:
  - 画像数据实时可查
  - 支持画像分群和筛选
  - 可视化展示直观易懂

#### 任务4.5: 数据质量监控
- **任务描述**: 实现数据缺失预警和完整性校验
- **技术方案**:
  - 创建 `DataQualityMonitorService`
  - 定义数据质量规则（完整性、准确性、一致性、时效性）
  - 实现实时监控和定时扫描
  - 集成告警通知（邮件、钉钉、企业微信）
- **监控规则示例**:
  ```yaml
  rules:
    - name: 'mobile_phone_completeness'
      table: 'customer_profiles'
      field: 'mobile'
      condition: 'IS NOT NULL AND LENGTH(mobile) = 11'
      threshold: 0.95  # 完整度需≥95%
      severity: 'warning'

    - name: 'purchase_records_timeliness'
      table: 'purchase_records'
      field: 'purchase_date'
      condition: 'purchase_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
      threshold: 0.8   # 近7天数据占比需≥80%
      severity: 'error'
  ```
- **验收标准**:
  - 关键字段缺失率<5%
  - 数据异常24小时内发现
  - 支持自定义质量规则

### 里程碑5: AI Agent工作流引擎 (5周)

#### 任务5.1: 分析Agent实现
- **任务描述**: 实现分析阶段Agent，生成市场洞察和目标客群分析
- **技术方案**:
  - 创建 `src/modules/ai-engine/agents/analysis/` 模块
  - 设计分析Agent提示词模板库
  - 集成RAG知识库检索
  - 实现结构化输出解析
- **分析Agent输入**:
  ```typescript
  interface AnalysisAgentInput {
    customerData: UserProfile4D[];  // 客户数据样本
    industryContext: string;        // 行业背景
    businessGoals: string[];        // 业务目标
    knowledgeBaseContext: string[]; // 知识库检索结果
  }
  ```
- **分析Agent输出**:
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
- **验收标准**:
  - 分析报告结构完整，逻辑清晰
  - 支持多行业模板
  - 分析深度达到专业CMO水平

#### 任务5.2: 策划Agent实现
- **任务描述**: 实现策划阶段Agent，生成营销策略和活动方案
- **技术方案**:
  - 创建 `src/modules/ai-engine/agents/strategy/` 模块
  - 设计策划Agent提示词模板库
  - 集成时事热点和节假日数据
  - 实现预算规划和ROI预估
- **策划Agent输入**:
  ```typescript
  interface StrategyAgentInput {
    analysisResults: AnalysisAgentOutput; // 分析阶段结果
    currentEvents: EventInfo[];           // 时事热点
    holidays: HolidayInfo[];              // 节假日信息
    budgetConstraints: BudgetInfo;        // 预算约束
    timeline: DateRange;                  // 时间范围
  }
  ```
- **策划Agent输出**:
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
- **验收标准**:
  - 营销方案具备可执行性
  - 预算分配合理，ROI预估可信
  - 支持多场景模板（促销、品牌、引流等）

#### 任务5.3: 文案Agent实现
- **任务描述**: 实现文案阶段Agent，生成各平台定制化文案
- **技术方案**:
  - 创建 `src/modules/ai-engine/agents/copywriting/` 模块
  - 设计多平台文案模板（微信、小红书、微博、抖音）
  - 集成客户风格和禁忌词库
  - 实现视觉建议和排期计划
- **文案Agent输入**:
  ```typescript
  interface CopywritingAgentInput {
    strategyPlan: StrategyAgentOutput; // 策划方案
    platformSpecs: PlatformSpec[];     // 平台特性
    brandGuidelines: BrandGuideline;   // 品牌指南
    forbiddenWords: string[];          // 禁忌词列表
  }
  ```
- **文案Agent输出**:
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
- **验收标准**:
  - 各平台文案符合平台特性
  - 视觉建议具体可执行
  - 排期计划合理可行

#### 任务5.4: Agent工作流引擎
- **任务描述**: 实现Agent间协作和流程管理
- **技术方案**:
  - 创建 `AgentWorkflowEngine` 管理三阶段流程
  - 实现Agent间数据传递和状态管理
  - 支持人工干预和调整
  - 完整审计日志记录
- **工作流设计**:
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
- **验收标准**:
  - 工作流执行成功率≥95%
  - 支持中途暂停和继续
  - 完整的过程审计日志

#### 任务5.5: RAG知识库深度集成
- **任务描述**: 实现RAG知识库与AI Agent的深度集成
- **技术方案**:
  - 创建知识库检索服务 `KnowledgeRetrievalService`
  - 设计检索增强生成提示词模板
  - 实现上下文窗口管理和优化
  - 支持知识库反馈和优化
- **RAG集成流程**:
  ```
  1. 用户查询 → 向量检索 → 获取相关文档
  2. 文档处理 → 提取关键信息 → 构建上下文
  3. 上下文拼接 → AI生成 → 返回结果
  4. 结果评估 → 知识库更新 → 持续优化
  ```
- **验收标准**:
  - 检索准确率≥85%
  - 生成内容相关性评分≥4/5
  - 知识库更新自动化

### 里程碑6: 矩阵分发中心 (4周)

#### 任务6.1: 三审三校工作流
- **任务描述**: 实现内容发布的三审三校工作流引擎
- **技术方案**:
  - 创建 `src/modules/workflow/` 模块
  - 设计工作流状态机（草稿 → 编辑初审 → AI自检 → 主管复审 → 法务终审 → 发布）
  - 实现审批节点和权限控制
  - 集成通知和提醒系统
- **工作流状态**:
  ```typescript
  enum ContentStatus {
    DRAFT = 'draft',           // 草稿
    EDITOR_REVIEW = 'editor_review', // 编辑初审
    AI_CHECK = 'ai_check',     // AI安全自检
    MANAGER_REVIEW = 'manager_review', // 主管复审
    LEGAL_REVIEW = 'legal_review', // 法务终审
    APPROVED = 'approved',     // 审批通过
    PUBLISHED = 'published',   // 已发布
    REJECTED = 'rejected',     // 被拒绝
    NEEDS_REVISION = 'needs_revision', // 需要修改
  }
  ```
- **验收标准**:
  - 工作流可配置，支持自定义审批节点
  - 审批历史完整记录
  - 支持加急和并行审批

#### 任务6.2: 跨平台发布引擎
- **任务描述**: 实现微信、小红书、微博、抖音等多平台发布
- **技术方案**:
  - 创建平台适配器抽象层 `PlatformAdapter`
  - 实现 `WechatAdapter` 使用官方API
  - 实现 `XHSAdapter` 使用OpenClaw Browser Agent
  - 实现 `WeiboAdapter` 和 `DouyinAdapter`
- **微信发布流程**:
  ```
  1. 获取Access Token → 2. 上传素材 → 3. 组装消息 → 4. 调用发布API
  5. 获取发布结果 → 6. 更新数据库状态
  ```
- **小红书发布流程**:
  ```
  1. 启动Browser Agent → 2. 登录账号 → 3. 模拟点击发布
  4. 填写内容 → 5. 上传图片 → 6. 提交发布
  7. 获取发布链接 → 8. 关闭Browser
  ```
- **验收标准**:
  - 微信官方API发布成功率≥98%
  - 小红书模拟发布成功率≥90%
  - 支持失败重试和错误处理

#### 任务6.3: 自动排版和配图
- **任务描述**: 实现微信公众号自动排版和AI配图生成
- **技术方案**:
  - 集成微信公众号排版模板库
  - 实现 `WechatFormatterService` 自动应用样式
  - 集成AI图片生成服务（DALL-E、Midjourney等）
  - 实现图片优化和压缩
- **排版功能**:
  - 标题样式（h1-h6）
  - 正文样式（字体、字号、行高）
  - 引用块和代码块
  - 图片居中和对齐
  - 分隔线和空行
- **配图生成**:
  ```typescript
  interface ImageGenerationRequest {
    theme: string;           // 主题
    style: 'realistic' | 'cartoon' | 'minimal' | 'vibrant';
    size: 'square' | 'horizontal' | 'vertical';
    colorScheme: string[];   // 配色方案
    textOverlay?: string;    // 文字叠加
  }
  ```
- **验收标准**:
  - 排版结果符合微信规范
  - 配图生成相关性评分≥4/5
  - 支持自定义排版模板

## 第二阶段交付物清单

### 代码交付物
1. `src/modules/data-engine/` - SmartDataEngine完整实现
2. `src/modules/ai-engine/agents/` - 三阶段Agent实现
3. `src/modules/workflow/` - 三审三校工作流引擎
4. `src/modules/publish/adapters/` - 多平台发布适配器
5. `dashboard-web/src/features/campaign/` - 营销活动管理界面

### 数据库交付物
1. `scripts/07-data-engine-tables.sql` - SmartDataEngine相关表结构
2. `scripts/08-agent-workflow-tables.sql` - Agent工作流相关表
3. `scripts/09-publish-platforms.sql` - 发布平台配置数据

### 文档交付物
1. `docs/features/smart-data-engine.md` - SmartDataEngine使用指南
2. `docs/features/ai-agent-workflow.md` - AI Agent工作流设计文档
3. `docs/features/matrix-distribution.md` - 矩阵分发中心操作手册
4. `docs/api/data-engine-api.md` - 数据引擎API文档

### 测试交付物
1. SmartDataEngine性能测试报告（600万数据处理）
2. AI Agent工作流质量评估报告
3. 多平台发布成功率测试报告
4. 端到端集成测试套件

## 第二阶段成功标准
1. ✅ SmartDataEngine支持600万数据处理，标签计算准确率≥95%
2. ✅ AI Agent工作流生成内容达到专业CMO水平
3. ✅ 矩阵分发中心支持4个主要平台发布，成功率≥95%
4. ✅ Mobile-First前端框架完成核心功能界面
5. ✅ 端到端流程测试通过，DEMO可完整演示

## 第二阶段完成后启动条件
- SmartDataEngine性能测试达标
- AI生成内容质量评审通过
- 多平台发布稳定性验证
- 用户验收测试完成

---

**文件**: `tasks/phase-2-core-features.md`
**版本**: 1.0
**更新日期**: 2026-03-26
**上一阶段**: [phase-1-foundation.md](./phase-1-foundation.md)
**下一阶段**: [phase-3-advanced-features.md](./phase-3-advanced-features.md)