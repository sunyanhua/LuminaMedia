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
var SentimentAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentimentAnalysisService = void 0;
const common_1 = require("@nestjs/common");
let SentimentAnalysisService = SentimentAnalysisService_1 = class SentimentAnalysisService {
    logger = new common_1.Logger(SentimentAnalysisService_1.name);
    providers = new Map();
    defaultProvider = 'lexicon';
    constructor(providers) {
        if (providers) {
            this.registerProviders(providers);
        }
    }
    registerProvider(provider) {
        this.providers.set(provider.name, provider);
        this.logger.log(`注册情感分析提供商: ${provider.name}`);
    }
    registerProviders(providers) {
        for (const provider of providers) {
            this.registerProvider(provider);
        }
    }
    setDefaultProvider(providerName) {
        if (this.providers.has(providerName)) {
            this.defaultProvider = providerName;
            this.logger.log(`设置默认情感分析提供商为: ${providerName}`);
        }
        else {
            this.logger.warn(`提供商 ${providerName} 不存在，无法设置为默认`);
        }
    }
    getProvider(providerName) {
        const name = providerName || this.defaultProvider;
        const provider = this.providers.get(name);
        if (!provider) {
            throw new Error(`情感分析提供商 ${name} 不存在`);
        }
        return provider;
    }
    async analyzeText(request) {
        const startTime = Date.now();
        try {
            const providerName = this.selectProvider(request);
            const provider = this.getProvider(providerName);
            this.logger.debug(`使用 ${providerName} 提供商分析文本: ${request.text.substring(0, 50)}...`);
            const analysisResult = await provider.analyze(request.text, {
                industry: request.industry,
                target: request.target,
                platform: request.platform,
            });
            const result = {
                polarity: analysisResult.polarity,
                intensity: analysisResult.intensity || Math.abs(analysisResult.score),
                score: analysisResult.score,
                confidence: analysisResult.confidence,
                targets: analysisResult.targets ||
                    this.extractTargets(request.text, request.target),
                reasons: analysisResult.reasons ||
                    this.extractReasons(request.text, analysisResult.polarity),
                text: request.text,
                analyzedAt: new Date(),
            };
            const processingTime = Date.now() - startTime;
            this.logger.debug(`情感分析完成: ${result.polarity} (${result.score}), 耗时: ${processingTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`情感分析失败: ${error.message}`, error.stack);
            throw new Error(`情感分析失败: ${error.message}`);
        }
    }
    async analyzeTexts(requests) {
        const startTime = Date.now();
        const results = [];
        this.logger.log(`开始批量分析 ${requests.length} 个文本的情感`);
        const groups = this.groupRequests(requests);
        for (const [groupKey, groupRequests] of groups) {
            this.logger.debug(`处理组 ${groupKey}: ${groupRequests.length} 个文本`);
            const providerName = this.selectProvider(groupRequests[0]);
            const provider = this.getProvider(providerName);
            try {
                const texts = groupRequests.map((req) => req.text);
                const analysisResults = await provider.analyzeBatch(texts, {
                    industry: groupRequests[0].industry,
                    platform: groupRequests[0].platform,
                });
                for (let i = 0; i < groupRequests.length; i++) {
                    const request = groupRequests[i];
                    const analysisResult = analysisResults[i];
                    const result = {
                        polarity: analysisResult.polarity,
                        intensity: analysisResult.intensity || Math.abs(analysisResult.score),
                        score: analysisResult.score,
                        confidence: analysisResult.confidence,
                        targets: analysisResult.targets ||
                            this.extractTargets(request.text, request.target),
                        reasons: analysisResult.reasons ||
                            this.extractReasons(request.text, analysisResult.polarity),
                        text: request.text,
                        analyzedAt: new Date(),
                    };
                    results.push(result);
                }
            }
            catch (error) {
                this.logger.error(`组 ${groupKey} 分析失败: ${error.message}`);
                for (const request of groupRequests) {
                    const fallbackResult = {
                        polarity: 'neutral',
                        intensity: 0.5,
                        score: 0,
                        confidence: 0.3,
                        targets: this.extractTargets(request.text, request.target),
                        reasons: [],
                        text: request.text,
                        analyzedAt: new Date(),
                    };
                    results.push(fallbackResult);
                }
            }
        }
        const processingTime = Date.now() - startTime;
        this.logger.log(`批量分析完成: ${results.length} 个结果, 耗时: ${processingTime}ms`);
        return results;
    }
    async analyzeTrend(texts, options) {
        const startTime = Date.now();
        try {
            this.logger.log(`开始分析情感趋势: ${texts.length} 个文本`);
            const interval = options?.timeInterval || 'day';
            const industry = options?.industry;
            const timeGroups = this.groupByTimeInterval(texts, interval);
            const trendPoints = [];
            let totalPositive = 0;
            let totalNegative = 0;
            let totalNeutral = 0;
            for (const [timeLabel, groupTexts] of timeGroups) {
                if (groupTexts.length === 0)
                    continue;
                const requests = groupTexts.map((item) => ({
                    text: item.text,
                    industry,
                    platform: 'unknown',
                }));
                const results = await this.analyzeTexts(requests);
                const positiveCount = results.filter((r) => r.polarity === 'positive').length;
                const negativeCount = results.filter((r) => r.polarity === 'negative').length;
                const neutralCount = results.filter((r) => r.polarity === 'neutral').length;
                const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
                const trendPoint = {
                    timestamp: this.parseTimeLabel(timeLabel, interval),
                    averageScore,
                    positiveRatio: positiveCount / results.length,
                    negativeRatio: negativeCount / results.length,
                    neutralRatio: neutralCount / results.length,
                    sampleCount: results.length,
                };
                trendPoints.push(trendPoint);
                totalPositive += positiveCount;
                totalNegative += negativeCount;
                totalNeutral += neutralCount;
            }
            trendPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            const trendDirection = this.calculateTrendDirection(trendPoints);
            const trendMagnitude = this.calculateTrendMagnitude(trendPoints);
            const keyEvents = this.detectKeyEvents(trendPoints);
            const totalSamples = totalPositive + totalNegative + totalNeutral;
            const result = {
                period: {
                    start: trendPoints[0]?.timestamp || new Date(),
                    end: trendPoints[trendPoints.length - 1]?.timestamp || new Date(),
                },
                trends: trendPoints,
                overallSentiment: {
                    positive: totalPositive,
                    negative: totalNegative,
                    neutral: totalNeutral,
                    total: totalSamples,
                },
                trendDirection,
                trendMagnitude,
                keyEvents,
            };
            const processingTime = Date.now() - startTime;
            this.logger.log(`情感趋势分析完成: ${trendPoints.length} 个时间点, 耗时: ${processingTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`情感趋势分析失败: ${error.message}`, error.stack);
            throw new Error(`情感趋势分析失败: ${error.message}`);
        }
    }
    async checkAlerts(texts, rules) {
        const alerts = [];
        const enabledRules = rules.filter((rule) => rule.enabled);
        if (enabledRules.length === 0) {
            return alerts;
        }
        this.logger.log(`检查 ${enabledRules.length} 个预警规则`);
        const requests = texts.map((item) => ({
            text: item.text,
            timestamp: item.timestamp,
        }));
        const results = await this.analyzeTexts(requests);
        for (const rule of enabledRules) {
            try {
                const alert = this.checkRule(rule, results);
                if (alert) {
                    alerts.push(alert);
                }
            }
            catch (error) {
                this.logger.error(`检查规则 ${rule.name} 失败: ${error.message}`);
            }
        }
        this.logger.log(`发现 ${alerts.length} 个预警`);
        return alerts;
    }
    selectProvider(request) {
        if (request.text.length < 20) {
            return 'lexicon';
        }
        if (request.industry && request.industry !== 'generic') {
            return 'lexicon';
        }
        return this.defaultProvider;
    }
    extractTargets(text, specifiedTarget) {
        const targets = [];
        if (specifiedTarget) {
            targets.push(specifiedTarget);
        }
        const targetKeywords = [
            '产品',
            '服务',
            '质量',
            '价格',
            '客服',
            '物流',
            '包装',
            '品牌',
            '公司',
            '商家',
            '店铺',
            '餐厅',
            '酒店',
            '景区',
            '软件',
            '应用',
            '系统',
            '网站',
            '平台',
            '功能',
            '性能',
        ];
        for (const keyword of targetKeywords) {
            if (text.includes(keyword)) {
                targets.push(keyword);
            }
        }
        return targets.slice(0, 5);
    }
    extractReasons(text, polarity) {
        const reasons = [];
        const reasonPatterns = [
            { pattern: /质量(好|优秀|差|糟糕)/, reason: '质量问题' },
            { pattern: /价格(便宜|实惠|贵|高昂)/, reason: '价格问题' },
            { pattern: /服务(好|周到|差|态度差)/, reason: '服务问题' },
            { pattern: /物流(快|及时|慢|延误)/, reason: '物流问题' },
            { pattern: /包装(完好|精美|破损|简陋)/, reason: '包装问题' },
            { pattern: /设计(美观|时尚|丑|过时)/, reason: '设计问题' },
            { pattern: /性能(强大|流畅|差|卡顿)/, reason: '性能问题' },
            { pattern: /功能(丰富|齐全|少|缺失)/, reason: '功能问题' },
        ];
        for (const { pattern, reason } of reasonPatterns) {
            if (pattern.test(text)) {
                reasons.push(reason);
            }
        }
        return reasons.slice(0, 3);
    }
    groupRequests(requests) {
        const groups = new Map();
        for (const request of requests) {
            const groupKey = `${request.industry || 'generic'}-${request.platform || 'unknown'}`;
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey).push(request);
        }
        return groups;
    }
    groupByTimeInterval(texts, interval) {
        const groups = new Map();
        for (const item of texts) {
            const timeLabel = this.getTimeLabel(item.timestamp, interval);
            if (!groups.has(timeLabel)) {
                groups.set(timeLabel, []);
            }
            groups.get(timeLabel).push(item);
        }
        return groups;
    }
    getTimeLabel(timestamp, interval) {
        const date = new Date(timestamp);
        switch (interval) {
            case 'hour':
                return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
            case 'day':
                return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            case 'week':
                const weekNumber = Math.floor(date.getDate() / 7) + 1;
                return `${date.getFullYear()}-W${weekNumber}`;
            case 'month':
                return `${date.getFullYear()}-${date.getMonth() + 1}`;
            default:
                return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }
    }
    parseTimeLabel(timeLabel, interval) {
        try {
            switch (interval) {
                case 'hour':
                    return new Date(timeLabel.replace(' ', 'T') + ':00');
                case 'day':
                    return new Date(timeLabel + 'T00:00:00');
                case 'week':
                    const [year, week] = timeLabel.split('-W');
                    return new Date(`${year}-01-01T00:00:00`);
                case 'month':
                    return new Date(`${timeLabel}-01T00:00:00`);
                default:
                    return new Date(timeLabel + 'T00:00:00');
            }
        }
        catch (error) {
            this.logger.warn(`无法解析时间标签 ${timeLabel}: ${error.message}`);
            return new Date();
        }
    }
    calculateTrendDirection(trendPoints) {
        if (trendPoints.length < 2) {
            return 'stable';
        }
        const n = trendPoints.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;
        for (let i = 0; i < n; i++) {
            const x = i;
            const y = trendPoints[i].averageScore;
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        if (slope > 0.01) {
            return 'rising';
        }
        else if (slope < -0.01) {
            return 'falling';
        }
        else {
            return 'stable';
        }
    }
    calculateTrendMagnitude(trendPoints) {
        if (trendPoints.length < 2) {
            return 0;
        }
        let totalChange = 0;
        for (let i = 1; i < trendPoints.length; i++) {
            totalChange += Math.abs(trendPoints[i].averageScore - trendPoints[i - 1].averageScore);
        }
        const avgChange = totalChange / (trendPoints.length - 1);
        return Math.min(1, avgChange * 2);
    }
    detectKeyEvents(trendPoints) {
        const keyEvents = [];
        if (trendPoints.length < 2) {
            return keyEvents;
        }
        const threshold = 0.3;
        for (let i = 1; i < trendPoints.length; i++) {
            const prevScore = trendPoints[i - 1].averageScore;
            const currScore = trendPoints[i].averageScore;
            const scoreChange = currScore - prevScore;
            const absChange = Math.abs(scoreChange);
            if (absChange > threshold) {
                const direction = scoreChange > 0 ? '上升' : '下降';
                const magnitude = Math.round(absChange * 100);
                keyEvents.push({
                    timestamp: trendPoints[i].timestamp,
                    scoreChange,
                    description: `情感分数显著${direction} ${magnitude}%`,
                });
            }
        }
        return keyEvents;
    }
    checkRule(rule, results) {
        const { condition } = rule;
        let filteredResults = results;
        if (condition.timeWindow) {
            const windowStart = new Date(Date.now() - condition.timeWindow * 60 * 1000);
            filteredResults = results.filter((r) => r.analyzedAt >= windowStart);
        }
        if (condition.minSamples && filteredResults.length < condition.minSamples) {
            return null;
        }
        let metricValue;
        switch (condition.metric) {
            case 'negative_ratio':
                const negativeCount = filteredResults.filter((r) => r.polarity === 'negative').length;
                metricValue =
                    filteredResults.length > 0
                        ? negativeCount / filteredResults.length
                        : 0;
                break;
            case 'average_score':
                const totalScore = filteredResults.reduce((sum, r) => sum + r.score, 0);
                metricValue =
                    filteredResults.length > 0 ? totalScore / filteredResults.length : 0;
                break;
            case 'volume_spike':
                metricValue = filteredResults.length;
                break;
            default:
                this.logger.warn(`未知的预警指标: ${condition.metric}`);
                return null;
        }
        const shouldAlert = this.evaluateCondition(metricValue, condition.operator, condition.threshold);
        if (shouldAlert) {
            const examples = filteredResults
                .slice(0, 3)
                .map((r) => r.text.substring(0, 50) + '...');
            const positiveCount = filteredResults.filter((r) => r.polarity === 'positive').length;
            const negativeCount = filteredResults.filter((r) => r.polarity === 'negative').length;
            const neutralCount = filteredResults.filter((r) => r.polarity === 'neutral').length;
            const alert = {
                id: `${rule.id}-${Date.now()}`,
                ruleId: rule.id,
                severity: rule.severity,
                triggeredAt: new Date(),
                data: {
                    currentValue: metricValue,
                    threshold: condition.threshold,
                    timeWindow: condition.timeWindow,
                    sampleCount: filteredResults.length,
                    examples,
                    sentimentDistribution: {
                        positive: positiveCount,
                        negative: negativeCount,
                        neutral: neutralCount,
                    },
                },
                status: 'active',
            };
            this.logger.warn(`触发预警: ${rule.name}, 指标值: ${metricValue}, 阈值: ${condition.threshold}`);
            return alert;
        }
        return null;
    }
    evaluateCondition(value, operator, threshold) {
        switch (operator) {
            case '>':
                return value > threshold;
            case '<':
                return value < threshold;
            case '>=':
                return value >= threshold;
            case '<=':
                return value <= threshold;
            case '==':
                return Math.abs(value - threshold) < 0.001;
            default:
                this.logger.warn(`未知的操作符: ${operator}`);
                return false;
        }
    }
    async getProvidersHealth() {
        const healthResults = {};
        for (const [name, provider] of this.providers) {
            try {
                const health = await provider.healthCheck();
                healthResults[name] = health;
            }
            catch (error) {
                healthResults[name] = {
                    healthy: false,
                    message: `健康检查异常: ${error.message}`,
                };
            }
        }
        return healthResults;
    }
};
exports.SentimentAnalysisService = SentimentAnalysisService;
exports.SentimentAnalysisService = SentimentAnalysisService = SentimentAnalysisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, common_1.Inject)('SENTIMENT_PROVIDERS')),
    __metadata("design:paramtypes", [Array])
], SentimentAnalysisService);
//# sourceMappingURL=sentiment-analysis.service.js.map