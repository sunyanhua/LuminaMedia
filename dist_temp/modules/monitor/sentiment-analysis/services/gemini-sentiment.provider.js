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
var GeminiSentimentProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiSentimentProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let GeminiSentimentProvider = GeminiSentimentProvider_1 = class GeminiSentimentProvider {
    configService;
    logger = new common_1.Logger(GeminiSentimentProvider_1.name);
    name = 'gemini';
    constructor(configService) {
        this.configService = configService;
    }
    async analyze(text, options) {
        try {
            const prompt = this.buildSentimentPrompt(text, options);
            const result = await this.callGeminiApi(prompt);
            return this.parseGeminiResponse(result);
        }
        catch (error) {
            this.logger.error(`Gemini情感分析失败: ${error.message}`, error.stack);
            return {
                polarity: 'neutral',
                score: 0,
                confidence: 0.5,
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
                    confidence: 0.5,
                    intensity: 0.5,
                    error: error.message,
                });
            }
        }
        return results;
    }
    async healthCheck() {
        try {
            const testText = '这个产品非常好，我非常喜欢！';
            const result = await this.analyze(testText);
            if (result.polarity &&
                typeof result.score === 'number' &&
                typeof result.confidence === 'number') {
                return { healthy: true, message: 'Gemini情感分析服务正常' };
            }
            else {
                return { healthy: false, message: 'Gemini情感分析返回结果格式异常' };
            }
        }
        catch (error) {
            return { healthy: false, message: `健康检查失败: ${error.message}` };
        }
    }
    buildSentimentPrompt(text, options) {
        const industry = options?.industry || '通用';
        const target = options?.target || '';
        return `你是一个专业的情感分析系统。请分析以下文本的情感倾向，并按照JSON格式返回结果。

文本内容：${text}

分析要求：
1. 情感极性：判断文本表达的情感是正面（positive）、负面（negative）还是中性（neutral）
2. 情感分数：-1到1之间的分数，-1表示极端负面，1表示极端正面
3. 置信度：0到1之间的分数，表示分析结果的置信程度
4. 情感强度：0到1之间的分数，表示情感的强烈程度
5. 情感对象：识别文本中提到的情感对象（如品牌、产品、服务等）
6. 情感原因：识别导致这种情感的原因（如质量问题、服务态度、价格等）

上下文信息：
- 行业领域：${industry}
- 关注对象：${target || '不指定'}

请只返回JSON格式的结果，不要包含任何解释性文字。JSON格式如下：
{
  "polarity": "positive|negative|neutral",
  "score": -1到1之间的数字,
  "confidence": 0到1之间的数字,
  "intensity": 0到1之间的数字,
  "targets": ["情感对象1", "情感对象2"],
  "reasons": ["情感原因1", "情感原因2"]
}`;
    }
    async callGeminiApi(prompt) {
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('未配置Gemini API Key');
        }
        const model = 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;
        const payload = {
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 8192,
                temperature: 0.1,
            },
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey,
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API调用失败: HTTP ${response.status}: ${errorText.substring(0, 200)}`);
            }
            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
            else {
                throw new Error('Gemini API返回格式异常');
            }
        }
        catch (error) {
            this.logger.error(`Gemini API调用异常: ${error.message}`);
            throw error;
        }
    }
    parseGeminiResponse(responseText) {
        try {
            let jsonText = responseText.trim();
            jsonText = jsonText
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const result = JSON.parse(jsonText);
            if (!result.polarity || typeof result.score !== 'number') {
                throw new Error('Gemini返回结果缺少必需字段');
            }
            const validPolarities = ['positive', 'negative', 'neutral'];
            const polarity = validPolarities.includes(result.polarity)
                ? result.polarity
                : 'neutral';
            const score = Math.max(-1, Math.min(1, result.score));
            const confidence = result.confidence !== undefined
                ? Math.max(0, Math.min(1, result.confidence))
                : 0.8;
            const intensity = result.intensity !== undefined
                ? Math.max(0, Math.min(1, result.intensity))
                : Math.abs(score);
            return {
                polarity,
                score,
                confidence,
                intensity,
                targets: result.targets || [],
                reasons: result.reasons || [],
            };
        }
        catch (error) {
            this.logger.error(`解析Gemini响应失败: ${error.message}, 原始响应: ${responseText.substring(0, 200)}`);
            const fallbackResult = this.extractSentimentFromText(responseText);
            return fallbackResult;
        }
    }
    extractSentimentFromText(text) {
        const positiveWords = [
            '好',
            '优秀',
            '满意',
            '喜欢',
            '推荐',
            '棒',
            '赞',
            '不错',
        ];
        const negativeWords = [
            '差',
            '糟糕',
            '不满意',
            '讨厌',
            '不推荐',
            '差劲',
            '烂',
            '问题',
        ];
        const lowerText = text.toLowerCase();
        let positiveCount = 0;
        let negativeCount = 0;
        for (const word of positiveWords) {
            if (lowerText.includes(word))
                positiveCount++;
        }
        for (const word of negativeWords) {
            if (lowerText.includes(word))
                negativeCount++;
        }
        let polarity = 'neutral';
        let score = 0;
        if (positiveCount > negativeCount) {
            polarity = 'positive';
            score = Math.min(1, positiveCount * 0.2);
        }
        else if (negativeCount > positiveCount) {
            polarity = 'negative';
            score = Math.max(-1, -negativeCount * 0.2);
        }
        const totalMatches = positiveCount + negativeCount;
        const confidence = totalMatches > 0 ? 0.6 : 0.3;
        return {
            polarity,
            score,
            confidence,
            intensity: Math.abs(score),
        };
    }
};
exports.GeminiSentimentProvider = GeminiSentimentProvider;
exports.GeminiSentimentProvider = GeminiSentimentProvider = GeminiSentimentProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiSentimentProvider);
//# sourceMappingURL=gemini-sentiment.provider.js.map