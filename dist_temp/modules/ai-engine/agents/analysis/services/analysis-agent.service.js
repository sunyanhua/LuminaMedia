"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalysisAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisAgentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const gemini_service_1 = require("../../../../data-analytics/services/gemini.service");
const qwen_service_1 = require("../../../../data-analytics/services/qwen.service");
const platform_enum_1 = require("../../../../../shared/enums/platform.enum");
let AnalysisAgentService = AnalysisAgentService_1 = class AnalysisAgentService {
    configService;
    geminiService;
    qwenService;
    logger = new common_1.Logger(AnalysisAgentService_1.name);
    defaultAiEngine = 'gemini';
    constructor(configService, geminiService, qwenService) {
        this.configService = configService;
        this.geminiService = geminiService;
        this.qwenService = qwenService;
        this.defaultAiEngine = this.configService.get('AI_ENGINE', 'gemini');
    }
    async execute(input) {
        this.logger.log('开始执行分析Agent工作流');
        this.logger.debug(`输入数据: ${JSON.stringify(input, null, 2)}`);
        try {
            const prompt = this.buildAnalysisPrompt(input);
            const aiResponse = await this.generateAnalysisWithAI(prompt);
            const analysisOutput = this.parseAnalysisResponse(aiResponse);
            const enrichedOutput = this.enrichWithDataInsights(analysisOutput, input.customerData);
            this.logger.log('分析Agent工作流执行成功');
            return enrichedOutput;
        }
        catch (error) {
            this.logger.error(`分析Agent工作流执行失败: ${error.message}`, error.stack);
            return this.generateFallbackAnalysis(input);
        }
    }
    buildAnalysisPrompt(input) {
        const { customerData, industryContext, businessGoals, knowledgeBaseContext, } = input;
        const profileSummary = this.summarizeCustomerProfiles(customerData);
        const knowledgeSummary = knowledgeBaseContext.length > 0
            ? `相关知识库内容：\n${knowledgeBaseContext.slice(0, 3).join('\n')}`
            : '暂无相关知识库内容。';
        return `你是一位资深的市场营销分析专家。请基于以下信息进行全面的市场分析：

## 业务背景
- 行业：${industryContext}
- 业务目标：${businessGoals.join('、')}

## 目标客群画像（基于${customerData.length}个用户样本）
${profileSummary}

## 知识库参考
${knowledgeSummary}

## 分析要求
请提供完整的市场分析报告，包括以下四个部分：

### 1. 市场洞察
- **市场趋势**：识别当前行业的主要发展趋势（至少3条）
- **市场机会**：发现可把握的市场机会（至少3个）
- **市场威胁**：分析可能面临的市场威胁（至少2个）

### 2. 目标客群分析
- **客群分群**：基于提供的用户画像数据，将目标客群划分为3-5个细分群体
  - 每个分群需要包含：名称、描述、特征标签、规模比例（%）、优先级（1-5）
- **典型用户画像**：创建一个最具代表性的典型用户画像
  - 包括：人口统计信息、行为特征、需求痛点、动机目标
- **规模预估**：基于行业数据和样本特征，预估目标客群总体规模

### 3. 竞品分析
- **主要竞争对手**：识别行业内的主要竞争对手（3-5个）
  - 每个竞争对手需要包含：名称、市场份额（%）、优势、劣势、主要策略
- **竞争优势**：分析我们相比竞争对手的潜在优势（至少3个）
- **差距分析**：识别我们与竞争对手之间的差距（至少2个）

### 4. 初步建议
基于以上分析，提出针对性的营销建议（至少5条具体可执行的建议）

## 输出格式要求
请严格按照以下JSON格式输出分析结果，不要包含任何额外文本或解释：

{
  "marketInsights": {
    "trends": ["趋势1", "趋势2", "趋势3"],
    "opportunities": ["机会1", "机会2", "机会3"],
    "threats": ["威胁1", "威胁2"]
  },
  "targetAudience": {
    "segments": [
      {
        "name": "分群名称",
        "description": "分群描述",
        "characteristics": ["特征1", "特征2"],
        "proportion": 30,
        "priority": 5
      }
    ],
    "persona": {
      "name": "画像名称",
      "demographics": {
        "ageRange": "25-35岁",
        "gender": "女",
        "education": "本科",
        "occupation": "白领",
        "incomeLevel": "中等收入"
      },
      "behaviors": ["行为特征1", "行为特征2"],
      "painPoints": ["痛点1", "痛点2"],
      "motivations": ["动机1", "动机2"]
    },
    "sizeEstimation": 1000000
  },
  "competitorAnalysis": {
    "mainCompetitors": [
      {
        "name": "竞争对手名称",
        "marketShare": 15,
        "strengths": ["优势1", "优势2"],
        "weaknesses": ["劣势1", "劣势2"],
        "strategies": ["策略1", "策略2"]
      }
    ],
    "competitiveAdvantage": ["优势1", "优势2", "优势3"],
    "gaps": ["差距1", "差距2"]
  },
  "recommendations": ["建议1", "建议2", "建议3", "建议4", "建议5"]
}

注意：所有数字应为实际估算值，分析应基于提供的数据和行业常识。`;
    }
    summarizeCustomerProfiles(customerData) {
        if (customerData.length === 0) {
            return '无用户画像数据。';
        }
        const ageGroups = customerData.map((p) => p.basicLifecycle.ageGroup);
        const consumptionLevels = customerData.map((p) => p.consumptionPersonality.consumptionLevel);
        const activityLevels = customerData.map((p) => p.realtimeStatus.activityLevel);
        const fissionPotentials = customerData.map((p) => p.socialActivity.fissionPotential);
        const avgActivityLevel = activityLevels.reduce((a, b) => a + b, 0) / activityLevels.length;
        const countByAge = this.countDistribution(ageGroups);
        const countByConsumption = this.countDistribution(consumptionLevels);
        const countByFission = this.countDistribution(fissionPotentials);
        return `用户画像样本分析（${customerData.length}个样本）：
- 年龄分布：${this.formatDistribution(countByAge)}
- 消费水平分布：${this.formatDistribution(countByConsumption)}
- 平均活跃度：${avgActivityLevel.toFixed(1)}/100
- 裂变潜力分布：${this.formatDistribution(countByFission)}`;
    }
    countDistribution(items) {
        return items.reduce((acc, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {});
    }
    formatDistribution(dist) {
        const total = Object.values(dist).reduce((a, b) => a + b, 0);
        return Object.entries(dist)
            .map(([key, count]) => `${key}: ${((count / total) * 100).toFixed(1)}%`)
            .join('，');
    }
    async generateAnalysisWithAI(prompt) {
        this.logger.log(`使用${this.defaultAiEngine}引擎生成分析`);
        try {
            if (this.defaultAiEngine === 'gemini' &&
                this.geminiService.isGeminiAvailable()) {
                const result = await this.geminiService.generateContent({
                    prompt,
                    platform: platform_enum_1.Platform.ANALYSIS,
                    tone: 'professional',
                    wordCount: 2000,
                    includeHashtags: false,
                    includeImageSuggestions: false,
                });
                if (result.success && result.content) {
                    return result.content.content;
                }
                else {
                    throw new Error(`Gemini生成失败: ${result.error?.message || '未知错误'}`);
                }
            }
            else if (this.defaultAiEngine === 'qwen') {
                this.logger.warn('Qwen服务暂未实现，尝试使用Gemini');
                if (this.geminiService.isGeminiAvailable()) {
                    return this.generateAnalysisWithAI(prompt);
                }
                else {
                    throw new Error('所有AI引擎都不可用');
                }
            }
            else {
                throw new Error('默认AI引擎不可用');
            }
        }
        catch (error) {
            this.logger.error(`AI引擎调用失败: ${error.message}`);
            throw error;
        }
    }
    parseAnalysisResponse(aiResponse) {
        try {
            let jsonText = aiResponse.trim();
            jsonText = jsonText
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const parsed = JSON.parse(jsonText);
            const requiredFields = [
                'marketInsights',
                'targetAudience',
                'competitorAnalysis',
                'recommendations',
            ];
            for (const field of requiredFields) {
                if (!parsed[field]) {
                    throw new Error(`缺少必需字段: ${field}`);
                }
            }
            if (!parsed.targetAudience.segments ||
                !Array.isArray(parsed.targetAudience.segments)) {
                throw new Error('targetAudience.segments必须为数组');
            }
            if (!parsed.targetAudience.persona) {
                throw new Error('缺少targetAudience.persona字段');
            }
            if (!parsed.competitorAnalysis.mainCompetitors ||
                !Array.isArray(parsed.competitorAnalysis.mainCompetitors)) {
                throw new Error('competitorAnalysis.mainCompetitors必须为数组');
            }
            return parsed;
        }
        catch (error) {
            this.logger.error(`解析AI响应失败: ${error.message}`);
            this.logger.debug(`原始响应: ${aiResponse.substring(0, 500)}...`);
            throw new Error(`分析响应解析失败: ${error.message}`);
        }
    }
    enrichWithDataInsights(analysis, customerData) {
        if (customerData.length === 0) {
            return analysis;
        }
        const estimatedSize = analysis.targetAudience.sizeEstimation;
        const sampleSize = customerData.length;
        const highConsumptionRatio = customerData.filter((p) => p.consumptionPersonality.consumptionLevel === 'high' ||
            p.consumptionPersonality.consumptionLevel === 'premium').length / sampleSize;
        if (highConsumptionRatio > 0.7) {
            analysis.targetAudience.sizeEstimation = Math.round(estimatedSize * 0.7);
            analysis.marketInsights.opportunities.push('样本显示高消费群体集中，适合高端市场精准营销');
        }
        const avgActivityLevel = customerData.reduce((sum, p) => sum + p.realtimeStatus.activityLevel, 0) /
            sampleSize;
        if (avgActivityLevel > 70) {
            analysis.marketInsights.opportunities.push('用户活跃度高，适合推出互动性强的营销活动');
        }
        else if (avgActivityLevel < 30) {
            analysis.marketInsights.threats.push('用户活跃度偏低，存在用户流失风险');
        }
        return analysis;
    }
    generateFallbackAnalysis(input) {
        this.logger.warn('使用回退分析方案');
        const { industryContext, businessGoals } = input;
        return {
            marketInsights: {
                trends: [
                    `${industryContext}行业数字化转型加速`,
                    '个性化营销需求增长',
                    '社交媒体营销影响力持续扩大',
                ],
                opportunities: [
                    '利用AI技术提升营销效率',
                    '开发个性化推荐系统',
                    '拓展社交媒体营销渠道',
                ],
                threats: ['市场竞争加剧', '用户隐私保护法规趋严'],
            },
            targetAudience: {
                segments: [
                    {
                        name: '核心用户',
                        description: '高活跃度、高消费意愿的核心用户群体',
                        characteristics: ['高活跃度', '高消费', '强互动'],
                        proportion: 20,
                        priority: 5,
                    },
                    {
                        name: '潜力用户',
                        description: '有一定活跃度，消费潜力待挖掘的用户群体',
                        characteristics: ['中等活跃度', '中等消费', '需引导'],
                        proportion: 50,
                        priority: 3,
                    },
                    {
                        name: '观望用户',
                        description: '低活跃度，需要培育的用户群体',
                        characteristics: ['低活跃度', '低消费', '需激活'],
                        proportion: 30,
                        priority: 1,
                    },
                ],
                persona: {
                    name: '典型目标用户',
                    demographics: {
                        ageRange: '25-35岁',
                        gender: '女',
                        education: '本科',
                        occupation: '白领',
                        incomeLevel: '中等收入',
                    },
                    behaviors: ['频繁使用社交媒体', '关注品牌动态', '喜欢参与线上活动'],
                    painPoints: ['信息过载难以选择', '缺乏个性化推荐', '营销内容不相关'],
                    motivations: [
                        '寻求优质产品和服务',
                        '希望获得专属体验',
                        '追求社交认同感',
                    ],
                },
                sizeEstimation: 1000000,
            },
            competitorAnalysis: {
                mainCompetitors: [
                    {
                        name: '行业领先者A',
                        marketShare: 25,
                        strengths: ['品牌知名度高', '产品线丰富', '渠道覆盖广'],
                        weaknesses: ['创新速度慢', '用户体验一般', '价格偏高'],
                        strategies: ['品牌营销', '渠道扩张', '高端定位'],
                    },
                    {
                        name: '新兴竞争者B',
                        marketShare: 15,
                        strengths: ['创新速度快', '用户体验好', '价格亲民'],
                        weaknesses: ['品牌知名度低', '资源有限', '渠道单一'],
                        strategies: ['产品创新', '用户口碑', '差异化竞争'],
                    },
                ],
                competitiveAdvantage: [
                    '技术驱动创新能力',
                    '数据驱动的精准营销',
                    '灵活的业务模式',
                ],
                gaps: ['品牌知名度有待提升', '市场覆盖需要扩大'],
            },
            recommendations: [
                '建立用户分层营销体系，针对不同群体制定差异化策略',
                '加强社交媒体营销，提升品牌曝光和用户互动',
                '利用AI技术实现个性化推荐，提升用户体验',
                '开发数据驱动的营销工具，提高营销效率',
                '建立合作伙伴生态，拓展市场渠道',
            ],
        };
    }
};
exports.AnalysisAgentService = AnalysisAgentService;
exports.AnalysisAgentService = AnalysisAgentService = AnalysisAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(gemini_service_1.GeminiService)),
    __param(2, (0, common_1.Inject)(qwen_service_1.QwenService)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        gemini_service_1.GeminiService,
        qwen_service_1.QwenService])
], AnalysisAgentService);
//# sourceMappingURL=analysis-agent.service.js.map