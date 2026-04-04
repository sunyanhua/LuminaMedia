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
var EnterpriseProfileAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseProfileAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const enterprise_profile_repository_1 = require("../../../shared/repositories/enterprise-profile.repository");
const customer_profile_repository_1 = require("../../../shared/repositories/customer-profile.repository");
const knowledge_retrieval_service_1 = require("../../ai-engine/agents/analysis/services/knowledge-retrieval.service");
const vector_search_service_1 = require("../../../shared/vector/services/vector-search.service");
let EnterpriseProfileAnalysisService = EnterpriseProfileAnalysisService_1 = class EnterpriseProfileAnalysisService {
    enterpriseProfileRepository;
    customerProfileRepository;
    knowledgeRetrievalService;
    vectorSearchService;
    configService;
    logger = new common_1.Logger(EnterpriseProfileAnalysisService_1.name);
    aiService;
    constructor(enterpriseProfileRepository, customerProfileRepository, knowledgeRetrievalService, vectorSearchService, configService) {
        this.enterpriseProfileRepository = enterpriseProfileRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.knowledgeRetrievalService = knowledgeRetrievalService;
        this.vectorSearchService = vectorSearchService;
        this.configService = configService;
        this.initializeAIService();
    }
    initializeAIService() {
        this.aiService = {
            analyzeEnterpriseProfile: async (data) => {
                return {
                    basicInfo: {
                        industry: data.industry || '科技',
                        scale: data.scale || 'medium',
                        region: data.region || '华东',
                        foundingYear: data.foundingYear || 2018,
                        employeeCount: data.employeeCount || 150,
                        annualRevenue: data.annualRevenue || '1000-5000万',
                    },
                    brandImage: {
                        tone: ['专业', '创新', '可靠'],
                        values: ['客户第一', '追求卓越', '团队合作'],
                        personality: ['专业权威', '创新引领', '值得信赖'],
                        visualStyle: ['现代简约', '科技感', '专业严谨'],
                    },
                    contentPreference: {
                        topics: ['行业趋势', '产品更新', '客户案例'],
                        formats: ['图文', '视频', '白皮书'],
                        frequency: '每周2-3次',
                        peakHours: [9, 10, 14, 15],
                    },
                    restrictions: {
                        forbiddenWords: ['倒闭', '失败', '欺诈'],
                        sensitiveTopics: ['政治', '宗教', '竞争对手负面'],
                        legalConstraints: ['广告法', '隐私保护', '知识产权'],
                        culturalTaboos: ['歧视性言论', '不当玩笑'],
                    },
                    successPatterns: {
                        highEngagementTopics: ['行业解决方案', '客户成功故事'],
                        effectiveFormats: ['案例研究', '视频教程'],
                        bestTiming: [
                            { dayOfWeek: '周二', hourOfDay: 10, engagementScore: 0.85 },
                            { dayOfWeek: '周四', hourOfDay: 14, engagementScore: 0.78 },
                        ],
                        audienceResponse: [
                            {
                                audienceSegment: '技术决策者',
                                responseType: '评论',
                                sentiment: 'positive',
                                commonFeedback: ['实用性强', '有深度'],
                            },
                        ],
                    },
                    confidenceScores: {
                        basicInfo: 0.9,
                        brandImage: 0.8,
                        contentPreference: 0.75,
                        restrictions: 0.7,
                        successPatterns: 0.65,
                    },
                };
            },
        };
    }
    async createAnalysisTask(customerProfileId) {
        this.logger.log(`创建企业画像分析任务: customerProfileId=${customerProfileId}`);
        const customerProfile = await this.customerProfileRepository.findById(customerProfileId);
        if (!customerProfile) {
            throw new common_1.NotFoundException(`客户档案不存在: ${customerProfileId}`);
        }
        const existingProfile = await this.enterpriseProfileRepository.findCurrentByCustomerProfileId(customerProfileId);
        if (existingProfile) {
            this.logger.warn(`已有当前版本的企业画像，将创建新版本: ${existingProfile.id}`);
        }
        const enterpriseProfile = this.enterpriseProfileRepository.create({
            tenantId: customerProfile.tenantId,
            customerProfileId,
            industry: customerProfile.industry,
            scale: 'medium',
            region: '未知',
            profileData: this.createEmptyProfileData(),
            status: 'pending',
            analysisProgress: 0,
            version: existingProfile ? existingProfile.version + 1 : 1,
            isCurrent: false,
            previousVersionId: existingProfile?.id || null,
        });
        const savedProfile = await this.enterpriseProfileRepository.save(enterpriseProfile);
        const result = Array.isArray(savedProfile) ? savedProfile[0] : savedProfile;
        this.logger.log(`企业画像记录创建成功: ${result.id}`);
        this.startAnalysisTask(result.id).catch((error) => {
            this.logger.error(`分析任务启动失败: ${error.message}`, error.stack);
        });
        return result;
    }
    async startAnalysisTask(profileId) {
        try {
            this.logger.log(`开始分析企业画像: ${profileId}`);
            await this.enterpriseProfileRepository.updateById(profileId, {
                status: 'analyzing',
                analysisProgress: 10,
            });
            await this.collectKnowledgeData(profileId);
            await this.extractEnterpriseFeatures(profileId);
            await this.generateProfileData(profileId);
            await this.calculateFeatureVector(profileId);
            await this.completeAnalysis(profileId);
            this.logger.log(`企业画像分析完成: ${profileId}`);
        }
        catch (error) {
            this.logger.error(`企业画像分析失败: ${error.message}`, error.stack);
            await this.enterpriseProfileRepository.updateById(profileId, {
                status: 'failed',
                errorMessage: error.message,
                analysisProgress: 0,
            });
        }
    }
    async collectKnowledgeData(profileId) {
        this.logger.log(`收集知识库数据: ${profileId}`);
        const profile = await this.enterpriseProfileRepository.findById(profileId);
        if (!profile)
            throw new common_1.NotFoundException(`企业画像不存在: ${profileId}`);
        await this.enterpriseProfileRepository.updateById(profileId, {
            analysisProgress: 20,
        });
        const industry = profile.industry;
        const knowledge = await this.knowledgeRetrievalService.retrieveRelevantKnowledge(`企业画像分析 ${industry} 行业`, industry, 10);
        const analysisReport = {
            collectedKnowledge: knowledge,
            collectionTime: new Date().toISOString(),
        };
        await this.enterpriseProfileRepository.updateById(profileId, {
            analysisReport,
            analysisProgress: 30,
        });
        this.logger.debug(`收集到 ${knowledge.length} 条知识库数据`);
    }
    async extractEnterpriseFeatures(profileId) {
        this.logger.log(`提取企业特征: ${profileId}`);
        const profile = await this.enterpriseProfileRepository.findById(profileId);
        if (!profile)
            throw new common_1.NotFoundException(`企业画像不存在: ${profileId}`);
        await this.enterpriseProfileRepository.updateById(profileId, {
            analysisProgress: 40,
        });
        const customerProfile = await this.customerProfileRepository.findById(profile.customerProfileId);
        if (!customerProfile) {
            throw new common_1.NotFoundException(`客户档案不存在: ${profile.customerProfileId}`);
        }
        const basicFeatures = {
            industry: customerProfile.industry,
            customerType: customerProfile.customerType,
            dataSources: customerProfile.dataSources || {},
            profileData: customerProfile.profileData || {},
            behaviorInsights: customerProfile.behaviorInsights || {},
        };
        const extractedFeatures = {
            basicFeatures,
            industryCharacteristics: this.extractIndustryCharacteristics(customerProfile.industry),
            competitivePosition: this.analyzeCompetitivePosition(basicFeatures),
            contentStrategyPatterns: this.identifyContentStrategyPatterns(basicFeatures),
        };
        const analysisReport = {
            ...profile.analysisReport,
            extractedFeatures,
            extractionTime: new Date().toISOString(),
        };
        await this.enterpriseProfileRepository.updateById(profileId, {
            analysisReport,
            analysisProgress: 50,
        });
    }
    async generateProfileData(profileId) {
        this.logger.log(`生成画像数据: ${profileId}`);
        const profile = await this.enterpriseProfileRepository.findById(profileId);
        if (!profile)
            throw new common_1.NotFoundException(`企业画像不存在: ${profileId}`);
        await this.enterpriseProfileRepository.updateById(profileId, {
            analysisProgress: 60,
        });
        const analysisReport = profile.analysisReport || {};
        const extractedFeatures = analysisReport.extractedFeatures || {};
        const profileData = await this.aiService.analyzeEnterpriseProfile({
            ...extractedFeatures,
            industry: profile.industry,
            customerProfileId: profile.customerProfileId,
        });
        await this.enterpriseProfileRepository.updateById(profileId, {
            profileData,
            analysisProgress: 80,
        });
        this.logger.debug(`画像数据生成完成`);
    }
    async calculateFeatureVector(profileId) {
        this.logger.log(`计算特征向量: ${profileId}`);
        const profile = await this.enterpriseProfileRepository.findById(profileId);
        if (!profile)
            throw new common_1.NotFoundException(`企业画像不存在: ${profileId}`);
        await this.enterpriseProfileRepository.updateById(profileId, {
            analysisProgress: 90,
        });
        const profileData = profile.profileData;
        const featureVector = this.generateFeatureVectorFromProfile(profileData);
        await this.enterpriseProfileRepository.updateById(profileId, {
            featureVector,
            featuresExtractedAt: new Date(),
            analysisProgress: 95,
        });
        this.logger.debug(`特征向量计算完成，维度: ${featureVector.length}`);
    }
    async completeAnalysis(profileId) {
        this.logger.log(`完成分析: ${profileId}`);
        const profile = await this.enterpriseProfileRepository.findById(profileId);
        if (!profile)
            throw new common_1.NotFoundException(`企业画像不存在: ${profileId}`);
        if (profile.previousVersionId) {
            await this.enterpriseProfileRepository.updateVersionStatus(profile.customerProfileId, profileId);
        }
        else {
            await this.enterpriseProfileRepository.updateById(profileId, {
                isCurrent: true,
            });
        }
        await this.enterpriseProfileRepository.updateById(profileId, {
            status: 'completed',
            analysisProgress: 100,
            isCurrent: true,
            updatedAt: new Date(),
        });
        this.logger.log(`企业画像分析完成: ${profileId}`);
    }
    async getProfile(profileId) {
        const profile = await this.enterpriseProfileRepository.findById(profileId);
        if (!profile) {
            throw new common_1.NotFoundException(`企业画像不存在: ${profileId}`);
        }
        return profile;
    }
    async getProfilesByCustomer(customerProfileId) {
        return this.enterpriseProfileRepository.findByCustomerProfileId(customerProfileId);
    }
    async getCurrentProfile(customerProfileId) {
        return this.enterpriseProfileRepository.findCurrentByCustomerProfileId(customerProfileId);
    }
    async reanalyzeProfile(profileId) {
        const profile = await this.getProfile(profileId);
        if (profile.status === 'analyzing') {
            throw new common_1.BadRequestException('画像正在分析中，请稍后再试');
        }
        const newProfile = await this.createAnalysisTask(profile.customerProfileId);
        this.logger.log(`重新分析任务创建成功: ${newProfile.id}`);
        return newProfile;
    }
    async getAnalysisStatus(profileId) {
        const profile = await this.getProfile(profileId);
        return {
            status: profile.status,
            progress: profile.analysisProgress,
            errorMessage: profile.errorMessage,
        };
    }
    async batchAnalyzeProfiles(customerProfileIds) {
        const results = [];
        for (const profileId of customerProfileIds) {
            try {
                const profile = await this.createAnalysisTask(profileId);
                results.push(profile);
            }
            catch (error) {
                this.logger.error(`批量分析失败 ${profileId}: ${error.message}`);
            }
        }
        return results;
    }
    extractIndustryCharacteristics(industry) {
        const characteristics = {
            电商: {
                keyTrends: ['直播电商', '社交电商', '跨境电商'],
                customerBehavior: ['冲动消费', '价格敏感', '评价依赖'],
                contentFormats: ['产品评测', '直播带货', '用户评价'],
            },
            金融: {
                keyTrends: ['金融科技', '数字化转型', '开放银行'],
                customerBehavior: ['风险规避', '信任需求', '专业要求'],
                contentFormats: ['行业分析', '政策解读', '投资建议'],
            },
            医疗: {
                keyTrends: ['互联网医疗', 'AI诊断', '远程医疗'],
                customerBehavior: ['隐私关注', '专业权威', '紧急需求'],
                contentFormats: ['健康科普', '病例分享', '专家访谈'],
            },
            教育: {
                keyTrends: ['在线教育', '个性化学习', '职业教育'],
                customerBehavior: ['效果导向', '时间灵活', '互动需求'],
                contentFormats: ['教学视频', '学习笔记', '直播答疑'],
            },
        };
        return (characteristics[industry] || {
            keyTrends: ['数字化转型', '客户体验优化', '数据驱动'],
            customerBehavior: ['价值导向', '便利性需求', '个性化期待'],
            contentFormats: ['案例分享', '行业洞察', '产品介绍'],
        });
    }
    analyzeCompetitivePosition(features) {
        return {
            marketPosition: '挑战者',
            competitiveAdvantages: ['技术创新', '客户服务', '品牌知名度'],
            competitiveDisadvantages: ['市场份额', '渠道覆盖', '价格竞争力'],
            strategicRecommendations: ['差异化定位', '细分市场专注', '合作伙伴生态'],
        };
    }
    identifyContentStrategyPatterns(features) {
        return {
            contentThemes: ['行业洞察', '产品价值', '客户成功'],
            formatPreferences: ['深度文章', '短视频', '信息图'],
            toneOfVoice: ['专业严谨', '亲切友好', '创新前沿'],
            publishingRhythm: '规律发布',
            engagementDrivers: ['实用价值', '情感共鸣', '社会认同'],
        };
    }
    generateFeatureVectorFromProfile(profileData) {
        const vector = [];
        const scales = { small: 0.2, medium: 0.5, large: 0.8 };
        const scaleValue = scales[profileData.basicInfo.scale] || 0.5;
        vector.push(scaleValue);
        const yearNormalized = (profileData.basicInfo.foundingYear - 2000) / 25;
        vector.push(Math.max(0, Math.min(1, yearNormalized)));
        vector.push(profileData.confidenceScores.basicInfo);
        vector.push(profileData.confidenceScores.brandImage);
        vector.push(profileData.confidenceScores.contentPreference);
        vector.push(profileData.confidenceScores.restrictions);
        vector.push(profileData.confidenceScores.successPatterns);
        const industryHash = (this.hashString(profileData.basicInfo.industry) % 100) / 100;
        vector.push(industryHash);
        while (vector.length < 128) {
            vector.push(Math.random() * 0.1);
        }
        return vector.slice(0, 128);
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }
    createEmptyProfileData() {
        return {
            basicInfo: {
                industry: '',
                scale: 'medium',
                region: '',
                foundingYear: new Date().getFullYear(),
            },
            brandImage: {
                tone: [],
                values: [],
                personality: [],
                visualStyle: [],
            },
            contentPreference: {
                topics: [],
                formats: [],
                frequency: '',
                peakHours: [],
                contentLength: '',
                languageStyle: '',
                keyMessages: [],
            },
            restrictions: {
                forbiddenWords: [],
                sensitiveTopics: [],
                legalConstraints: [],
                culturalTaboos: [],
            },
            successPatterns: {
                highEngagementTopics: [],
                effectiveFormats: [],
                bestTiming: [],
                audienceResponse: [],
            },
            confidenceScores: {
                basicInfo: 0,
                brandImage: 0,
                contentPreference: 0,
                restrictions: 0,
                successPatterns: 0,
            },
            lastUpdated: new Date().toISOString(),
            version: 1,
        };
    }
};
exports.EnterpriseProfileAnalysisService = EnterpriseProfileAnalysisService;
exports.EnterpriseProfileAnalysisService = EnterpriseProfileAnalysisService = EnterpriseProfileAnalysisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(enterprise_profile_repository_1.EnterpriseProfileRepository)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_profile_repository_1.CustomerProfileRepository)),
    __metadata("design:paramtypes", [enterprise_profile_repository_1.EnterpriseProfileRepository,
        customer_profile_repository_1.CustomerProfileRepository,
        knowledge_retrieval_service_1.KnowledgeRetrievalService,
        vector_search_service_1.VectorSearchService,
        config_1.ConfigService])
], EnterpriseProfileAnalysisService);
//# sourceMappingURL=enterprise-profile-analysis.service.js.map