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
var KnowledgeRetrievalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeRetrievalService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const vector_search_service_1 = require("../../../../../shared/vector/services/vector-search.service");
let KnowledgeRetrievalService = KnowledgeRetrievalService_1 = class KnowledgeRetrievalService {
    configService;
    vectorSearchService;
    logger = new common_1.Logger(KnowledgeRetrievalService_1.name);
    embeddingsCache = new Map();
    knowledgeBase = [];
    constructor(configService, vectorSearchService) {
        this.configService = configService;
        this.vectorSearchService = vectorSearchService;
        this.initializeKnowledgeBase();
    }
    initializeKnowledgeBase() {
        this.logger.log('初始化知识库...');
        const mockKnowledgeBase = {
            通用: [
                '市场分析的核心是理解目标客户的需求和行为模式。',
                '有效的营销策略需要结合产品、价格、渠道和促销四个要素。',
                '数字化转型正在改变所有行业的竞争格局和客户期望。',
                '数据驱动的决策可以帮助企业更准确地预测市场趋势。',
                '客户体验已成为品牌差异化的关键因素。',
            ],
            电商: [
                '2025年电商市场规模预计将达到20万亿人民币，年增长率15%。',
                '直播电商成为增长最快的电商形式，预计占电商总交易额的30%。',
                '社交电商通过微信、小红书等平台实现快速增长。',
                '个性化推荐算法可以提升电商转化率30%以上。',
                '跨境电商受到政策支持，进口商品需求持续增长。',
                '私域流量运营成为电商企业的重要战略。',
                '全渠道融合是零售业的未来趋势。',
            ],
            金融: [
                '金融科技正在重塑传统金融服务模式。',
                '移动支付普及率已超过80%，成为主要支付方式。',
                '数字货币和区块链技术正在探索实际应用场景。',
                '智能投顾服务为中小投资者提供专业投资建议。',
                '监管科技帮助金融机构提高合规效率。',
                '开放银行趋势推动金融数据共享和服务创新。',
            ],
            医疗: [
                '互联网医疗在疫情期间得到快速发展。',
                '人工智能辅助诊断提高医疗效率和准确性。',
                '可穿戴设备推动健康管理个性化。',
                '远程医疗缓解医疗资源分布不均问题。',
                '基因检测技术推动精准医疗发展。',
                '医疗大数据助力公共卫生决策和疾病预防。',
            ],
            教育: [
                '在线教育市场规模持续扩大，K12和职业教育是主要增长点。',
                'AI教育产品提供个性化学习路径和实时反馈。',
                '混合式学习模式结合线上和线下教学优势。',
                '教育科技投资集中在AI教学、VR/AR教学和在线测评领域。',
                '终身学习需求推动职业教育和技能培训市场增长。',
            ],
            企业服务: [
                'SaaS模式降低企业软件使用门槛，提高部署灵活性。',
                '垂直行业SaaS解决方案更受企业客户欢迎。',
                'API经济推动企业服务生态构建。',
                '低代码/无代码平台加速企业数字化转型。',
                '订阅制收入模式提高企业服务公司的收入可预测性。',
                '客户成功成为SaaS企业增长的关键驱动力。',
            ],
        };
        let id = 1;
        for (const [industry, texts] of Object.entries(mockKnowledgeBase)) {
            for (const text of texts) {
                this.knowledgeBase.push({
                    id: `kb-${id++}`,
                    text,
                    industry,
                    metadata: {
                        source: 'mock',
                        length: text.length,
                        created: new Date().toISOString(),
                    },
                });
            }
        }
        this.logger.log(`知识库初始化完成，共加载 ${this.knowledgeBase.length} 条知识`);
    }
    async retrieveRelevantKnowledge(query, industry, limit = 5) {
        this.logger.log(`检索知识库: query="${query}", industry="${industry}"`);
        try {
            return await this.retrieveByVector(query, industry, limit);
        }
        catch (error) {
            this.logger.error(`知识库检索失败: ${error.message}`, error.stack);
            return this.retrieveByKeywords(query, industry, limit);
        }
    }
    getMockKnowledge(query, industry, limit) {
        const industryLower = industry.toLowerCase();
        const knowledgeBase = {
            通用: [
                '市场分析的核心是理解目标客户的需求和行为模式。',
                '有效的营销策略需要结合产品、价格、渠道和促销四个要素。',
                '数字化转型正在改变所有行业的竞争格局和客户期望。',
                '数据驱动的决策可以帮助企业更准确地预测市场趋势。',
                '客户体验已成为品牌差异化的关键因素。',
            ],
            电商: [
                '2025年电商市场规模预计将达到20万亿人民币，年增长率15%。',
                '直播电商成为增长最快的电商形式，预计占电商总交易额的30%。',
                '社交电商通过微信、小红书等平台实现快速增长。',
                '个性化推荐算法可以提升电商转化率30%以上。',
                '跨境电商受到政策支持，进口商品需求持续增长。',
                '私域流量运营成为电商企业的重要战略。',
                '全渠道融合是零售业的未来趋势。',
            ],
            金融: [
                '金融科技正在重塑传统金融服务模式。',
                '移动支付普及率已超过80%，成为主要支付方式。',
                '数字货币和区块链技术正在探索实际应用场景。',
                '智能投顾服务为中小投资者提供专业投资建议。',
                '监管科技帮助金融机构提高合规效率。',
                '开放银行趋势推动金融数据共享和服务创新。',
            ],
            医疗: [
                '互联网医疗在疫情期间得到快速发展。',
                '人工智能辅助诊断提高医疗效率和准确性。',
                '可穿戴设备推动健康管理个性化。',
                '远程医疗缓解医疗资源分布不均问题。',
                '基因检测技术推动精准医疗发展。',
                '医疗大数据助力公共卫生决策和疾病预防。',
            ],
            教育: [
                '在线教育市场规模持续扩大，K12和职业教育是主要增长点。',
                'AI教育产品提供个性化学习路径和实时反馈。',
                '混合式学习模式结合线上和线下教学优势。',
                '教育科技投资集中在AI教学、VR/AR教学和在线测评领域。',
                '终身学习需求推动职业教育和技能培训市场增长。',
            ],
            企业服务: [
                'SaaS模式降低企业软件使用门槛，提高部署灵活性。',
                '垂直行业SaaS解决方案更受企业客户欢迎。',
                'API经济推动企业服务生态构建。',
                '低代码/无代码平台加速企业数字化转型。',
                '订阅制收入模式提高企业服务公司的收入可预测性。',
                '客户成功成为SaaS企业增长的关键驱动力。',
            ],
        };
        let selectedIndustry = '通用';
        for (const key of Object.keys(knowledgeBase)) {
            if (industryLower.includes(key.toLowerCase())) {
                selectedIndustry = key;
                break;
            }
        }
        const industryKnowledge = knowledgeBase[selectedIndustry] || knowledgeBase['通用'];
        const queryKeywords = query.toLowerCase().split(/\s+/);
        const relevantKnowledge = industryKnowledge.filter((knowledge) => {
            const knowledgeLower = knowledge.toLowerCase();
            return queryKeywords.some((keyword) => keyword.length > 2 && knowledgeLower.includes(keyword));
        });
        const results = relevantKnowledge.length > 0
            ? relevantKnowledge.slice(0, limit)
            : industryKnowledge.slice(0, limit);
        this.logger.debug(`返回${results.length}条知识库结果`);
        return results;
    }
    getFallbackKnowledge(industry) {
        this.logger.warn(`使用回退知识库 for industry: ${industry}`);
        return [
            '市场分析需要综合考虑宏观经济、行业趋势和竞争格局。',
            '目标客群分析应基于数据驱动的用户画像和行为分析。',
            '有效的营销策略需要明确的定位、差异化的价值和持续的优化。',
            '数字化转型是企业适应市场变化的重要战略。',
            '客户为中心的业务模式可以建立长期竞争优势。',
        ];
    }
    async generateAnalysisWithKnowledge(query, industry, baseAnalysis) {
        this.logger.log(`执行检索增强生成分析: query="${query}"`);
        try {
            const knowledge = await this.retrieveRelevantKnowledge(query, industry);
            const enhancedPrompt = this.buildEnhancedPrompt(query, industry, knowledge, baseAnalysis);
            return enhancedPrompt;
        }
        catch (error) {
            this.logger.error(`检索增强生成失败: ${error.message}`);
            return baseAnalysis;
        }
    }
    buildEnhancedPrompt(query, industry, knowledge, baseAnalysis) {
        const knowledgeText = knowledge.length > 0
            ? `## 相关知识库参考\n${knowledge.map((k, i) => `${i + 1}. ${k}`).join('\n')}`
            : '## 知识库参考\n暂无相关专业知识库内容。';
        return `基于以下行业知识和市场分析框架，请进行深入分析：

## 分析主题
${query}

## 目标行业
${industry}

${knowledgeText}

## 基础分析框架
${baseAnalysis}

## 增强分析要求
请结合提供的行业知识和市场趋势，对基础分析框架进行深化和补充：
1. 将知识库内容融入市场趋势分析
2. 使用行业数据支持目标客群规模预估
3. 结合行业特点分析竞争对手策略
4. 提出基于行业最佳实践的具体建议

请确保分析既符合行业特性，又具有数据支撑和可执行性。`;
    }
    async evaluateRelevance(knowledge, query, industry) {
        const knowledgeLower = knowledge.toLowerCase();
        const queryLower = query.toLowerCase();
        const industryLower = industry.toLowerCase();
        let score = 0.3;
        const queryKeywords = queryLower.split(/\s+/).filter((k) => k.length > 2);
        const keywordMatches = queryKeywords.filter((keyword) => knowledgeLower.includes(keyword)).length;
        score += (keywordMatches / Math.max(1, queryKeywords.length)) * 0.4;
        if (knowledgeLower.includes(industryLower) && industryLower.length > 1) {
            score += 0.2;
        }
        const lengthScore = (Math.min(knowledge.length, 500) / 500) * 0.1;
        score += lengthScore;
        return Math.min(1, score);
    }
    async generateEmbedding(text) {
        const cacheKey = `embedding-${text.substring(0, 100)}`;
        if (this.embeddingsCache.has(cacheKey)) {
            return this.embeddingsCache.get(cacheKey);
        }
        try {
            const apiKey = this.configService.get('GEMINI_API_KEY');
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY not configured');
            }
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify({
                    model: 'models/embedding-001',
                    content: {
                        parts: [{ text }],
                    },
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Embedding API error: ${response.status} ${errorText}`);
            }
            const data = await response.json();
            const embedding = data.embedding?.values;
            if (!embedding || !Array.isArray(embedding)) {
                throw new Error('Invalid embedding response');
            }
            this.embeddingsCache.set(cacheKey, embedding);
            return embedding;
        }
        catch (error) {
            this.logger.warn(`嵌入生成失败: ${error.message}，使用随机嵌入回退`);
            const randomEmbedding = Array.from({ length: 768 }, () => Math.random() * 2 - 1);
            this.embeddingsCache.set(cacheKey, randomEmbedding);
            return randomEmbedding;
        }
    }
    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) {
            return 0;
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    async retrieveByVector(query, industry, limit = 5) {
        this.logger.log(`向量检索: query="${query}", industry="${industry}"`);
        try {
            const vectorResults = await this.vectorSearchService.searchSimilar(query, limit, { industry });
            if (vectorResults.length > 0) {
                const results = vectorResults.map((result) => result.document.content);
                this.logger.debug(`向量数据库检索返回 ${results.length} 条结果，最高相似度: ${vectorResults[0]?.similarity?.toFixed(3)}`);
                return this.manageContextWindow(results);
            }
            this.logger.warn('向量数据库无结果，回退到内存向量检索');
            return await this.fallbackVectorRetrieval(query, industry, limit);
        }
        catch (error) {
            this.logger.error(`向量检索失败: ${error.message}，回退到内存检索`);
            return await this.fallbackVectorRetrieval(query, industry, limit);
        }
    }
    async fallbackVectorRetrieval(query, industry, limit = 5) {
        try {
            const queryEmbedding = await this.generateEmbedding(query);
            const industryKnowledge = this.knowledgeBase.filter((kb) => kb.industry === industry || industry === '通用');
            if (industryKnowledge.length === 0) {
                this.logger.warn(`没有找到行业"${industry}"的相关知识，使用通用知识`);
                return this.getMockKnowledge(query, industry, limit);
            }
            const scoredKnowledge = await Promise.all(industryKnowledge.map(async (kb) => {
                let embedding = kb.embedding;
                if (!embedding) {
                    embedding = await this.generateEmbedding(kb.text);
                    kb.embedding = embedding;
                }
                const similarity = this.cosineSimilarity(queryEmbedding, embedding);
                return { ...kb, similarity };
            }));
            scoredKnowledge.sort((a, b) => b.similarity - a.similarity);
            const rawResults = scoredKnowledge.slice(0, limit).map((kb) => kb.text);
            const results = this.manageContextWindow(rawResults);
            this.logger.debug(`内存向量检索返回 ${results.length} 条结果（原始${rawResults.length}条），最高相似度: ${scoredKnowledge[0]?.similarity?.toFixed(3)}`);
            return results;
        }
        catch (error) {
            this.logger.error(`内存向量检索失败: ${error.message}，回退到关键词检索`);
            return this.retrieveByKeywords(query, industry, limit);
        }
    }
    manageContextWindow(knowledgeTexts, maxTokens = 4000) {
        if (knowledgeTexts.length === 0) {
            return [];
        }
        const estimateTokens = (text) => Math.ceil(text.length / 4);
        let totalTokens = 0;
        const selectedTexts = [];
        for (const text of knowledgeTexts) {
            const textTokens = estimateTokens(text);
            if (totalTokens + textTokens > maxTokens) {
                break;
            }
            selectedTexts.push(text);
            totalTokens += textTokens;
        }
        if (selectedTexts.length === 0 && knowledgeTexts.length > 0) {
            const firstText = knowledgeTexts[0];
            const maxChars = maxTokens * 4;
            selectedTexts.push(firstText.substring(0, maxChars));
        }
        this.logger.debug(`上下文窗口管理: 原始${knowledgeTexts.length}条，选择${selectedTexts.length}条，使用${totalTokens} tokens`);
        return selectedTexts;
    }
    async recordFeedback(query, retrievedKnowledge, feedback) {
        try {
            this.logger.log(`记录知识库反馈: query="${query.substring(0, 50)}..."，满意度: ${feedback.searchSatisfaction ?? '未提供'}`);
            const feedbackRecord = {
                query,
                retrievedCount: retrievedKnowledge.length,
                feedback,
                timestamp: new Date().toISOString(),
            };
            this.logger.debug(`反馈记录: ${JSON.stringify(feedbackRecord)}`);
            if (feedback.clickedIndex !== undefined && feedback.clickedIndex >= 0) {
                const clickedKnowledge = retrievedKnowledge[feedback.clickedIndex];
                this.logger.log(`用户点击了索引 ${feedback.clickedIndex} 的知识: "${clickedKnowledge.substring(0, 100)}..."`);
            }
            if (feedback.relevanceScores) {
                const avgRelevance = feedback.relevanceScores.reduce((a, b) => a + b, 0) /
                    feedback.relevanceScores.length;
                this.logger.log(`平均相关性评分: ${avgRelevance.toFixed(2)}`);
            }
        }
        catch (error) {
            this.logger.error(`记录反馈失败: ${error.message}`);
        }
    }
    retrieveByKeywords(query, industry, limit) {
        const rawResults = this.getMockKnowledge(query, industry, limit);
        return this.manageContextWindow(rawResults);
    }
    async batchRetrieve(queries, industry, limitPerQuery = 3) {
        const results = {};
        for (const query of queries) {
            results[query] = await this.retrieveRelevantKnowledge(query, industry, limitPerQuery);
        }
        return results;
    }
};
exports.KnowledgeRetrievalService = KnowledgeRetrievalService;
exports.KnowledgeRetrievalService = KnowledgeRetrievalService = KnowledgeRetrievalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        vector_search_service_1.VectorSearchService])
], KnowledgeRetrievalService);
//# sourceMappingURL=knowledge-retrieval.service.js.map