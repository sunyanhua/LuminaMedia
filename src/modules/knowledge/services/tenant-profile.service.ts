import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { TenantProfile } from '../../../entities/tenant-profile.entity';
import { KnowledgeDocument } from '../../../entities/knowledge-document.entity';
import { GeminiService } from '../../data-analytics/services/gemini.service';
import {
  PositioningType,
  LanguageStyleType,
  VisualPreferenceType,
  PublishingTimePreference,
  PublishingFrequency,
  TopicTag,
  VisualPreferenceDetail,
  PublishingHabitsDetail,
  ProfileRawData,
} from '../../../entities/tenant-profile.entity';

/**
 * 租户画像生成服务
 * 负责基于知识库文档生成单位画像（五个维度分析）
 */
@Injectable()
export class TenantProfileService {
  private readonly logger = new Logger(TenantProfileService.name);

  constructor(
    @InjectRepository(TenantProfile)
    private tenantProfileRepository: Repository<TenantProfile>,
    @InjectRepository(KnowledgeDocument)
    private knowledgeDocumentRepository: Repository<KnowledgeDocument>,
    private readonly geminiService: GeminiService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 触发租户画像生成
   * @param tenantId 租户ID
   * @param documentIds 可选的知识库文档ID列表，如果为空则使用租户的所有文档
   */
  async generateTenantProfile(
    tenantId: string,
    documentIds?: string[],
  ): Promise<TenantProfile> {
    this.logger.log(`开始生成租户画像: tenantId=${tenantId}`);

    // 检查是否已有当前版本的画像
    const existingProfile = await this.getCurrentProfile(tenantId);
    if (existingProfile && existingProfile.status !== 'draft') {
      this.logger.warn(`租户已有画像，将创建新版本: ${existingProfile.id}`);
    }

    // 获取知识库文档
    const documents = await this.getDocumentsForAnalysis(tenantId, documentIds);
    if (documents.length === 0) {
      throw new BadRequestException('没有可用的知识库文档用于生成画像');
    }

    // 创建新的画像记录
    const tenantProfile = this.tenantProfileRepository.create({
      tenantId,
      status: 'generated',
      version: existingProfile ? existingProfile.version + 1 : 1,
      generatedAt: new Date(),
    });

    const savedProfile = await this.tenantProfileRepository.save(tenantProfile);

    // 异步生成画像数据
    this.generateProfileData(savedProfile.id, documents).catch((error) => {
      this.logger.error(`画像数据生成失败: ${error.message}`, error.stack);
      // 更新状态为失败
      this.tenantProfileRepository.update(savedProfile.id, {
        status: 'draft',
        rawData: {
          error: error.message,
          analyzedDocuments: documents.map(doc => doc.id),
          analysisDate: new Date(),
        } as any,
      });
    });

    return savedProfile;
  }

  /**
   * 获取用于分析的文档
   */
  private async getDocumentsForAnalysis(
    tenantId: string,
    documentIds?: string[],
  ): Promise<KnowledgeDocument[]> {
    if (documentIds && documentIds.length > 0) {
      // 使用指定的文档
      return this.knowledgeDocumentRepository.find({
        where: {
          id: documentIds as any,
          tenantId,
          status: 'active',
        },
        take: 20, // 限制最多20个文档进行分析
      });
    } else {
      // 使用租户的所有活跃文档
      return this.knowledgeDocumentRepository.find({
        where: {
          tenantId,
          status: 'active',
        },
        order: {
          createdAt: 'DESC',
        },
        take: 20, // 限制最多20个文档进行分析
      });
    }
  }

  /**
   * 生成画像数据（异步）
   */
  private async generateProfileData(
    profileId: string,
    documents: KnowledgeDocument[],
  ): Promise<void> {
    try {
      this.logger.log(`开始生成画像数据: profileId=${profileId}`);

      // 提取文档内容
      const documentContents = documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content?.substring(0, 2000) || '', // 限制内容长度
        category: doc.category,
        tags: doc.tags,
      }));

      // 调用AI服务生成画像
      const profileData = await this.generateProfileWithAI(documentContents);

