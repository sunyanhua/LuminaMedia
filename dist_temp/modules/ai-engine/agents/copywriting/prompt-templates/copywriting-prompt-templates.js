"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allCopywritingTemplates = exports.crisisCommunicationTemplate = exports.holidayMarketingTemplate = exports.productPromotionTemplate = exports.brandStorytellingTemplate = exports.standardMultiPlatformTemplate = void 0;
exports.selectCopywritingTemplate = selectCopywritingTemplate;
exports.standardMultiPlatformTemplate = {
    id: 'standard_multi_platform',
    name: '标准多平台文案模板',
    platforms: ['wechat', 'xiaohongshu', 'weibo', 'douyin'],
    contentType: 'campaign',
    depthLevel: 3,
    generatePrompt: (params) => {
        const { strategyPlan, platformSpecs, brandGuidelines, forbiddenWords, industryContext, targetAudience, } = params;
        const platformSummaries = platformSpecs
            .map((spec) => {
            return `- ${spec.platform}: ${spec.description}，内容类型：${spec.contentType}，${spec.wordLimit ? `字数限制：${spec.wordLimit}` : '无字数限制'}`;
        })
            .join('\n');
        const brandSummary = `品牌：${brandGuidelines.brandName}
口号：${brandGuidelines.tagline}
品牌价值观：${brandGuidelines.brandValues.join('、')}
品牌个性：${brandGuidelines.brandPersonality.adjectives.join('、')}，语调：${brandGuidelines.brandPersonality.toneOfVoice}
禁忌话题：${brandGuidelines.contentGuidelines.forbiddenTopics.join('、')}`;
        const strategySummary = generateStrategySummary(strategyPlan);
        return `你是一位资深的多平台内容创作专家。基于以下营销策略和品牌指南，请为微信、小红书、微博、抖音四个平台创作定制化的营销文案。

## 业务背景
- 行业：${industryContext}
- 目标受众：${targetAudience.join('、')}
- 活动主题：${strategyPlan.campaignTheme.name}
- 活动口号：${strategyPlan.campaignTheme.slogan}

## 品牌指南
${brandSummary}

## 营销策略摘要
${strategySummary}

## 平台特性要求
${platformSummaries}

## 禁忌词列表
${forbiddenWords.length > 0 ? forbiddenWords.join('、') : '无特殊禁忌词'}

## 创作要求

### 1. 微信公众号文章
- **标题**：吸引眼球，包含关键词，不超过20字
- **封面图描述**：详细描述封面图应呈现的内容、风格、色彩
- **摘要**：简洁有力，概括文章核心价值
- **正文结构**：
  - 开头：引人入胜，点明主题
  - 主体：分3-4个小节，每小节有小标题
  - 结尾：总结升华，引导行动
- **排版要求**：段落清晰，适当使用加粗、引用等格式
- **文末引导**：明确的行动号召（关注、留言、点击链接等）
- **标签**：5-8个相关标签

### 2. 小红书笔记
- **标题**：吸引女性用户，突出实用价值或情感共鸣
- **正文**：口语化表达，多用emoji，分段清晰
- **图片描述**：为4-9张图片提供详细的描述（每张图片的内容、角度、氛围）
- **话题标签**：8-12个相关话题，包含热门标签和品牌标签
- **商品标签**：如有相关产品，添加商品标签
- **互动引导**：引导点赞、收藏、评论、@好友

### 3. 微博博文
- **正文**：简洁有力，140字以内（可适当超出），可分段
- **图片描述**：为1-9张图片提供描述
- **话题标签**：2-4个热门话题
- **@提及**：@相关KOL或官方账号
- **互动引导**：引导转发、评论、点赞
- **投票或抽奖**：如有需要，设计简单的互动形式

### 4. 抖音视频
- **视频标题**：吸引年轻人，引发好奇或共鸣
- **视频脚本**：
  - 时长：15-60秒
  - 分3-5个场景，每个场景描述镜头、台词、特效
  - 明确开头钩子、中间内容、结尾引导
- **文案描述**：简短有力，补充视频内容
- **话题标签**：3-5个热门话题
- **购物车商品**：如有产品，描述商品卖点和价格
- **互动引导**：引导点赞、评论、分享、关注

### 5. 视觉建议
- **封面图**：为各平台提供封面图设计建议（主题、风格、色彩、元素）
- **内容配图**：为文章/笔记提供配图建议（数量、主题、风格）
- **视频视觉**：为抖音视频提供视觉风格建议（滤镜、特效、转场）
- **配色方案**：提供与品牌和活动主题相符的配色方案

### 6. 排期建议
- **发布时间**：为各平台建议最佳发布时间段
- **发布顺序**：如有跨平台联动，建议发布顺序
- **内容日历**：如有系列内容，提供内容日历规划

### 7. 合规检查
- **平台规则**：检查各平台内容是否符合平台规则
- **法务风险**：识别潜在的法务风险点（虚假宣传、侵权等）
- **禁忌词检查**：确保内容不包含禁忌词

请输出完整的结构化JSON格式内容，包含以上所有部分。确保内容符合各平台特性，风格与品牌一致，具有高互动潜力。`;
    },
};
exports.brandStorytellingTemplate = {
    id: 'brand_storytelling',
    name: '品牌故事讲述模板',
    platforms: ['wechat', 'xiaohongshu'],
    contentType: 'brand',
    depthLevel: 4,
    generatePrompt: (params) => {
        const { strategyPlan, platformSpecs, brandGuidelines, industryContext, targetAudience, } = params;
        const brandStoryElements = `
品牌名称：${brandGuidelines.brandName}
品牌使命：${brandGuidelines.tagline}
核心价值观：${brandGuidelines.brandValues.join('、')}
品牌故事要点：
1. 起源故事：品牌如何诞生，解决了什么问题
2. 发展历程：关键里程碑和成就
3. 价值主张：为顾客提供的独特价值
4. 未来愿景：品牌的未来方向和梦想`;
        return `你是一位品牌故事讲述专家。基于以下品牌信息，请创作打动人心的品牌故事内容。

## 品牌背景
${brandStoryElements}

## 行业与受众
- 行业：${industryContext}
- 目标受众：${targetAudience.join('、')}

## 创作要求

### 微信公众号品牌故事文章
- **标题**：体现品牌精神和价值观
- **结构**：
  1. 引子：以故事或场景开头，引发共鸣
  2. 品牌起源：讲述品牌创立背后的故事
  3. 核心价值：阐述品牌价值观和使命
  4. 产品/服务故事：通过具体案例展示品牌价值
  5. 用户故事：真实用户见证和评价
  6. 未来展望：品牌的梦想和承诺
  7. 互动邀请：邀请读者分享自己的品牌故事
- **风格**：温暖、真诚、有深度，避免过度商业化
- **视觉建议**：配图风格（怀旧、温馨、专业等）

### 小红书品牌故事笔记
- **角度**：从用户或员工的第一人称视角讲述
- **内容**：聚焦一个具体的品牌故事片段（如：一个产品的诞生、一次难忘的服务经历）
- **形式**：图片+文字故事，图片真实、有情感
- **话题标签**：#品牌故事 #创业故事 #品牌价值观

### 品牌故事视频脚本（可选）
- **时长**：60-90秒
- **场景**：3-4个关键场景（如：创业初期、突破时刻、用户感谢）
- **旁白**：真诚、自然的讲述风格
- **视觉**：真实画面、历史照片、用户访谈片段

请输出完整的品牌故事内容，注重情感共鸣和真实性。`;
    },
};
exports.productPromotionTemplate = {
    id: 'product_promotion',
    name: '产品推广专项模板',
    platforms: ['wechat', 'xiaohongshu', 'douyin'],
    contentType: 'article',
    depthLevel: 3,
    generatePrompt: (params) => {
        const { strategyPlan, platformSpecs, brandGuidelines, industryContext, targetAudience, } = params;
        return `你是一位产品推广专家。基于以下信息，请创作高效的产品推广内容。

## 推广背景
- 行业：${industryContext}
- 目标受众：${targetAudience.join('、')}
- 产品类型：${strategyPlan.campaignTheme.name}

## 创作要求

### 微信公众号产品推广文章
- **标题**：突出产品核心卖点和用户收益
- **结构**：
  1. 痛点引入：目标用户面临的具体问题
  2. 产品亮相：产品如何解决这些问题
  3. 核心功能：详细介绍3-5个核心功能
  4. 使用场景：具体的使用场景和案例
  5. 用户评价：真实用户评价和效果数据
  6. 购买引导：明确的购买路径和优惠信息
- **风格**：专业、可信、有说服力
- **视觉建议**：产品图、功能示意图、使用场景图

### 小红书产品种草笔记
- **角度**：真实用户的使用体验分享
- **内容结构**：
  - 购买理由：为什么选择这个产品
  - 使用体验：具体的使用过程和感受
  - 效果展示：前后对比或效果数据
  - 优缺点：客观评价产品的优缺点
  - 购买建议：适合什么人群，购买注意事项
- **图片要求**：开箱图、使用过程图、效果对比图
- **标签**：#种草 #好物分享 #产品名称

### 抖音产品推广视频
- **视频类型**：产品演示、使用教程、效果对比
- **脚本要点**：
  - 开头钩子：3秒内抓住注意力（如：问题展示、效果承诺）
  - 产品展示：清晰展示产品外观和功能
  - 使用演示：实际使用过程和效果
  - 价值强调：核心卖点和用户收益
  - 购买引导：如何购买、优惠信息
- **时长**：15-30秒
- **视觉**：高清产品特写、使用过程、效果展示
- **音乐**： upbeat、现代感

请输出完整的产品推广内容，注重转化效果和用户体验真实性。`;
    },
};
exports.holidayMarketingTemplate = {
    id: 'holiday_marketing',
    name: '节日营销专项模板',
    platforms: ['wechat', 'xiaohongshu', 'weibo', 'douyin'],
    contentType: 'campaign',
    depthLevel: 3,
    generatePrompt: (params) => {
        const { strategyPlan, platformSpecs, brandGuidelines, industryContext, targetAudience, customParams, } = params;
        const holidayName = customParams?.holidayName || '节日';
        const holidayDate = customParams?.holidayDate || '近期';
        return `你是一位节日营销专家。基于以下信息，请创作贴合${holidayName}氛围的营销内容。

## 节日背景
- 节日名称：${holidayName}
- 节日日期：${holidayDate}
- 节日意义：${customParams?.holidaySignificance || '庆祝、团聚、感恩等'}
- 行业：${industryContext}
- 目标受众：${targetAudience.join('、')}

## 创作要求

### 节日氛围营造
- **情感基调**：根据节日性质确定情感基调（温馨、欢乐、感恩、浪漫等）
- **视觉元素**：节日相关视觉元素（色彩、图案、符号）
- **语言风格**：贴合节日氛围的语言风格

### 多平台内容策略
#### 微信公众号
- **文章主题**：节日相关主题文章（如：节日由来、习俗、行业相关建议）
- **节日祝福**：真诚的节日祝福和企业关怀
- **促销信息**：如有限时优惠，自然融入
- **互动活动**：节日相关互动（征集故事、抽奖等）

#### 小红书
- **笔记主题**：节日仪式感、礼物推荐、节日穿搭/妆容、家庭布置
- **图片风格**：温馨、精致、有节日氛围
- **标签**：#节日名称 #节日仪式感 #礼物推荐

#### 微博
- **博文内容**：节日祝福、热点话题参与、抽奖活动
- **互动形式**：投票（如：节日计划调查）、话题讨论
- **图片/视频**：节日相关精美图片或短视频

#### 抖音
- **视频主题**：节日相关短剧、祝福视频、节日教程
- **背景音乐**：节日相关热门音乐
- **特效**：节日相关特效和贴纸
- **挑战赛**：如有，设计简单的节日挑战

### 促销内容融入技巧
- 避免生硬促销，强调节日特别关怀
- 礼品包装、限时优惠、专属服务等
- 强调节日限定价值

### 排期建议
- 节前预热：提前3-7天开始营造氛围
- 节日当天：祝福为主，促销为辅
- 节后延续：回顾、感恩、促销收尾

请输出完整的节日营销内容，注重节日氛围和情感连接。`;
    },
};
exports.crisisCommunicationTemplate = {
    id: 'crisis_communication',
    name: '危机沟通与品牌声誉模板',
    platforms: ['wechat', 'weibo'],
    contentType: 'article',
    depthLevel: 5,
    generatePrompt: (params) => {
        const { brandGuidelines, industryContext, customParams } = params;
        const crisisType = customParams?.crisisType || '品牌声誉问题';
        const situationDescription = customParams?.situationDescription || '具体情况描述';
        return `你是一位危机沟通专家。面对${crisisType}，请起草品牌回应内容。

## 危机情况
${situationDescription}

## 品牌立场
- 品牌名称：${brandGuidelines.brandName}
- 品牌价值观：${brandGuidelines.brandValues.join('、')}

## 沟通原则
1. 真诚透明：不隐瞒、不推诿
2. 承担责任：明确责任归属和承担意愿
3. 共情关怀：对受影响方表示理解和关怀
4. 解决方案：提出具体、可行的解决方案
5. 持续沟通：承诺持续更新进展

## 内容要求

### 微信公众号正式声明
- **标题**：关于[事件简述]的声明
- **结构**：
  1. 事实陈述：客观陈述已知事实
  2. 品牌立场：表达品牌的重视和态度
  3. 原因分析：如已查明原因，简要说明
  4. 应对措施：已采取和将采取的具体措施
  5. 责任承担：明确责任和补偿方案
  6. 改进承诺：防止类似事件再次发生的承诺
  7. 联系方式：后续沟通渠道
- **语气**：严肃、诚恳、负责任
- **避免**：法律推诿、指责他人、过度承诺

### 微博简短声明
- **内容**：精简版声明，包含核心事实、态度和措施
- **格式**：可分段，适合快速阅读
- **链接**：附微信公众号详细声明链接
- **评论管理**：准备统一回复话术

### 后续沟通计划
- **时间线**：后续进展更新的时间安排
- **渠道**：通过哪些渠道更新进展
- **内容**：每次更新的重点内容

请输出危机沟通内容，平衡法律风险、公众情感和品牌声誉。`;
    },
};
function generateStrategySummary(strategy) {
    const { campaignTheme, marketingStrategy, activityPlan, budgetPlan } = strategy;
    return `### 活动主题
- 名称：${campaignTheme.name}
- 口号：${campaignTheme.slogan}
- 视觉风格：${campaignTheme.visualStyle}
- 关键信息：${campaignTheme.keyMessages?.join('、') || '暂无'}

### 营销策略
- 目标：${marketingStrategy.objectives.slice(0, 3).join('、')}
- 目标客群：${marketingStrategy.targetAudienceSegments.slice(0, 3).join('、')}
- 核心策略：${marketingStrategy.tactics
        .slice(0, 2)
        .map((t) => t.name)
        .join('、')}

### 活动时间线
${activityPlan.timeline
        .slice(0, 3)
        .map((item) => `- 第${item.weekNumber}周：${item.keyActivities.slice(0, 2).join('、')}`)
        .join('\n')}

### 预算规划
- 总预算：${budgetPlan.totalBudget} ${budgetPlan.currency}
- ROI预估：${budgetPlan.roiEstimation}%
- 主要分配：${budgetPlan.breakdown
        .slice(0, 3)
        .map((item) => `${item.category}: ${item.percentage}%`)
        .join('、')}`;
}
function selectCopywritingTemplate(platforms, contentType, scenario) {
    const contentTypeLower = contentType.toLowerCase();
    const scenarioLower = scenario?.toLowerCase() || '';
    if (scenarioLower.includes('品牌故事') ||
        scenarioLower.includes('品牌建设')) {
        return exports.brandStorytellingTemplate;
    }
    if (scenarioLower.includes('产品推广') ||
        scenarioLower.includes('新品发布')) {
        return exports.productPromotionTemplate;
    }
    if (scenarioLower.includes('节日') || scenarioLower.includes('节庆')) {
        return exports.holidayMarketingTemplate;
    }
    if (scenarioLower.includes('危机') || scenarioLower.includes('声誉')) {
        return exports.crisisCommunicationTemplate;
    }
    if (platforms.length >= 3) {
        return exports.standardMultiPlatformTemplate;
    }
    return exports.standardMultiPlatformTemplate;
}
exports.allCopywritingTemplates = [
    exports.standardMultiPlatformTemplate,
    exports.brandStorytellingTemplate,
    exports.productPromotionTemplate,
    exports.holidayMarketingTemplate,
    exports.crisisCommunicationTemplate,
];
//# sourceMappingURL=copywriting-prompt-templates.js.map