import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EnterpriseProfile } from '../../../entities/enterprise-profile.entity';
import { CustomerProfile } from '../../../entities/customer-profile.entity';
import { EnterpriseProfileRepository } from '../../../shared/repositories/enterprise-profile.repository';
import { CustomerProfileRepository } from '../../../shared/repositories/customer-profile.repository';
import { KnowledgeRetrievalService } from '../../ai-engine/agents/analysis/services/knowledge-retrieval.service';
import { VectorSearchService } from '../../../shared/vector/services/vector-search.service';
import {
  EnterpriseProfileData,
  EnterpriseBasicInfo,
  EnterpriseBrandImage,
  EnterpriseContentPreference,
  EnterpriseRestrictions,
  EnterpriseSuccessPattern,
  TimingAnalysis,
  ResponsePattern,
} from '../../../entities/enterprise-profile.entity';

/**
 * 企业画像分析服务
 * 负责从知识库数据中提取特征，生成和更新企业画像
 */
@Injectable()
export class EnterpriseProfileAnalysisService {
  private readonly logger = new Logger(EnterpriseProfileAnalysisService.name);
  private aiService: any; // TODO: 集成AI服务（Gemini/Qwen）

  constructor(
    @InjectRepository(EnterpriseProfileRepository)
    private enterpriseProfileRepository: EnterpriseProfileRepository,
    @InjectRepository(CustomerProfileRepository)
    private customerProfileRepository: CustomerProfileRepository,
    private knowledgeRetrievalService: KnowledgeRetrievalService,
    private vectorSearchService: VectorSearchService,
    private configService: ConfigService,
  ) {
    // 初始化AI服务
    this.initializeAIService();
  }

