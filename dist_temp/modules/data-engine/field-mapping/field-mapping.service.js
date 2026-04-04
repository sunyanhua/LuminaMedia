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
var FieldMappingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldMappingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const gemini_service_1 = require("../../data-analytics/services/gemini.service");
const platform_enum_1 = require("../../../shared/enums/platform.enum");
let FieldMappingService = FieldMappingService_1 = class FieldMappingService {
    configService;
    geminiService;
    logger = new common_1.Logger(FieldMappingService_1.name);
    standardFields = [];
    mappingCache = new Map();
    CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
    constructor(configService, geminiService) {
        this.configService = configService;
        this.geminiService = geminiService;
        this.initializeStandardFields();
    }
    initializeStandardFields() {
        this.standardFields = [
            {
                id: 'age_group',
                name: '年龄分组',
                description: '客户年龄分组，如18-25、26-35等',
                category: 'basic_lifecycle',
                dataType: 'string',
                examples: ['18-25岁', '26-35岁', '36-45岁', '46岁以上'],
                synonyms: ['年龄段', '年龄组', '年龄分段', 'age group'],
            },
            {
                id: 'education',
                name: '学历',
                description: '客户最高学历',
                category: 'basic_lifecycle',
                dataType: 'string',
                examples: ['高中', '本科', '硕士', '博士'],
                synonyms: ['教育程度', '学历背景', '教育水平', 'education level'],
            },
            {
                id: 'family_role',
                name: '家庭角色',
                description: '客户在家庭中的角色',
                category: 'basic_lifecycle',
                dataType: 'string',
                examples: ['单身', '已婚无子女', '已婚有子女', '离异'],
                synonyms: ['家庭身份', '婚姻状况', '家庭状况', 'family status'],
            },
            {
                id: 'potential_value',
                name: '潜在价值',
                description: '客户未来潜在消费价值评估',
                category: 'basic_lifecycle',
                dataType: 'string',
                examples: ['低', '中', '高'],
                synonyms: [
                    '价值潜力',
                    '客户价值',
                    '潜在价值评分',
                    'potential value score',
                ],
            },
            {
                id: 'lifecycle_stage',
                name: '生命周期阶段',
                description: '客户生命周期阶段（新客、活跃、沉默、流失）',
                category: 'basic_lifecycle',
                dataType: 'string',
                examples: ['新客户', '活跃客户', '沉默客户', '流失客户'],
                synonyms: ['客户阶段', '生命周期', '客户状态', 'lifecycle phase'],
            },
            {
                id: 'consumption_level',
                name: '消费水平',
                description: '客户消费能力等级',
                category: 'consumption_personality',
                dataType: 'string',
                examples: ['低消费', '中等消费', '高消费', '超高消费'],
                synonyms: ['消费等级', '消费能力', '消费层级', 'consumption tier'],
            },
            {
                id: 'shopping_width',
                name: '品类宽度',
                description: '客户购物品类广泛程度',
                category: 'consumption_personality',
                dataType: 'string',
                examples: ['窄', '中等', '宽'],
                synonyms: ['购物广度', '消费范围', '品类多样性', 'shopping breadth'],
            },
            {
                id: 'decision_speed',
                name: '决策速度',
                description: '客户购买决策速度',
                category: 'consumption_personality',
                dataType: 'string',
                examples: ['快速决策', '中等决策', '慢速决策'],
                synonyms: [
                    '购买决策速度',
                    '决策时间',
                    '决策效率',
                    'decision making speed',
                ],
            },
            {
                id: 'price_sensitivity',
                name: '价格敏感度',
                description: '客户对价格的敏感程度',
                category: 'consumption_personality',
                dataType: 'string',
                examples: ['高度敏感', '中等敏感', '不敏感'],
                synonyms: ['价格敏感', '价格关注度', 'price sensitivity level'],
            },
            {
                id: 'brand_loyalty',
                name: '品牌忠诚度',
                description: '客户对品牌的忠诚程度',
                category: 'consumption_personality',
                dataType: 'string',
                examples: ['低', '中', '高'],
                synonyms: ['品牌粘性', '品牌偏好', '忠诚度评分', 'brand loyalty score'],
            },
            {
                id: 'activity_level',
                name: '活跃度',
                description: '客户近期活动频率和强度',
                category: 'realtime_status',
                dataType: 'number',
                examples: ['85', '60', '30'],
                synonyms: ['活动水平', '活跃等级', '活动频率', 'activity score'],
            },
            {
                id: 'growth_trend',
                name: '增长趋势',
                description: '客户价值增长趋势',
                category: 'realtime_status',
                dataType: 'string',
                examples: ['下降', '稳定', '增长', '快速增长'],
                synonyms: ['成长趋势', '发展趋势', '趋势方向', 'growth direction'],
            },
            {
                id: 'engagement_score',
                name: '参与度评分',
                description: '客户参与互动活动的评分',
                category: 'realtime_status',
                dataType: 'number',
                examples: ['75', '90', '45'],
                synonyms: ['互动得分', '互动评分', '参与度分数', 'engagement level'],
            },
            {
                id: 'satisfaction_score',
                name: '满意度评分',
                description: '客户满意度评分',
                category: 'realtime_status',
                dataType: 'number',
                examples: ['80', '95', '60'],
                synonyms: [
                    '满意程度',
                    '满意度分数',
                    '客户满意度',
                    'satisfaction level',
                ],
            },
            {
                id: 'churn_risk',
                name: '流失风险',
                description: '客户流失风险评估',
                category: 'realtime_status',
                dataType: 'string',
                examples: ['低风险', '中风险', '高风险'],
                synonyms: ['流失概率', '流失风险等级', 'churn probability'],
            },
            {
                id: 'fission_potential',
                name: '裂变潜力',
                description: '客户分享和传播内容潜力',
                category: 'social_activity',
                dataType: 'string',
                examples: ['低', '中', '高'],
                synonyms: ['传播潜力', '分享潜力', '社交传播力', 'viral potential'],
            },
            {
                id: 'activity_preference',
                name: '活动偏好',
                description: '客户偏好的活动类型',
                category: 'social_activity',
                dataType: 'array',
                examples: ['户外运动', '美食探店', '美妆护肤', '亲子活动'],
                synonyms: ['偏好活动', '兴趣偏好', '活动兴趣', 'activity interests'],
            },
            {
                id: 'social_influence',
                name: '社交影响力',
                description: '客户在社交网络中的影响力',
                category: 'social_activity',
                dataType: 'number',
                examples: ['70', '85', '95'],
                synonyms: ['影响力分数', '社交影响评分', 'social influence score'],
            },
            {
                id: 'community_participation',
                name: '社区参与度',
                description: '客户参与社区活动程度',
                category: 'social_activity',
                dataType: 'string',
                examples: ['低', '中', '高'],
                synonyms: ['社区活跃度', '社区参与程度', 'community engagement'],
            },
            {
                id: 'content_creation',
                name: '内容创作倾向',
                description: '客户创作和分享内容倾向',
                category: 'social_activity',
                dataType: 'string',
                examples: ['被动消费', '偶尔分享', '活跃创作'],
                synonyms: [
                    '内容分享',
                    '创作倾向',
                    '内容生产',
                    'content creation tendency',
                ],
            },
            {
                id: 'customer_id',
                name: '客户ID',
                description: '客户唯一标识',
                category: 'general_info',
                dataType: 'string',
                examples: ['CUST001', 'MEM12345', 'USER_789'],
                synonyms: ['会员号', '用户ID', '顾客编号', 'customer number'],
            },
            {
                id: 'name',
                name: '姓名',
                description: '客户姓名',
                category: 'general_info',
                dataType: 'string',
                examples: ['张三', '李四', '王五'],
                synonyms: ['名字', '客户名称', '顾客姓名', 'full name'],
            },
            {
                id: 'mobile',
                name: '手机号',
                description: '客户手机号码',
                category: 'general_info',
                dataType: 'string',
                examples: ['13800138000', '13912345678'],
                synonyms: ['电话', '手机', '联系电话', '手机号码', 'phone number'],
            },
            {
                id: 'email',
                name: '邮箱',
                description: '客户电子邮箱',
                category: 'general_info',
                dataType: 'string',
                examples: ['customer@example.com', 'user@gmail.com'],
                synonyms: ['电子邮件', 'email', '电子邮箱', 'email address'],
            },
            {
                id: 'gender',
                name: '性别',
                description: '客户性别',
                category: 'general_info',
                dataType: 'string',
                examples: ['男', '女', '未知'],
                synonyms: ['性别', 'gender'],
            },
            {
                id: 'birth_date',
                name: '出生日期',
                description: '客户出生日期',
                category: 'demographic',
                dataType: 'date',
                examples: ['1990-01-01', '1985-05-15'],
                synonyms: ['生日', '出生年月', '出生日期', 'date of birth'],
            },
            {
                id: 'age',
                name: '年龄',
                description: '客户年龄（数字）',
                category: 'demographic',
                dataType: 'number',
                examples: ['25', '35', '45'],
                synonyms: ['年龄', '岁数', '年龄数值', 'age'],
            },
            {
                id: 'province',
                name: '省份',
                description: '客户所在省份',
                category: 'demographic',
                dataType: 'string',
                examples: ['北京', '上海', '广东', '浙江'],
                synonyms: ['省份', '省', '所在省份', 'province'],
            },
            {
                id: 'city',
                name: '城市',
                description: '客户所在城市',
                category: 'demographic',
                dataType: 'string',
                examples: ['北京市', '上海市', '广州市', '深圳市'],
                synonyms: ['城市', '所在城市', 'city'],
            },
            {
                id: 'address',
                name: '地址',
                description: '客户详细地址',
                category: 'demographic',
                dataType: 'string',
                examples: ['北京市朝阳区某某路123号'],
                synonyms: ['地址', '居住地址', '联系地址', '详细地址', 'address'],
            },
            {
                id: 'first_purchase_date',
                name: '首次购买日期',
                description: '客户首次购买日期',
                category: 'behavioral',
                dataType: 'date',
                examples: ['2023-01-15', '2022-05-20'],
                synonyms: ['首次消费日期', '首次交易日期', 'first purchase'],
            },
            {
                id: 'last_purchase_date',
                name: '最近购买日期',
                description: '客户最近一次购买日期',
                category: 'behavioral',
                dataType: 'date',
                examples: ['2024-03-10', '2024-02-28'],
                synonyms: [
                    '最后购买日期',
                    '最近消费日期',
                    '上次交易日期',
                    'last purchase',
                ],
            },
            {
                id: 'purchase_frequency',
                name: '购买频率',
                description: '客户购买频率（次/月）',
                category: 'behavioral',
                dataType: 'number',
                examples: ['2.5', '1.0', '4.2'],
                synonyms: ['消费频率', '购买频次', '交易频率', 'purchase rate'],
            },
            {
                id: 'avg_purchase_value',
                name: '平均客单价',
                description: '客户平均每次消费金额',
                category: 'behavioral',
                dataType: 'number',
                examples: ['150.50', '89.99', '320.00'],
                synonyms: [
                    '平均消费金额',
                    '平均交易金额',
                    '平均订单价值',
                    'average order value',
                ],
            },
            {
                id: 'total_purchase_value',
                name: '累计消费金额',
                description: '客户累计消费总金额',
                category: 'behavioral',
                dataType: 'number',
                examples: ['1250.00', '5890.50', '32000.00'],
                synonyms: ['累计消费', '总消费金额', '累计交易金额', 'total spend'],
            },
            {
                id: 'order_id',
                name: '订单ID',
                description: '订单唯一标识',
                category: 'transactional',
                dataType: 'string',
                examples: ['ORD001', 'ORDER_12345', 'TRX_789'],
                synonyms: ['订单号', '交易ID', '订单编号', 'order number'],
            },
            {
                id: 'product_id',
                name: '产品ID',
                description: '产品唯一标识',
                category: 'transactional',
                dataType: 'string',
                examples: ['PROD001', 'ITEM_123', 'SKU_456'],
                synonyms: ['商品ID', '产品编号', '商品编号', 'product code'],
            },
            {
                id: 'product_name',
                name: '产品名称',
                description: '产品名称',
                category: 'transactional',
                dataType: 'string',
                examples: ['智能手机', '护肤品套装', '图书'],
                synonyms: ['商品名称', '产品名', '商品名', 'product name'],
            },
            {
                id: 'quantity',
                name: '数量',
                description: '购买数量',
                category: 'transactional',
                dataType: 'number',
                examples: ['1', '2', '5'],
                synonyms: ['购买数量', '数量', '件数', 'quantity purchased'],
            },
            {
                id: 'unit_price',
                name: '单价',
                description: '产品单价',
                category: 'transactional',
                dataType: 'number',
                examples: ['99.99', '199.00', '49.50'],
                synonyms: ['价格', '单价', '商品单价', 'price per unit'],
            },
        ];
        this.logger.log(`已初始化 ${this.standardFields.length} 个标准字段`);
    }
    getAllStandardFields() {
        return this.standardFields;
    }
    getStandardFieldsByCategory() {
        const result = {};
        for (const field of this.standardFields) {
            if (!result[field.category]) {
                result[field.category] = [];
            }
            result[field.category].push(field);
        }
        return result;
    }
    async mapHeadersWithAI(headers, context) {
        this.logger.log(`开始AI字段映射，表头数量: ${headers.length}`);
        const cachedMappings = this.getCachedMappings(headers);
        const ruleBasedMappings = this.mapWithRules(headers);
        const aiEnhancedMappings = await this.mapWithAI(headers.filter((h) => !cachedMappings.mapping[h] && !ruleBasedMappings.mapping[h]), context);
        const finalMapping = {};
        const finalConfidence = {};
        const suggestedMappings = [];
        for (const [header, targetField] of Object.entries(cachedMappings.mapping)) {
            finalMapping[header] = targetField;
            finalConfidence[header] = cachedMappings.confidence[header] || 0.95;
            suggestedMappings.push({
                sourceHeader: header,
                targetField,
                confidence: finalConfidence[header],
                reasoning: '来自历史映射缓存',
            });
        }
        for (const [header, targetField] of Object.entries(ruleBasedMappings.mapping)) {
            if (!finalMapping[header]) {
                finalMapping[header] = targetField;
                finalConfidence[header] = ruleBasedMappings.confidence[header] || 0.8;
                suggestedMappings.push({
                    sourceHeader: header,
                    targetField,
                    confidence: finalConfidence[header],
                    reasoning: '基于规则匹配',
                });
            }
        }
        for (const mapping of aiEnhancedMappings) {
            if (!finalMapping[mapping.sourceHeader]) {
                finalMapping[mapping.sourceHeader] = mapping.targetField;
                finalConfidence[mapping.sourceHeader] = mapping.confidence;
                suggestedMappings.push(mapping);
                this.cacheMapping(mapping.sourceHeader, mapping.targetField, mapping.confidence);
            }
        }
        const unmatchedHeaders = headers.filter((h) => !finalMapping[h]);
        const result = {
            mapping: finalMapping,
            confidence: finalConfidence,
            suggestedMappings: suggestedMappings.sort((a, b) => b.confidence - a.confidence),
            unmatchedHeaders,
            standardFields: this.standardFields,
        };
        this.logger.log(`字段映射完成: ${Object.keys(finalMapping).length}/${headers.length} 个表头已映射`);
        if (unmatchedHeaders.length > 0) {
            this.logger.warn(`未匹配的表头: ${unmatchedHeaders.join(', ')}`);
        }
        return result;
    }
    getCachedMappings(headers) {
        const mapping = {};
        const confidence = {};
        const now = Date.now();
        for (const header of headers) {
            const cacheKey = this.normalizeHeader(header);
            const cachedRule = this.mappingCache.get(cacheKey);
            if (cachedRule && now - cachedRule.updatedAt.getTime() < this.CACHE_TTL) {
                mapping[header] = cachedRule.targetField;
                confidence[header] = cachedRule.confidence;
            }
        }
        return { mapping, confidence };
    }
    cacheMapping(sourceHeader, targetField, confidence) {
        const cacheKey = this.normalizeHeader(sourceHeader);
        const now = new Date();
        const existingRule = this.mappingCache.get(cacheKey);
        if (existingRule) {
            existingRule.targetField = targetField;
            existingRule.confidence = confidence;
            existingRule.updatedAt = now;
            existingRule.usageCount++;
        }
        else {
            this.mappingCache.set(cacheKey, {
                sourceHeader,
                targetField,
                confidence,
                createdAt: now,
                updatedAt: now,
                usageCount: 1,
            });
        }
    }
    mapWithRules(headers) {
        const mapping = {};
        const confidence = {};
        for (const header of headers) {
            const normalizedHeader = this.normalizeHeader(header);
            for (const field of this.standardFields) {
                for (const synonym of field.synonyms) {
                    const normalizedSynonym = synonym.toLowerCase().replace(/[_\s]/g, '');
                    const normalizedHeaderClean = normalizedHeader.replace(/[_\s]/g, '');
                    if (normalizedHeaderClean.includes(normalizedSynonym) &&
                        normalizedSynonym.length > 1) {
                        mapping[header] = field.id;
                        confidence[header] = 0.7;
                        break;
                    }
                }
                if (mapping[header])
                    break;
                const normalizedFieldName = field.name
                    .toLowerCase()
                    .replace(/[_\s]/g, '');
                const normalizedHeaderClean = normalizedHeader.replace(/[_\s]/g, '');
                if (normalizedHeaderClean.includes(normalizedFieldName) &&
                    normalizedFieldName.length > 1) {
                    mapping[header] = field.id;
                    confidence[header] = 0.75;
                    break;
                }
            }
        }
        return { mapping, confidence };
    }
    async mapWithAI(headers, context) {
        if (headers.length === 0) {
            return [];
        }
        if (!this.geminiService.isGeminiAvailable()) {
            this.logger.warn('Gemini API不可用，跳过AI字段映射');
            return [];
        }
        try {
            const prompt = this.buildAIMappingPrompt(headers, context);
            const result = await this.geminiService.generateContent({
                prompt,
                platform: platform_enum_1.Platform.GENERAL,
                tone: 'professional',
                wordCount: 500,
            });
            if (!result.success || !result.content) {
                this.logger.error('AI字段映射失败，无法生成内容');
                return [];
            }
            return this.parseAIResponse(result.content.content, headers);
        }
        catch (error) {
            this.logger.error(`AI字段映射出错: ${error.message}`);
            return [];
        }
    }
    buildAIMappingPrompt(headers, context) {
        const fieldCategories = this.getStandardFieldsByCategory();
        const categoryDescriptions = Object.entries(fieldCategories)
            .map(([category, fields]) => {
            const fieldList = fields
                .map((f) => `${f.name} (${f.id}): ${f.description}`)
                .join('\n  - ');
            return `${category}:\n  - ${fieldList}`;
        })
            .join('\n\n');
        let sampleDataPrompt = '';
        if (context?.sampleData && context.sampleData.length > 0) {
            const sample = context.sampleData[0];
            const sampleText = Object.entries(sample)
                .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                .join(', ');
            sampleDataPrompt = `\n样本数据示例: ${sampleText}`;
        }
        return `你是一个数据字段映射专家。请将以下Excel/CSV表头映射到标准字段。

表头列表: ${JSON.stringify(headers, null, 2)}
${context?.industry ? `行业背景: ${context.industry}` : ''}
${context?.dataSourceType ? `数据源类型: ${context.dataSourceType}` : ''}
${sampleDataPrompt}

标准字段体系（按分类）:
${categoryDescriptions}

请分析每个表头的语义，将其映射到最合适的标准字段。考虑以下因素：
1. 表头的字面含义
2. 可能的同义词和缩写
3. 行业术语习惯
4. 数据类型匹配

输出要求：
请返回JSON数组，每个元素包含：
- sourceHeader: 原始表头
- targetField: 标准字段ID（从上面的字段列表中选择）
- confidence: 置信度（0-1之间的小数）
- reasoning: 简要的映射理由（可选）

示例输出：
[
  {
    "sourceHeader": "顾客姓名",
    "targetField": "name",
    "confidence": 0.95,
    "reasoning": "顾客姓名直接对应姓名字段"
  },
  {
    "sourceHeader": "手机",
    "targetField": "mobile",
    "confidence": 0.9,
    "reasoning": "手机是手机号的常见简称"
  }
]

请只返回JSON数组，不要包含任何额外文本。`;
    }
    parseAIResponse(aiResponse, originalHeaders) {
        try {
            let jsonText = aiResponse.trim();
            jsonText = jsonText
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const mappings = JSON.parse(jsonText);
            if (!Array.isArray(mappings)) {
                throw new Error('AI响应不是有效的数组');
            }
            const validMappings = mappings.filter((mapping) => {
                return (mapping &&
                    typeof mapping.sourceHeader === 'string' &&
                    typeof mapping.targetField === 'string' &&
                    typeof mapping.confidence === 'number' &&
                    mapping.confidence >= 0 &&
                    mapping.confidence <= 1 &&
                    originalHeaders.includes(mapping.sourceHeader));
            });
            const validFieldIds = new Set(this.standardFields.map((f) => f.id));
            const finalMappings = validMappings.filter((m) => validFieldIds.has(m.targetField));
            this.logger.log(`AI映射解析成功: ${finalMappings.length}/${mappings.length} 个映射有效`);
            return finalMappings;
        }
        catch (error) {
            this.logger.error(`解析AI响应失败: ${error.message}`);
            this.logger.debug(`原始响应: ${aiResponse.substring(0, 500)}...`);
            return [];
        }
    }
    normalizeHeader(header) {
        return header
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\u4e00-\u9fa5\s]/g, '');
    }
    saveManualMapping(sourceHeader, targetField, userId, notes) {
        const cacheKey = this.normalizeHeader(sourceHeader);
        const now = new Date();
        const validFieldIds = new Set(this.standardFields.map((f) => f.id));
        if (!validFieldIds.has(targetField)) {
            throw new Error(`无效的目标字段: ${targetField}`);
        }
        this.mappingCache.set(cacheKey, {
            sourceHeader,
            targetField,
            confidence: 1.0,
            createdAt: now,
            updatedAt: now,
            usageCount: 1,
        });
        this.logger.log(`用户 ${userId} 保存了人工映射: ${sourceHeader} -> ${targetField}`);
    }
    getMappingStats() {
        const now = Date.now();
        const activeRules = Array.from(this.mappingCache.values()).filter((rule) => now - rule.updatedAt.getTime() < this.CACHE_TTL);
        const byConfidence = {
            high: activeRules.filter((r) => r.confidence >= 0.8).length,
            medium: activeRules.filter((r) => r.confidence >= 0.5 && r.confidence < 0.8).length,
            low: activeRules.filter((r) => r.confidence < 0.5).length,
        };
        const byCategory = {};
        for (const rule of activeRules) {
            const field = this.standardFields.find((f) => f.id === rule.targetField);
            if (field) {
                byCategory[field.category] = (byCategory[field.category] || 0) + 1;
            }
        }
        const cacheHitRate = 0.7;
        return {
            totalRules: activeRules.length,
            byConfidence,
            byCategory: byCategory,
            cacheHitRate,
        };
    }
};
exports.FieldMappingService = FieldMappingService;
exports.FieldMappingService = FieldMappingService = FieldMappingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(gemini_service_1.GeminiService)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        gemini_service_1.GeminiService])
], FieldMappingService);
//# sourceMappingURL=field-mapping.service.js.map