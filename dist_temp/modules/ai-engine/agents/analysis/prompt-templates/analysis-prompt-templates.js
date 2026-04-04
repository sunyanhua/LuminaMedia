"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allTemplates = exports.b2bAnalysisTemplate = exports.ecommerceAnalysisTemplate = exports.quickScanTemplate = exports.deepIndustryAnalysisTemplate = exports.standardAnalysisTemplate = void 0;
exports.selectTemplate = selectTemplate;
exports.standardAnalysisTemplate = {
    id: 'standard',
    name: '标准市场分析模板',
    industries: ['通用'],
    depthLevel: 3,
    generatePrompt: (params) => {
        const { industryContext, businessGoals, profileSummary, knowledgeContext } = params;
        const knowledgeText = knowledgeContext.length > 0
            ? `相关知识库内容：\n${knowledgeContext.slice(0, 3).join('\n')}`
            : '暂无相关知识库内容。';
        return `你是一位资深的市场营销分析专家。请基于以下信息进行全面的市场分析：

## 业务背景
- 行业：${industryContext}
- 业务目标：${businessGoals.join('、')}

## 目标客群画像
${profileSummary}

## 知识库参考
${knowledgeText}

## 分析要求
请提供完整的市场分析报告，包括以下四个部分：

### 1. 市场洞察
- **市场趋势**：识别当前行业的主要发展趋势（至少3条）
- **市场机会**：发现可把握的市场机会（至少3个）
- **市场威胁**：分析可能面临的市场威胁（至少2个）

### 2. 目标客群分析
- **客群分群**：基于提供的用户画像数据，将目标客群划分为3-5个细分群体
- **典型用户画像**：创建一个最具代表性的典型用户画像
- **规模预估**：基于行业数据和样本特征，预估目标客群总体规模

### 3. 竞品分析
- **主要竞争对手**：识别行业内的主要竞争对手（3-5个）
- **竞争优势**：分析我们相比竞争对手的潜在优势（至少3个）
- **差距分析**：识别我们与竞争对手之间的差距（至少2个）

### 4. 初步建议
基于以上分析，提出针对性的营销建议（至少5条具体可执行的建议）

请以结构化JSON格式输出分析结果。`;
    },
};
exports.deepIndustryAnalysisTemplate = {
    id: 'deep_industry',
    name: '深度行业分析模板',
    industries: ['金融', '医疗', '教育', '零售'],
    depthLevel: 5,
    generatePrompt: (params) => {
        const { industryContext, businessGoals, profileSummary, knowledgeContext } = params;
        const knowledgeText = knowledgeContext.length > 0
            ? `相关行业知识库内容：\n${knowledgeContext.slice(0, 5).join('\n')}`
            : '暂无相关行业知识库内容。';
        return `你是一位${industryContext}行业的首席市场分析师。请基于以下信息进行深度行业分析：

## 业务背景与战略目标
- 行业领域：${industryContext}
- 核心业务目标：${businessGoals.join('、')}
- 分析深度要求：行业级深度分析

## 目标客群深度画像
${profileSummary}

## 行业知识库参考
${knowledgeText}

## 深度分析框架要求

### 1. 行业级市场洞察
- **宏观趋势分析**：PEST分析（政治、经济、社会、技术）
- **中观产业链分析**：价值链、供应链、生态链分析
- **微观竞争格局**：市场份额、竞争态势、进入壁垒

### 2. 目标客群战略分群
- **细分标准**：基于行为数据、心理特征、价值主张的多维度细分
- **分群策略**：核心客户、增长客户、潜在客户、衰退客户
- **生命周期管理**：获客、激活、留存、变现、推荐的完整路径

### 3. 竞争战略分析
- **竞争对手矩阵**：领导者、挑战者、跟随者、补缺者
- **竞争策略评估**：成本领先、差异化、集中化策略分析
- **可持续竞争优势**：资源、能力、核心竞争力的分析

### 4. 战略建议与实施路径
- **短期战术**：可立即执行的营销活动（3个月内）
- **中期战略**：需要资源投入的战略举措（6-12个月）
- **长期规划**：构建核心竞争力的长期规划（1-3年）
- **风险评估**：技术风险、市场风险、执行风险、合规风险

### 5. 关键绩效指标（KPI）体系
- **市场指标**：市场份额、品牌知名度、客户满意度
- **财务指标**：客户终身价值、获客成本、投资回报率
- **运营指标**：转化率、留存率、活跃度、推荐率

请输出详细的结构化分析报告，包含数据支撑和逻辑论证。`;
    },
};
exports.quickScanTemplate = {
    id: 'quick_scan',
    name: '快速市场扫描模板',
    industries: ['通用'],
    depthLevel: 1,
    generatePrompt: (params) => {
        const { industryContext, businessGoals, profileSummary } = params;
        return `快速市场分析需求：

行业：${industryContext}
目标：${businessGoals.join('、')}

用户画像摘要：
${profileSummary}

请快速提供：
1. 3个主要市场机会
2. 2个关键风险点
3. 目标客群的3个核心特征
4. 3个立即行动建议

格式要求简洁，每条不超过50字。`;
    },
};
exports.ecommerceAnalysisTemplate = {
    id: 'ecommerce',
    name: '电商零售分析模板',
    industries: ['电商', '零售', '消费品'],
    depthLevel: 4,
    generatePrompt: (params) => {
        const { industryContext, businessGoals, profileSummary, knowledgeContext } = params;
        const knowledgeText = knowledgeContext.length > 0
            ? `电商行业知识：\n${knowledgeContext.slice(0, 4).join('\n')}`
            : '暂无电商行业专项知识。';
        return `你是一位电商零售行业的市场分析专家。请基于以下信息进行电商专项分析：

## 电商业务背景
- 细分领域：${industryContext}
- 业务目标：${businessGoals.join('、')}

## 电商用户画像
${profileSummary}

## 电商行业知识
${knowledgeText}

## 电商专项分析要点

### 1. 电商市场趋势
- **渠道趋势**：平台电商、社交电商、直播电商、私域电商
- **消费趋势**：Z世代消费、银发经济、下沉市场、跨境消费
- **技术趋势**：AI推荐、AR试穿、直播技术、支付创新

### 2. 电商用户分群
- **购买行为分群**：高频买家、囤货型、尝鲜型、折扣敏感型
- **生命周期分群**：新客、成长客、成熟客、沉睡客、流失客
- **价值分群**：高价值客户、潜力客户、一般客户、低价值客户

### 3. 电商竞争分析
- **平台竞争**：淘宝/天猫、京东、拼多多、抖音电商、小红书
- **品牌竞争**：头部品牌、新兴品牌、白牌、跨境品牌
- **流量竞争**：搜索流量、推荐流量、内容流量、社交流量

### 4. 电商营销建议
- **流量获取**：搜索优化、内容营销、直播带货、社交媒体
- **转化提升**：页面优化、促销策略、信任建设、支付便捷
- **用户留存**：会员体系、个性化推荐、社群运营、忠诚计划
- **数据驱动**：用户行为分析、AB测试、预测模型、实时优化

请输出针对电商行业的专项分析报告。`;
    },
};
exports.b2bAnalysisTemplate = {
    id: 'b2b',
    name: 'B2B企业服务分析模板',
    industries: ['企业服务', 'SaaS', '软件', '咨询'],
    depthLevel: 4,
    generatePrompt: (params) => {
        const { industryContext, businessGoals, profileSummary, knowledgeContext } = params;
        const knowledgeText = knowledgeContext.length > 0
            ? `B2B行业知识：\n${knowledgeContext.slice(0, 4).join('\n')}`
            : '暂无B2B行业专项知识。';
        return `你是一位B2B企业服务行业的市场分析专家。请基于以下信息进行B2B专项分析：

## B2B业务背景
- 服务领域：${industryContext}
- 客户目标：${businessGoals.join('、')}

## 企业客户画像
${profileSummary}

## B2B行业知识
${knowledgeText}

## B2B专项分析要点

### 1. 企业市场趋势
- **数字化转型**：云化、SaaS化、智能化、平台化趋势
- **采购决策变化**：委员会决策、价值导向、ROI驱动、风险规避
- **竞争格局**：生态竞争、平台竞争、解决方案竞争

### 2. 企业客户分群
- **企业规模分群**：大型企业、中型企业、小微企业、初创企业
- **行业垂直分群**：金融、制造、零售、教育、医疗等垂直行业
- **决策角色分群**：决策者、影响者、使用者、采购者、技术者

### 3. B2B竞争分析
- **解决方案竞争**：功能完整性、集成能力、定制化程度、服务质量
- **定价竞争**：订阅制、许可证、用量计费、混合模式
- **生态竞争**：合作伙伴生态、开发者生态、集成生态

### 4. B2B营销建议
- **获客策略**：内容营销、活动营销、客户案例、口碑推荐
- **销售支持**：销售材料、ROI计算器、产品演示、试用体验
- **客户成功**：实施服务、培训支持、客户社区、续费管理
- **产品策略**：产品路线图、功能优先级、定价策略、包装方案

请输出针对B2B企业服务行业的专项分析报告。`;
    },
};
function selectTemplate(industry, depthRequired = 3) {
    const industryLower = industry.toLowerCase();
    if (['电商', '零售', '消费品', 'ecommerce'].some((keyword) => industryLower.includes(keyword))) {
        return exports.ecommerceAnalysisTemplate;
    }
    if (['企业服务', 'saas', '软件', '咨询', 'b2b'].some((keyword) => industryLower.includes(keyword))) {
        return exports.b2bAnalysisTemplate;
    }
    if (['金融', '医疗', '教育'].some((keyword) => industryLower.includes(keyword))) {
        return exports.deepIndustryAnalysisTemplate;
    }
    if (depthRequired >= 4) {
        return exports.deepIndustryAnalysisTemplate;
    }
    else if (depthRequired <= 2) {
        return exports.quickScanTemplate;
    }
    return exports.standardAnalysisTemplate;
}
exports.allTemplates = [
    exports.standardAnalysisTemplate,
    exports.deepIndustryAnalysisTemplate,
    exports.quickScanTemplate,
    exports.ecommerceAnalysisTemplate,
    exports.b2bAnalysisTemplate,
];
//# sourceMappingURL=analysis-prompt-templates.js.map