  /**
   * 初始化AI服务（Gemini或Qwen）
   */
  private initializeAIService(): void {
    // TODO: 根据配置选择AI服务
    // 暂时使用模拟实现
    this.aiService = {
      analyzeEnterpriseProfile: async (data: any) => {
        // 模拟AI分析
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

  /**
   * 创建企业画像分析任务
   */
  async createAnalysisTask(
    customerProfileId: string,
  ): Promise<EnterpriseProfile> {
    this.logger.log(
      `创建企业画像分析任务: customerProfileId=${customerProfileId}`,
    );

    // 检查客户档案是否存在
    const customerProfile =
      await this.customerProfileRepository.findById(customerProfileId);
    if (!customerProfile) {
      throw new NotFoundException(`客户档案不存在: ${customerProfileId}`);
    }

    // 检查是否已有当前版本的企业画像
    const existingProfile =
      await this.enterpriseProfileRepository.findCurrentByCustomerProfileId(
        customerProfileId,
      );
    if (existingProfile) {
      this.logger.warn(
        `已有当前版本的企业画像，将创建新版本: ${existingProfile.id}`,
      );
    }

    // 创建新的企业画像记录
    const enterpriseProfile = this.enterpriseProfileRepository.create({
      tenantId: customerProfile.tenantId,
      customerProfileId,
      industry: customerProfile.industry,
      scale: 'medium', // 默认值，后续分析更新
      region: '未知',
      profileData: this.createEmptyProfileData(),
      status: 'pending',
      analysisProgress: 0,
      version: existingProfile ? existingProfile.version + 1 : 1,
      isCurrent: false, // 分析完成后设置为true
      previousVersionId: existingProfile?.id || null,
    } as any);

    const savedProfile =
      await this.enterpriseProfileRepository.save(enterpriseProfile);
    // TypeORM的save方法可能返回数组，确保获取单个实体
    const result = Array.isArray(savedProfile) ? savedProfile[0] : savedProfile;
    this.logger.log(`企业画像记录创建成功: ${result.id}`);

    // 异步启动分析任务
    this.startAnalysisTask(result.id).catch((error) => {
      this.logger.error(`分析任务启动失败: ${error.message}`, error.stack);
    });

    return result;
  }

  /**
   * 启动分析任务（异步）
   */
  private async startAnalysisTask(profileId: string): Promise<void> {
    try {
      this.logger.log(`开始分析企业画像: ${profileId}`);

      // 更新状态为分析中
      await this.enterpriseProfileRepository.updateById(profileId, {
        status: 'analyzing',
        analysisProgress: 10,
      });

      // 1. 收集知识库数据
      await this.collectKnowledgeData(profileId);

      // 2. 提取企业特征
      await this.extractEnterpriseFeatures(profileId);

      // 3. 生成画像数据
      await this.generateProfileData(profileId);

      // 4. 计算特征向量
      await this.calculateFeatureVector(profileId);

      // 5. 完成分析
      await this.completeAnalysis(profileId);

      this.logger.log(`企业画像分析完成: ${profileId}`);
    } catch (error) {
      this.logger.error(`企业画像分析失败: ${error.message}`, error.stack);
      await this.enterpriseProfileRepository.updateById(profileId, {
        status: 'failed',
        errorMessage: error.message,
        analysisProgress: 0,
      });
    }
  }

  /**
   * 收集知识库数据
   */
  private async collectKnowledgeData(profileId: string): Promise<void> {
    this.logger.log(`收集知识库数据: ${profileId}`);
    const profile = await this.enterpriseProfileRepository.findById(profileId);
    if (!profile) throw new NotFoundException(`企业画像不存在: ${profileId}`);

    // 更新进度
    await this.enterpriseProfileRepository.updateById(profileId, {
      analysisProgress: 20,
    });

    // TODO: 从知识库检索相关行业知识
    // 使用KnowledgeRetrievalService检索行业相关知识
    const industry = profile.industry;
    const knowledge =
      await this.knowledgeRetrievalService.retrieveRelevantKnowledge(
        `企业画像分析 ${industry} 行业`,
        industry,
        10,
      );

    // 存储检索到的知识（可存入analysisReport）
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

  /**
   * 提取企业特征
   */
  private async extractEnterpriseFeatures(profileId: string): Promise<void> {
    this.logger.log(`提取企业特征: ${profileId}`);
    const profile = await this.enterpriseProfileRepository.findById(profileId);
    if (!profile) throw new NotFoundException(`企业画像不存在: ${profileId}`);

    // 更新进度
    await this.enterpriseProfileRepository.updateById(profileId, {
      analysisProgress: 40,
    });

    // 获取客户档案数据
    const customerProfile = await this.customerProfileRepository.findById(
      profile.customerProfileId,
    );
    if (!customerProfile) {
      throw new NotFoundException(
        `客户档案不存在: ${profile.customerProfileId}`,
      );
    }

    // 从客户档案中提取基础特征
    const basicFeatures = {
      industry: customerProfile.industry,
      customerType: customerProfile.customerType,
      dataSources: customerProfile.dataSources || {},
      profileData: customerProfile.profileData || {},
      behaviorInsights: customerProfile.behaviorInsights || {},
    };

    // TODO: 使用AI服务分析特征
    // 这里暂时使用模拟数据
    const extractedFeatures = {
      basicFeatures,
      industryCharacteristics: this.extractIndustryCharacteristics(
        customerProfile.industry,
      ),
      competitivePosition: this.analyzeCompetitivePosition(basicFeatures),
      contentStrategyPatterns:
        this.identifyContentStrategyPatterns(basicFeatures),
    };

    // 更新分析报告
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

  /**
   * 生成画像数据
   */
  private async generateProfileData(profileId: string): Promise<void> {
    this.logger.log(`生成画像数据: ${profileId}`);
    const profile = await this.enterpriseProfileRepository.findById(profileId);
    if (!profile) throw new NotFoundException(`企业画像不存在: ${profileId}`);

    // 更新进度
    await this.enterpriseProfileRepository.updateById(profileId, {
      analysisProgress: 60,
    });

    // 获取分析报告中的特征数据
    const analysisReport = profile.analysisReport || {};
    const extractedFeatures = analysisReport.extractedFeatures || {};

    // 使用AI服务生成完整画像数据
    const profileData = await this.aiService.analyzeEnterpriseProfile({
      ...extractedFeatures,
      industry: profile.industry,
      customerProfileId: profile.customerProfileId,
    });

    // 更新企业画像数据
    await this.enterpriseProfileRepository.updateById(profileId, {
      profileData,
      analysisProgress: 80,
    });

    this.logger.debug(`画像数据生成完成`);
  }

  /**
   * 计算特征向量
   */
  private async calculateFeatureVector(profileId: string): Promise<void> {
    this.logger.log(`计算特征向量: ${profileId}`);
    const profile = await this.enterpriseProfileRepository.findById(profileId);
    if (!profile) throw new NotFoundException(`企业画像不存在: ${profileId}`);

    // 更新进度
    await this.enterpriseProfileRepository.updateById(profileId, {
      analysisProgress: 90,
    });

    // 从画像数据中提取特征生成向量
    const profileData = profile.profileData;
    const featureVector = this.generateFeatureVectorFromProfile(profileData);

    // 更新特征向量
    await this.enterpriseProfileRepository.updateById(profileId, {
      featureVector,
      featuresExtractedAt: new Date(),
      analysisProgress: 95,
    });

    this.logger.debug(`特征向量计算完成，维度: ${featureVector.length}`);
  }

  /**
   * 完成分析
   */
  private async completeAnalysis(profileId: string): Promise<void> {
    this.logger.log(`完成分析: ${profileId}`);
    const profile = await this.enterpriseProfileRepository.findById(profileId);
    if (!profile) throw new NotFoundException(`企业画像不存在: ${profileId}`);

    // 更新版本状态：将当前版本标记为非当前，将新版本标记为当前
    if (profile.previousVersionId) {
      await this.enterpriseProfileRepository.updateVersionStatus(
        profile.customerProfileId,
        profileId,
      );
    } else {
      // 第一个版本，直接标记为当前
      await this.enterpriseProfileRepository.updateById(profileId, {
        isCurrent: true,
      });
    }

    // 完成分析
    await this.enterpriseProfileRepository.updateById(profileId, {
      status: 'completed',
      analysisProgress: 100,
      isCurrent: true,
      updatedAt: new Date(),
    });

    this.logger.log(`企业画像分析完成: ${profileId}`);
  }

  /**
   * 获取企业画像详情
   */
  async getProfile(profileId: string): Promise<EnterpriseProfile> {
    const profile = await this.enterpriseProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundException(`企业画像不存在: ${profileId}`);
    }
    return profile;
  }

  /**
   * 获取客户档案的企业画像列表
   */
  async getProfilesByCustomer(
    customerProfileId: string,
  ): Promise<EnterpriseProfile[]> {
    return this.enterpriseProfileRepository.findByCustomerProfileId(
      customerProfileId,
    );
  }

  /**
   * 获取当前版本的企业画像
   */
  async getCurrentProfile(
    customerProfileId: string,
  ): Promise<EnterpriseProfile | null> {
    return this.enterpriseProfileRepository.findCurrentByCustomerProfileId(
      customerProfileId,
    );
  }

  /**
   * 手动触发重新分析
   */
  async reanalyzeProfile(profileId: string): Promise<EnterpriseProfile> {
    const profile = await this.getProfile(profileId);
    if (profile.status === 'analyzing') {
      throw new BadRequestException('画像正在分析中，请稍后再试');
    }

    // 创建新版本
    const newProfile = await this.createAnalysisTask(profile.customerProfileId);
    this.logger.log(`重新分析任务创建成功: ${newProfile.id}`);

    return newProfile;
  }

  /**
   * 获取分析状态
   */
  async getAnalysisStatus(profileId: string): Promise<{
    status: string;
    progress: number;
    estimatedTime?: number;
    errorMessage?: string;
  }> {
    const profile = await this.getProfile(profileId);
    return {
      status: profile.status,
      progress: profile.analysisProgress,
      errorMessage: profile.errorMessage,
    };
  }

  /**
   * 批量分析企业画像
   */
  async batchAnalyzeProfiles(
    customerProfileIds: string[],
  ): Promise<EnterpriseProfile[]> {
    const results: EnterpriseProfile[] = [];
    for (const profileId of customerProfileIds) {
      try {
        const profile = await this.createAnalysisTask(profileId);
        results.push(profile);
      } catch (error) {
        this.logger.error(`批量分析失败 ${profileId}: ${error.message}`);
      }
    }
    return results;
  }

  /**
   * 提取行业特征
   */
  private extractIndustryCharacteristics(
    industry: string,
  ): Record<string, any> {
    // 模拟行业特征提取
    const characteristics: Record<string, any> = {
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

    return (
      characteristics[industry] || {
        keyTrends: ['数字化转型', '客户体验优化', '数据驱动'],
        customerBehavior: ['价值导向', '便利性需求', '个性化期待'],
        contentFormats: ['案例分享', '行业洞察', '产品介绍'],
      }
    );
  }

  /**
   * 分析竞争地位
   */
  private analyzeCompetitivePosition(features: any): Record<string, any> {
    // 模拟竞争地位分析
    return {
      marketPosition: '挑战者', // 领导者、挑战者、跟随者、利基者
      competitiveAdvantages: ['技术创新', '客户服务', '品牌知名度'],
      competitiveDisadvantages: ['市场份额', '渠道覆盖', '价格竞争力'],
      strategicRecommendations: ['差异化定位', '细分市场专注', '合作伙伴生态'],
    };
  }

  /**
   * 识别内容策略模式
   */
  private identifyContentStrategyPatterns(features: any): Record<string, any> {
    // 模拟内容策略模式识别
    return {
      contentThemes: ['行业洞察', '产品价值', '客户成功'],
      formatPreferences: ['深度文章', '短视频', '信息图'],
      toneOfVoice: ['专业严谨', '亲切友好', '创新前沿'],
      publishingRhythm: '规律发布',
      engagementDrivers: ['实用价值', '情感共鸣', '社会认同'],
    };
  }

  /**
   * 从画像数据生成特征向量
   */
  private generateFeatureVectorFromProfile(
    profileData: EnterpriseProfileData,
  ): number[] {
    // 简化版特征向量生成
    // 实际应该使用更复杂的特征工程
    const vector: number[] = [];

    // 基础信息编码
    const scales = { small: 0.2, medium: 0.5, large: 0.8 };
    const scaleValue = scales[profileData.basicInfo.scale] || 0.5;
    vector.push(scaleValue);

    // 年份标准化 (2000-2025 -> 0-1)
    const yearNormalized = (profileData.basicInfo.foundingYear - 2000) / 25;
    vector.push(Math.max(0, Math.min(1, yearNormalized)));

    // 置信度分数
    vector.push(profileData.confidenceScores.basicInfo);
    vector.push(profileData.confidenceScores.brandImage);
    vector.push(profileData.confidenceScores.contentPreference);
    vector.push(profileData.confidenceScores.restrictions);
    vector.push(profileData.confidenceScores.successPatterns);

    // 简单行业编码（模拟）
    const industryHash =
      (this.hashString(profileData.basicInfo.industry) % 100) / 100;
    vector.push(industryHash);

    // 填充到固定维度（128维）
    while (vector.length < 128) {
      vector.push(Math.random() * 0.1); // 添加少量噪声
    }

    return vector.slice(0, 128);
  }

  /**
   * 字符串哈希函数
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  /**
   * 创建空的画像数据
   */
  private createEmptyProfileData(): EnterpriseProfileData {
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
}
