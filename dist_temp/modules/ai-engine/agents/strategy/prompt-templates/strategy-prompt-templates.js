"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allStrategyTemplates = exports.salesPromotionTemplate = exports.brandBuildingTemplate = exports.productLaunchTemplate = exports.standardStrategyTemplate = void 0;
exports.selectStrategyTemplate = selectStrategyTemplate;
exports.standardStrategyTemplate = {
    id: 'standard',
    name: '标准营销策划模板',
    scenarios: ['品牌推广', '产品发布', '促销活动', '用户增长'],
    campaignTypes: ['综合型', '品牌型', '促销型', '内容型'],
    depthLevel: 3,
    generatePrompt: (params) => {
        const { analysisResults, currentEvents, holidays, budgetConstraints, timeline, industryContext, } = params;
        const eventsSummary = currentEvents.length > 0
            ? `相关时事热点：\n${currentEvents
                .slice(0, 3)
                .map((e) => `- ${e.title} (${e.date}): ${e.description}`)
                .join('\n')}`
            : '暂无相关时事热点。';
        const holidaysSummary = holidays.length > 0
            ? `相关节假日：\n${holidays
                .slice(0, 3)
                .map((h) => `- ${h.name} (${h.date}): ${h.description}`)
                .join('\n')}`
            : '暂无相关节假日。';
        const budgetSummary = `预算约束：总预算${budgetConstraints.totalBudget}${budgetConstraints.currency}，分配：${budgetConstraints.breakdown.map((b) => `${b.channel}: ${b.percentage}%`).join('、')}`;
        return `你是一位资深营销策划专家。基于以下分析结果和市场环境，请制定完整的营销策划方案：

## 业务背景
- 行业：${industryContext}
- 时间范围：${timeline.startDate} 至 ${timeline.endDate} (共${timeline.durationDays}天)

## 前期分析结果摘要
${generateAnalysisSummary(analysisResults)}

## 市场环境因素
${eventsSummary}

${holidaysSummary}

## 资源约束
${budgetSummary}

## 策划要求
请制定完整的营销策划方案，包括以下六个部分：

### 1. 活动主题策划
- **活动主题名称**：具有吸引力、易于记忆的主题名称
- **核心口号**：简洁有力的宣传口号（不超过10字）
- **视觉风格**：主视觉风格描述（色彩、元素、调性）
- **关键信息**：需要传达的3-5个核心信息点

### 2. 营销策略设计
- **营销目标**：明确、可衡量的3-5个SMART目标
- **目标客群**：基于前期分析，明确重点瞄准的客群细分
- **核心策略**：整体营销策略框架（如：内容驱动、社交引爆、渠道联动等）
- **战术组合**：具体的营销战术组合（至少5种不同战术）

### 3. 渠道计划
- **渠道选择**：选择3-5个核心营销渠道
- **渠道策略**：每个渠道的具体执行策略
- **内容适配**：不同渠道的内容形式和调性适配
- **预算分配**：各渠道的预算分配建议

### 4. 活动时间线
- **阶段划分**：将整个活动划分为3-4个关键阶段（如：预热期、引爆期、延续期）
- **每周计划**：详细到每周的关键活动和产出物
- **里程碑**：关键里程碑节点和交付物
- **依赖关系**：活动间的依赖关系和时序要求

### 5. 预算规划
- **预算分配**：详细的预算分配表（按渠道、按资源类型）
- **ROI预估**：投资回报率预估和关键假设
- **成本控制**：成本控制措施和风险预算
- **效果评估**：各预算项的效果评估方法

### 6. 风险与成功保障
- **风险识别**：识别3-5个主要风险点（如：执行风险、市场风险、资源风险）
- **应对策略**：每个风险的应对策略
- **成功保障**：确保活动成功的3-5个关键保障措施
- **应急预案**：突发情况的应急预案

请以结构化JSON格式输出策划方案，确保方案具备可执行性和可衡量性。`;
    },
};
exports.productLaunchTemplate = {
    id: 'product_launch',
    name: '新品发布专项模板',
    scenarios: ['产品发布', '功能更新', '版本升级'],
    campaignTypes: ['发布型', '体验型', '预售型'],
    depthLevel: 4,
    generatePrompt: (params) => {
        const { analysisResults, currentEvents, holidays, budgetConstraints, timeline, industryContext, } = params;
        const eventsSummary = currentEvents.length > 0
            ? `可借势的热点事件：\n${currentEvents
                .slice(0, 3)
                .map((e) => `- ${e.title} (${e.date}): ${e.description}`)
                .join('\n')}`
            : '暂无适合借势的热点事件。';
        return `你是一位新品发布专家。基于以下分析结果，请制定专业的新品发布策划方案：

## 新品发布背景
- 行业：${industryContext}
- 发布时间：${timeline.startDate} 至 ${timeline.endDate}
- 发布类型：新品首发

## 市场分析摘要
${generateAnalysisSummary(analysisResults)}

## 发布环境分析
${eventsSummary}

## 发布策划要求

### 1. 发布主题与定位
- **发布主题**：体现产品核心价值的发布主题
- **产品定位**：清晰的产品定位和市场定位
- **核心信息**：需要传达的3个核心产品信息
- **差异化卖点**：与竞品的关键差异化点

### 2. 发布节奏设计
- **预热期**（发布前2-4周）：悬念营销、内容铺垫、KOL预热
- **引爆期**（发布当天）：发布会、媒体通稿、社交引爆
- **延续期**（发布后1-4周）：口碑传播、用户试用、销售转化
- **每个阶段的具体行动计划和产出物**

### 3. 发布渠道策略
- **媒体渠道**：科技媒体、行业媒体、大众媒体
- **社交渠道**：微博、微信、小红书、抖音
- **线下渠道**：发布会、体验店、渠道伙伴
- **KOL/KOC**：头部、腰部、尾部达人的合作策略

### 4. 体验与转化设计
- **产品体验**：试用、Demo、体验店设计
- **转化路径**：从认知到购买的全链路设计
- **预售策略**：预售优惠、限量版、早鸟价
- **销售支持**：销售材料、话术、培训

### 5. 效果衡量与优化
- **发布效果指标**：媒体曝光、社交声量、网站流量、预售数量
- **数据监控**：实时数据监控和预警机制
- **优化调整**：基于数据的快速优化调整

请输出专业的新品发布策划方案，重点突出发布节奏和转化设计。`;
    },
};
exports.brandBuildingTemplate = {
    id: 'brand_building',
    name: '品牌建设专项模板',
    scenarios: ['品牌升级', '品牌重塑', '品牌年轻化'],
    campaignTypes: ['品牌型', '内容型', '社交型'],
    depthLevel: 4,
    generatePrompt: (params) => {
        const { analysisResults, currentEvents, holidays, budgetConstraints, timeline, industryContext, } = params;
        return `你是一位品牌建设专家。基于以下分析结果，请制定专业的品牌建设策划方案：

## 品牌建设背景
- 行业：${industryContext}
- 建设周期：${timeline.startDate} 至 ${timeline.endDate}
- 建设目标：提升品牌认知、美誉度、忠诚度

## 品牌现状分析
${generateAnalysisSummary(analysisResults)}

## 品牌策划要求

### 1. 品牌策略规划
- **品牌定位**：清晰的品牌定位和价值主张
- **品牌个性**：品牌人格化设计（如：亲切、专业、创新）
- **品牌信息**：核心品牌信息和沟通要点
- **品牌视觉**：视觉识别系统升级建议

### 2. 品牌内容策略
- **内容主题**：品牌故事、价值观、使命愿景的内容策划
- **内容形式**：文章、视频、图片、音频等内容形式规划
- **内容日历**：季度/月度内容发布计划
- **内容分发**：内容分发渠道和推广策略

### 3. 品牌体验设计
- **线上体验**：官网、APP、社交媒体的品牌体验设计
- **线下体验**：实体店、活动、物料的品牌体验设计
- **服务体验**：客户服务、售后支持的品牌体验设计
- **员工体验**：内部员工的品牌文化传达

### 4. 品牌传播计划
- **媒体关系**：媒体合作、专访、软文投放
- **社交传播**：社交媒体品牌传播战役
- **KOL合作**：品牌代言人、KOL合作策略
- **口碑营销**：用户口碑、案例传播、社群运营

### 5. 品牌效果评估
- **品牌指标**：品牌知名度、美誉度、忠诚度测量
- **传播效果**：媒体价值、社交声量、互动效果
- **商业效果**：品牌对销售的贡献度评估

请输出专业的品牌建设策划方案，注重长期品牌价值建设。`;
    },
};
exports.salesPromotionTemplate = {
    id: 'sales_promotion',
    name: '促销转化专项模板',
    scenarios: ['销售提升', '库存清理', '用户转化'],
    campaignTypes: ['促销型', '转化型', '召回型'],
    depthLevel: 3,
    generatePrompt: (params) => {
        const { analysisResults, currentEvents, holidays, budgetConstraints, timeline, industryContext, } = params;
        const holidayPromo = holidays
            .filter((h) => h.marketingOpportunity)
            .slice(0, 3)
            .map((h) => `- ${h.name} (${h.date}): ${h.description}`)
            .join('\n') || '暂无适合促销的节假日。';
        return `你是一位促销转化专家。基于以下分析结果，请制定高效的促销转化策划方案：

## 促销活动背景
- 行业：${industryContext}
- 活动时间：${timeline.startDate} 至 ${timeline.endDate}
- 促销目标：快速提升销售转化

## 目标客群分析
${generateAnalysisSummary(analysisResults)}

## 促销时机分析
${holidayPromo}

## 促销策划要求

### 1. 促销策略设计
- **促销目标**：具体的销售目标（如：销量提升30%、转化率提升15%）
- **目标客群**：重点促销的目标客群细分
- **促销机制**：折扣、满减、赠品、抽奖、组合促销等机制设计
- **价格策略**：促销定价策略和价格锚点设计

### 2. 促销渠道规划
- **线上渠道**：电商平台、官网、APP、社交电商
- **线下渠道**：门店、渠道商、合作伙伴
- **社交传播**：社交媒体的促销信息传播
- **广告投放**：促销广告投放渠道和创意

### 3. 促销转化优化
- **转化路径**：从曝光到购买的全链路优化
- **页面优化**：促销页面的设计和用户体验优化
- **购物车优化**：减少购物车放弃率的措施
- **支付优化**：支付流程简化和信任建设

### 4. 促销执行计划
- **预热期**：预告、蓄水、预约
- **爆发期**：限时、限量、抢购设计
- **延续期**：返场、补货、口碑传播
- **每个阶段的具体执行动作和时间节点**

### 5. 促销效果监控
- **实时监控**：销售数据实时监控仪表板
- **效果评估**：促销ROI、增量销售、新客获取
- **风险控制**：库存风险、价格体系风险、利润风险
- **优化调整**：基于数据的快速优化调整

请输出高效的促销转化策划方案，注重短期销售效果和长期客户价值平衡。`;
    },
};
function generateAnalysisSummary(analysis) {
    const { marketInsights, targetAudience, competitorAnalysis, recommendations, } = analysis;
    return `### 市场洞察摘要
- 主要趋势：${marketInsights.trends.slice(0, 3).join('、')}
- 关键机会：${marketInsights.opportunities.slice(0, 3).join('、')}
- 主要威胁：${marketInsights.threats.slice(0, 2).join('、')}

### 目标客群摘要
- 细分群体：${targetAudience.segments
        .slice(0, 3)
        .map((s) => s.name)
        .join('、')}
- 典型用户：${targetAudience.persona.name}（${targetAudience.persona.demographics.ageRange}，${targetAudience.persona.demographics.occupation}）
- 规模预估：约${targetAudience.sizeEstimation.toLocaleString()}人

### 竞争分析摘要
- 主要对手：${competitorAnalysis.mainCompetitors
        .slice(0, 3)
        .map((c) => c.name)
        .join('、')}
- 我方优势：${competitorAnalysis.competitiveAdvantage.slice(0, 3).join('、')}
- 关键差距：${competitorAnalysis.gaps.slice(0, 2).join('、')}

### 前期建议摘要
${recommendations
        .slice(0, 5)
        .map((r, i) => `${i + 1}. ${r}`)
        .join('\n')}`;
}
function selectStrategyTemplate(scenario, campaignType, depthRequired = 3) {
    const scenarioLower = scenario.toLowerCase();
    const campaignTypeLower = campaignType.toLowerCase();
    if (['产品发布', '新品发布', '功能发布', '版本发布'].some((keyword) => scenarioLower.includes(keyword))) {
        return exports.productLaunchTemplate;
    }
    if (['品牌建设', '品牌升级', '品牌重塑', '品牌年轻化'].some((keyword) => scenarioLower.includes(keyword))) {
        return exports.brandBuildingTemplate;
    }
    if (['促销', '销售提升', '转化', '清仓'].some((keyword) => scenarioLower.includes(keyword))) {
        return exports.salesPromotionTemplate;
    }
    return exports.standardStrategyTemplate;
}
exports.allStrategyTemplates = [
    exports.standardStrategyTemplate,
    exports.productLaunchTemplate,
    exports.brandBuildingTemplate,
    exports.salesPromotionTemplate,
];
//# sourceMappingURL=strategy-prompt-templates.js.map