      // 保存画像数据
      await this.tenantProfileRepository.update(profileId, {
        ...profileData,
        status: 'generated',
        generatedAt: new Date(),
        rawData: {
          analyzedDocuments: documents.map(doc => doc.id),
          aiModel: 'gemini-2.5-flash',
          aiPrompt: this.buildAIPrompt(documentContents),
          analysisDate: new Date(),
          confidence: 0.85,
          version: '1.0',
        } as ProfileRawData,
      });

      this.logger.log(`画像数据生成完成: profileId=${profileId}`);
    } catch (error) {
      this.logger.error(`画像数据生成失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 构建AI提示词
   */
  private buildAIPrompt(documentContents: any[]): string {
    const documentsText = documentContents
      .map(
        (doc, index) => `文档 ${index + 1}: ${doc.title}
分类: ${doc.category}
标签: ${doc.tags?.join(', ') || '无'}
内容摘要: ${doc.content.substring(0, 500)}...`,
      )
      .join('\n\n');

    return `你是一位专业的单位画像分析师。请基于以下文档内容，为这个单位生成一个全面的画像，包含五个维度：

${documentsText}

请分析以下五个维度：
1. 形象定位：单位的整体形象和定位（权威型、亲民型、专业型、创新型、服务型或其他）
2. 语言风格：内容表达的语言特点（正式严谨、简洁明快、生动活泼、说服力强、通俗易懂、专业术语等）
3. 视觉偏好：视觉呈现的偏好（极简风格、现代风格、传统风格、多彩风格、渐变风格、扁平风格等）
4. 话题偏好：关注和讨论的话题倾向（按权重排序）
5. 发布习惯：内容发布的习惯（最佳时段、发布频率、内容长度偏好等）

请以JSON格式返回分析结果，结构如下：
{
  "positioning": "authoritative|people_friendly|professional|innovative|service_oriented|other",
  "positioningDescription": "详细的形象定位描述",
  "positioningTags": ["标签1", "标签2", "标签3"],
  "languageStyle": "formal|concise|vivid|persuasive|popular|professional|other",
  "languageStyleDescription": "详细的语言风格描述",
  "languageStyleExamples": ["示例句子1", "示例句子2", "示例句子3"],
  "visualPreference": "minimalist|modern|traditional|colorful|gradient|flat|other",
  "visualPreferenceDetail": {
    "primaryColor": "#主色调十六进制",
    "secondaryColor": "#辅色调十六进制",
    "fontFamily": "偏好字体",
    "imageStyle": "图片风格描述",
    "layoutPreference": "版式偏好描述"
  },
  "topicPreference": [
    {"name": "话题1", "weight": 85, "frequency": 0.8},
    {"name": "话题2", "weight": 75, "frequency": 0.7}
  ],
  "publishingHabits": {
    "bestTime": ["morning", "afternoon", "evening"],
    "frequency": "daily|weekly_1_2|weekly_3_4|weekly_5|monthly_1_2|occasional|irregular",
    "preferredPlatforms": ["微信公众号", "小红书", "网站"],
    "contentLength": "short|medium|long",
    "postFormat": ["图文", "视频", "纯文字"]
  }
}

请确保分析基于提供的文档内容，并给出具体的描述和示例。`;
  }

  /**
   * 调用AI生成画像
   */
  private async generateProfileWithAI(documentContents: any[]): Promise<Partial<TenantProfile>> {
    // 检查Gemini服务是否可用
    const isGeminiAvailable = this.geminiService.isGeminiAvailable();

    if (!isGeminiAvailable) {
      this.logger.warn('Gemini服务不可用，使用模拟数据');
      return this.generateMockProfileData(documentContents);
    }

    try {
      const prompt = this.buildAIPrompt(documentContents);

      // 使用Gemini服务生成内容
      const result = await this.geminiService.generateContent({
        prompt,
        platform: 'analysis', // 自定义平台类型
        tone: 'professional',
        wordCount: 1000,
      });

      if (result.success && result.content) {
        // 解析AI返回的JSON
        const aiResponse = this.parseAIResponse(result.content.content);
        return aiResponse;
      } else {
        this.logger.warn('AI生成失败，使用模拟数据');
        return this.generateMockProfileData(documentContents);
      }
    } catch (error) {
      this.logger.error(`AI生成失败: ${error.message}`, error.stack);
      return this.generateMockProfileData(documentContents);
    }
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(aiText: string): Partial<TenantProfile> {
    try {
      // 清理JSON响应
      let jsonText = aiText.trim();
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

      // 尝试解析JSON
      const parsed = JSON.parse(jsonText);

      // 验证和转换数据
      return {
        positioning: this.parsePositioning(parsed.positioning),
        positioningDescription: parsed.positioningDescription || '',
        positioningTags: parsed.positioningTags || [],
        languageStyle: this.parseLanguageStyle(parsed.languageStyle),
        languageStyleDescription: parsed.languageStyleDescription || '',
        languageStyleExamples: parsed.languageStyleExamples || [],
        visualPreference: this.parseVisualPreference(parsed.visualPreference),
        visualPreferenceDetail: parsed.visualPreferenceDetail || {},
        topicPreference: parsed.topicPreference || [],
        publishingHabits: parsed.publishingHabits || {
          bestTime: [PublishingTimePreference.WORKDAY],
          frequency: PublishingFrequency.WEEKLY_1_2,
          preferredPlatforms: ['微信公众号'],
          contentLength: 'medium',
          postFormat: ['图文'],
        },
      };
    } catch (error) {
      this.logger.error(`解析AI响应失败: ${error.message}`);
      this.logger.debug(`原始响应: ${aiText.substring(0, 500)}`);
      throw new Error('解析AI响应失败');
    }
  }

  /**
   * 生成模拟画像数据（用于测试或AI不可用时）
   */
  private generateMockProfileData(documentContents: any[]): Partial<TenantProfile> {
    // 基于文档内容生成简单的模拟数据
    const categories = documentContents.map(doc => doc.category).filter(Boolean);
    const tags = documentContents.flatMap(doc => doc.tags || []).filter(Boolean);

    // 分析文档特征
    const hasPolicyDocs = documentContents.some(doc => doc.category === 'policy' || doc.tags?.includes('政策'));
    const hasTechnicalDocs = documentContents.some(doc => doc.tags?.includes('技术') || doc.tags?.includes('专业'));
    const hasNewsDocs = documentContents.some(doc => doc.category === 'historical_article' || doc.tags?.includes('新闻'));

    // 根据文档特征确定画像
    let positioning = PositioningType.PROFESSIONAL;
    let languageStyle = LanguageStyleType.FORMAL;
    let visualPreference = VisualPreferenceType.MODERN;

    if (hasPolicyDocs) {
      positioning = PositioningType.AUTHORITATIVE;
      languageStyle = LanguageStyleType.FORMAL;
    }

    if (hasTechnicalDocs) {
      positioning = PositioningType.PROFESSIONAL;
      languageStyle = LanguageStyleType.PROFESSIONAL;
    }

    if (hasNewsDocs && !hasPolicyDocs && !hasTechnicalDocs) {
      positioning = PositioningType.PEOPLE_FRIENDLY;
      languageStyle = LanguageStyleType.CONCISE;
      visualPreference = VisualPreferenceType.COLORFUL;
    }

    // 生成话题偏好
    const topicPreference: TopicTag[] = [];
    if (hasPolicyDocs) topicPreference.push({ name: '政策解读', weight: 90, frequency: 0.9 });
    if (hasTechnicalDocs) topicPreference.push({ name: '技术分享', weight: 85, frequency: 0.8 });
    if (hasNewsDocs) topicPreference.push({ name: '行业动态', weight: 80, frequency: 0.7 });

    // 添加通用话题
    if (topicPreference.length === 0) {
      topicPreference.push(
        { name: '单位新闻', weight: 85, frequency: 0.8 },
        { name: '活动通知', weight: 75, frequency: 0.7 },
        { name: '工作动态', weight: 70, frequency: 0.6 }
      );
    }

    return {
      positioning,
      positioningDescription: `基于${documentContents.length}篇文档分析生成的单位画像。`,
      positioningTags: Array.from(new Set(tags)).slice(0, 5),
      languageStyle,
      languageStyleDescription: '语言风格基于文档内容特征分析确定。',
      languageStyleExamples: [
        '本年度工作总结报告已发布，请各部门查阅。',
        '关于进一步加强管理工作的通知',
        '组织开展专题学习活动',
      ],
      visualPreference,
      visualPreferenceDetail: {
        primaryColor: '#1890ff',
        secondaryColor: '#52c41a',
        fontFamily: 'Microsoft YaHei, sans-serif',
        imageStyle: '正式规范的配图',
        layoutPreference: '简洁清晰的版式',
      },
      topicPreference,
      publishingHabits: {
        bestTime: [PublishingTimePreference.MORNING, PublishingTimePreference.AFTERNOON],
        frequency: PublishingFrequency.WEEKLY_1_2,
        preferredPlatforms: ['微信公众号', '单位网站'],
        contentLength: 'medium',
        postFormat: ['图文', '纯文字'],
      },
    };
  }

  /**
   * 解析形象定位
   */
  private parsePositioning(value: string): PositioningType {
    const validValues = Object.values(PositioningType);
    return validValues.includes(value as PositioningType)
      ? value as PositioningType
      : PositioningType.OTHER;
  }

  /**
   * 解析语言风格
   */
  private parseLanguageStyle(value: string): LanguageStyleType {
    const validValues = Object.values(LanguageStyleType);
    return validValues.includes(value as LanguageStyleType)
      ? value as LanguageStyleType
      : LanguageStyleType.OTHER;
  }

  /**
   * 解析视觉偏好
   */
  private parseVisualPreference(value: string): VisualPreferenceType {
    const validValues = Object.values(VisualPreferenceType);
    return validValues.includes(value as VisualPreferenceType)
      ? value as VisualPreferenceType
      : VisualPreferenceType.OTHER;
  }

  /**
   * 获取租户的当前画像
   */
  async getCurrentProfile(tenantId: string): Promise<TenantProfile | null> {
    return this.tenantProfileRepository.findOne({
      where: {
        tenantId,
        
      },
      order: {
        version: 'DESC',
      },
    });
  }

  /**
   * 获取租户画像详情
   */
  async getProfile(profileId: string): Promise<TenantProfile> {
    const profile = await this.tenantProfileRepository.findOne({
      where: { id: profileId, deletedAt: null },
    });

    if (!profile) {
      throw new NotFoundException(`租户画像不存在: ${profileId}`);
    }

    return profile;
  }

  /**
   * 获取租户的所有画像版本
   */
  async getProfileVersions(tenantId: string): Promise<TenantProfile[]> {
    return this.tenantProfileRepository.find({
      where: {
        tenantId,
        
      },
      order: {
        version: 'DESC',
      },
    });
  }

  /**
   * 更新画像（人工调整）
   */
  async updateProfile(
    profileId: string,
    updates: Partial<TenantProfile>,
    userId: string,
  ): Promise<TenantProfile> {
    const profile = await this.getProfile(profileId);

    // 更新字段
    Object.assign(profile, updates);
    profile.lastEditedAt = new Date();
    profile.lastEditedBy = userId;
    profile.status = 'manually_edited';

    return this.tenantProfileRepository.save(profile);
  }

  /**
   * 删除画像（软删除）
   */
  async deleteProfile(profileId: string): Promise<void> {
    await this.tenantProfileRepository.update(profileId, {
      deletedAt: new Date(),
    });
  }

  /**
   * 获取画像生成状态
   */
  async getGenerationStatus(profileId: string): Promise<{
    status: string;
    generatedAt?: Date;
    lastEditedAt?: Date;
    version: number;
  }> {
    const profile = await this.getProfile(profileId);

    return {
      status: profile.status,
      generatedAt: profile.generatedAt,
      lastEditedAt: profile.lastEditedAt,
      version: profile.version,
    };
  }
}