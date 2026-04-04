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
var LexiconSentimentProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexiconSentimentProvider = void 0;
const common_1 = require("@nestjs/common");
let LexiconSentimentProvider = LexiconSentimentProvider_1 = class LexiconSentimentProvider {
    logger = new common_1.Logger(LexiconSentimentProvider_1.name);
    name = 'lexicon';
    lexicons = new Map();
    defaultLexicon;
    constructor() {
        this.initializeDefaultLexicon();
        this.initializeIndustryLexicons();
    }
    initializeDefaultLexicon() {
        const positiveWords = new Set([
            '好',
            '优秀',
            '满意',
            '喜欢',
            '爱',
            '赞',
            '棒',
            '不错',
            '精彩',
            '完美',
            '出色',
            '卓越',
            '优良',
            '高品质',
            '高效',
            '便捷',
            '舒适',
            '愉快',
            '高兴',
            '惊喜',
            '推荐',
            '支持',
            '感谢',
            '感激',
            '佩服',
            '欣赏',
            '羡慕',
            '期待',
            '希望',
            '信心',
            '乐观',
            '积极',
            '正面',
            '有利',
            '有益',
            '有帮助',
            '有价值',
            '成功',
            '胜利',
            '成就',
            '进步',
            '发展',
            '提升',
            '改善',
            '优化',
            '创新',
            '领先',
            '先进',
            '现代',
            '时尚',
            '美观',
            '漂亮',
            '优雅',
            '精致',
            '细腻',
            '温柔',
            '体贴',
            '周到',
            '专业',
            '可靠',
            '稳定',
            '安全',
            '放心',
            '信任',
        ]);
        const negativeWords = new Set([
            '差',
            '糟糕',
            '烂',
            '坏',
            '差劲',
            '不满意',
            '讨厌',
            '恨',
            '厌恶',
            '反感',
            '失望',
            '沮丧',
            '伤心',
            '难过',
            '痛苦',
            '愤怒',
            '生气',
            '恼火',
            '烦躁',
            '焦虑',
            '担心',
            '害怕',
            '恐惧',
            '怀疑',
            '质疑',
            '批评',
            '指责',
            '抱怨',
            '投诉',
            '抗议',
            '反对',
            '拒绝',
            '否定',
            '消极',
            '负面',
            '不利',
            '有害',
            '危险',
            '风险',
            '问题',
            '故障',
            '错误',
            '缺陷',
            '不足',
            '缺点',
            '弱点',
            '失败',
            '挫折',
            '损失',
            '损害',
            '伤害',
            '威胁',
            '挑战',
            '困难',
            '障碍',
            '复杂',
            '混乱',
            '模糊',
            '不清晰',
            '不稳定',
            '不可靠',
            '不安全',
            '不放心',
        ]);
        const negationWords = new Set([
            '不',
            '没',
            '没有',
            '无',
            '非',
            '未',
            '勿',
            '莫',
            '别',
            '不要',
            '不会',
            '不能',
            '不可',
            '不行',
            '不必',
            '不用',
            '从未',
            '毫无',
            '毫无意义',
        ]);
        const intensityWords = new Map([
            ['非常', 1.5],
            ['极其', 1.8],
            ['极度', 1.8],
            ['十分', 1.3],
            ['特别', 1.4],
            ['相当', 1.2],
            ['比较', 1.1],
            ['稍微', 0.8],
            ['有点', 0.9],
            ['略微', 0.8],
            ['完全', 1.5],
            ['绝对', 1.6],
            ['彻底', 1.5],
            ['根本', 1.4],
            ['简直', 1.3],
            ['太', 1.4],
            ['真', 1.2],
            ['好', 1.1],
            ['超', 1.3],
            ['巨', 1.3],
        ]);
        this.defaultLexicon = {
            positiveWords,
            negativeWords,
            negationWords,
            intensityWords,
        };
    }
    initializeIndustryLexicons() {
        const ecommerceLexicon = {
            ...this.defaultLexicon,
            industryWords: new Map([
                ['物流快', { sentiment: 'positive', weight: 1.2 }],
                ['送货及时', { sentiment: 'positive', weight: 1.1 }],
                ['包装完好', { sentiment: 'positive', weight: 1.0 }],
                ['正品', { sentiment: 'positive', weight: 1.3 }],
                ['假货', { sentiment: 'negative', weight: 1.5 }],
                ['物流慢', { sentiment: 'negative', weight: 1.2 }],
                ['包装破损', { sentiment: 'negative', weight: 1.1 }],
                ['客服态度差', { sentiment: 'negative', weight: 1.4 }],
                ['退货困难', { sentiment: 'negative', weight: 1.3 }],
                ['价格实惠', { sentiment: 'positive', weight: 1.2 }],
                ['价格虚高', { sentiment: 'negative', weight: 1.2 }],
                ['质量好', { sentiment: 'positive', weight: 1.3 }],
                ['质量差', { sentiment: 'negative', weight: 1.3 }],
            ]),
            targetWords: new Set([
                '物流',
                '包装',
                '客服',
                '价格',
                '质量',
                '商品',
                '店铺',
            ]),
        };
        const foodLexicon = {
            ...this.defaultLexicon,
            industryWords: new Map([
                ['好吃', { sentiment: 'positive', weight: 1.3 }],
                ['美味', { sentiment: 'positive', weight: 1.4 }],
                ['新鲜', { sentiment: 'positive', weight: 1.2 }],
                ['干净卫生', { sentiment: 'positive', weight: 1.3 }],
                ['难吃', { sentiment: 'negative', weight: 1.4 }],
                ['不新鲜', { sentiment: 'negative', weight: 1.3 }],
                ['脏乱差', { sentiment: 'negative', weight: 1.5 }],
                ['服务好', { sentiment: 'positive', weight: 1.2 }],
                ['服务差', { sentiment: 'negative', weight: 1.3 }],
                ['环境好', { sentiment: 'positive', weight: 1.1 }],
                ['环境差', { sentiment: 'negative', weight: 1.2 }],
                ['价格合理', { sentiment: 'positive', weight: 1.1 }],
                ['价格贵', { sentiment: 'negative', weight: 1.2 }],
            ]),
            targetWords: new Set([
                '味道',
                '服务',
                '环境',
                '价格',
                '卫生',
                '菜品',
                '餐厅',
            ]),
        };
        this.lexicons.set('ecommerce', ecommerceLexicon);
        this.lexicons.set('food', foodLexicon);
        this.lexicons.set('餐饮', foodLexicon);
    }
    async analyze(text, options) {
        try {
            const industry = options?.industry || 'generic';
            const lexicon = this.getLexiconForIndustry(industry);
            const tokens = this.tokenizeChinese(text);
            const result = this.analyzeTokens(tokens, lexicon);
            return {
                polarity: result.polarity,
                score: result.score,
                confidence: result.confidence,
                intensity: result.intensity,
            };
        }
        catch (error) {
            this.logger.error(`词典情感分析失败: ${error.message}`);
            return {
                polarity: 'neutral',
                score: 0,
                confidence: 0.3,
                intensity: 0.5,
            };
        }
    }
    async analyzeBatch(texts, options) {
        const results = [];
        for (const text of texts) {
            try {
                const result = await this.analyze(text, options);
                results.push(result);
            }
            catch (error) {
                this.logger.error(`批量分析失败: ${error.message}`);
                results.push({
                    polarity: 'neutral',
                    score: 0,
                    confidence: 0.3,
                    intensity: 0.5,
                    error: error.message,
                });
            }
        }
        return results;
    }
    async healthCheck() {
        try {
            const positiveText = '这个产品非常好，我非常喜欢！';
            const positiveResult = await this.analyze(positiveText);
            const negativeText = '这个产品质量很差，很不满意。';
            const negativeResult = await this.analyze(negativeText);
            if (positiveResult.polarity === 'positive' &&
                positiveResult.score > 0 &&
                negativeResult.polarity === 'negative' &&
                negativeResult.score < 0) {
                return { healthy: true, message: '词典情感分析服务正常' };
            }
            else {
                return {
                    healthy: false,
                    message: `词典情感分析结果异常: 正面文本得分${positiveResult.score}, 负面文本得分${negativeResult.score}`,
                };
            }
        }
        catch (error) {
            return { healthy: false, message: `健康检查失败: ${error.message}` };
        }
    }
    getLexiconForIndustry(industry) {
        return this.lexicons.get(industry) || this.defaultLexicon;
    }
    tokenizeChinese(text) {
        const cleaned = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ');
        const tokens = cleaned.split(/\s+/).filter((token) => token.length > 0);
        const charTokens = [];
        for (const token of tokens) {
            if (/^[\u4e00-\u9fa5]+$/.test(token)) {
                charTokens.push(...token.split(''));
            }
            else {
                charTokens.push(token);
            }
        }
        return charTokens;
    }
    analyzeTokens(tokens, lexicon) {
        let positiveScore = 0;
        let negativeScore = 0;
        let totalWeight = 0;
        let intensityMultiplier = 1;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (lexicon.intensityWords.has(token)) {
                intensityMultiplier *= lexicon.intensityWords.get(token) || 1;
                continue;
            }
            let isNegated = false;
            if (lexicon.negationWords.has(token)) {
                isNegated = true;
                const lookahead = Math.min(2, tokens.length - i - 1);
            }
            let tokenSentiment = null;
            let tokenWeight = 1;
            if (lexicon.industryWords && lexicon.industryWords.has(token)) {
                const industryWord = lexicon.industryWords.get(token);
                tokenSentiment = industryWord.sentiment;
                tokenWeight = industryWord.weight;
            }
            else if (lexicon.positiveWords.has(token)) {
                tokenSentiment = 'positive';
                tokenWeight = 1;
            }
            else if (lexicon.negativeWords.has(token)) {
                tokenSentiment = 'negative';
                tokenWeight = 1;
            }
            if (tokenSentiment) {
                const score = tokenWeight * intensityMultiplier * (isNegated ? -1 : 1);
                if (tokenSentiment === 'positive') {
                    positiveScore += score;
                }
                else {
                    negativeScore += score;
                }
                totalWeight += tokenWeight;
            }
            if (i > 0 && !this.isSentimentWord(token, lexicon)) {
                intensityMultiplier = 1;
            }
        }
        const rawScore = positiveScore - negativeScore;
        const maxPossibleScore = totalWeight * 2;
        const normalizedScore = maxPossibleScore > 0 ? rawScore / maxPossibleScore : 0;
        let polarity = 'neutral';
        if (normalizedScore > 0.1) {
            polarity = 'positive';
        }
        else if (normalizedScore < -0.1) {
            polarity = 'negative';
        }
        const confidence = Math.min(1, totalWeight * 0.3 + Math.abs(normalizedScore) * 0.7);
        const intensity = Math.abs(normalizedScore);
        return {
            polarity,
            score: normalizedScore,
            confidence,
            intensity,
        };
    }
    isSentimentWord(token, lexicon) {
        return (lexicon.positiveWords.has(token) ||
            lexicon.negativeWords.has(token) ||
            !!(lexicon.industryWords && lexicon.industryWords.has(token)));
    }
    addCustomLexicon(industry, config) {
        const baseLexicon = this.getLexiconForIndustry('generic');
        const customLexicon = {
            positiveWords: new Set([
                ...baseLexicon.positiveWords,
                ...(config.positiveWords || []),
            ]),
            negativeWords: new Set([
                ...baseLexicon.negativeWords,
                ...(config.negativeWords || []),
            ]),
            negationWords: new Set([
                ...baseLexicon.negationWords,
                ...(config.negationWords || []),
            ]),
            intensityWords: new Map([
                ...baseLexicon.intensityWords,
                ...(config.intensityWords || []),
            ]),
            industryWords: config.industryWords,
            targetWords: config.targetWords,
        };
        this.lexicons.set(industry, customLexicon);
    }
};
exports.LexiconSentimentProvider = LexiconSentimentProvider;
exports.LexiconSentimentProvider = LexiconSentimentProvider = LexiconSentimentProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LexiconSentimentProvider);
//# sourceMappingURL=lexicon-sentiment.provider.js.map