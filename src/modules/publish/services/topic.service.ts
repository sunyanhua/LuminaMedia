import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic, TopicSource, TopicStatus } from '../../../entities/topic.entity';
import { ReferenceInfo } from '../../../entities/reference-info.entity';
import { GeminiService } from '../../data-analytics/services/gemini.service';

export interface TopicRecommendation {
  title: string;
  description: string;
  reason: string;
}

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(ReferenceInfo)
    private referenceInfoRepository: Repository<ReferenceInfo>,
    private geminiService: GeminiService,
  ) {}

  /**
   * 获取AI选题推荐
   * 基于参考信息和知识库分析生成选题建议
   */
  async getRecommendedTopics(tenantId: string, userId: string): Promise<TopicRecommendation[]> {
    // 获取最近的参考信息
    const recentReferences = await this.referenceInfoRepository.find({
      where: { tenantId },
      order: { publishTime: 'DESC' },
      take: 10,
    });

    // 获取用户已有的选题历史
    const existingTopics = await this.topicRepository.find({
      where: { tenantId, userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // 构建AI提示
    const prompt = this.buildTopicRecommendationPrompt(recentReferences, existingTopics);

    try {
      // 调用AI生成选题建议
      const aiResponse = await this.geminiService.generateContent(prompt);

      // 解析AI响应
      const recommendations = this.parseTopicRecommendations(aiResponse);

      return recommendations;
    } catch (error) {
      // 如果AI调用失败，返回默认推荐
      return this.getDefaultRecommendations();
    }
  }

  /**
   * 构建选题推荐提示
   */
  private buildTopicRecommendationPrompt(
    references: ReferenceInfo[],
    existingTopics: Topic[],
  ): string {
    const referenceTexts = references.map(r => `- ${r.title}: ${r.summary}`).join('\n');
    const existingTopicTitles = existingTopics.map(t => t.title).join(', ');

    return `作为政务新媒体内容策划专家，请基于以下参考信息，生成3-5个适合微信公众号发布的选题建议。

【参考信息】
${referenceTexts || '暂无参考信息'}

【已创建的选题】
${existingTopicTitles || '暂无'}

请生成3-5个选题建议，要求：
1. 选题应与参考信息相关或适合政务公众号发布
2. 避免与已创建选题重复
3. 每个选题包含：标题、简要说明、推荐理由
4. 选题应符合政务宣传特点，正能量、贴近民生

请按以下JSON格式返回：
[
  {
    "title": "选题标题",
    "description": "简要说明选题内容",
    "reason": "推荐理由"
  }
]`;
  }

  /**
   * 解析AI响应为选题推荐
   */
  private parseTopicRecommendations(aiResponse: string): TopicRecommendation[] {
    try {
      // 尝试提取JSON部分
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        if (Array.isArray(recommendations) && recommendations.length > 0) {
          return recommendations.slice(0, 5);
        }
      }
    } catch {
      // JSON解析失败，使用文本解析
    }

    // 返回默认推荐
    return this.getDefaultRecommendations();
  }

  /**
   * 获取默认选题推荐
   */
  private getDefaultRecommendations(): TopicRecommendation[] {
    return [
      {
        title: '优化营商环境新政策解读',
        description: '解读最新出台的营商环境优化措施，帮助企业了解政策红利',
        reason: '政策热点，企业关注度高',
      },
      {
        title: '便民服务新举措上线',
        description: '介绍最新上线的便民服务措施，提升群众办事体验',
        reason: '贴近民生，实用性强',
      },
      {
        title: '绿色低碳生活方式倡导',
        description: '倡导绿色环保理念，分享低碳生活小贴士',
        reason: '符合时代主题，正能量',
      },
    ];
  }

  /**
   * 创建选题
   */
  async createTopic(
    tenantId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      source?: TopicSource;
    },
  ): Promise<Topic> {
    const topic = this.topicRepository.create({
      tenantId,
      userId,
      title: data.title,
      description: data.description,
      source: data.source || TopicSource.MANUAL_CREATION,
      status: TopicStatus.SELECTED,
    });

    return await this.topicRepository.save(topic);
  }

  /**
   * 获取选题列表
   */
  async getTopics(
    tenantId: string,
    userId: string,
    options: {
      status?: TopicStatus;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{ topics: Topic[]; total: number }> {
    const { status, page = 1, limit = 20 } = options;

    const queryBuilder = this.topicRepository
      .createQueryBuilder('topic')
      .where('topic.tenantId = :tenantId', { tenantId })
      .andWhere('topic.userId = :userId', { userId })
      .orderBy('topic.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('topic.status = :status', { status });
    }

    const total = await queryBuilder.getCount();

    const topics = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { topics, total };
  }

  /**
   * 获取选题详情
   */
  async getTopicById(topicId: string, tenantId: string, userId: string): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id: topicId, tenantId, userId },
    });

    if (!topic) {
      throw new NotFoundException('选题不存在');
    }

    return topic;
  }

  /**
   * 更新选题
   */
  async updateTopic(
    topicId: string,
    tenantId: string,
    userId: string,
    data: Partial<Topic>,
  ): Promise<Topic> {
    const topic = await this.getTopicById(topicId, tenantId, userId);

    Object.assign(topic, data);
    return await this.topicRepository.save(topic);
  }

  /**
   * 删除选题
   */
  async deleteTopic(topicId: string, tenantId: string, userId: string): Promise<void> {
    const topic = await this.getTopicById(topicId, tenantId, userId);
    await this.topicRepository.remove(topic);
  }

  /**
   * 刷新AI选题推荐
   * 根据用户反馈生成新的推荐
   */
  async refreshRecommendations(
    tenantId: string,
    userId: string,
    feedback?: string,
  ): Promise<TopicRecommendation[]> {
    // 获取当前推荐
    const currentRecommendations = await this.getRecommendedTopics(tenantId, userId);

    if (!feedback) {
      // 如果没有反馈，随机排序返回
      return currentRecommendations.sort(() => Math.random() - 0.5);
    }

    // 基于反馈生成新的推荐
    const prompt = `基于以下反馈，重新生成选题建议：

用户反馈：${feedback}

请生成3-5个新的选题建议，避开用户不感兴趣的方向。

请按以下JSON格式返回：
[
  {
    "title": "选题标题",
    "description": "简要说明选题内容",
    "reason": "推荐理由"
  }
]`;

    try {
      const aiResponse = await this.geminiService.generateContent(prompt);
      return this.parseTopicRecommendations(aiResponse);
    } catch {
      // 如果失败，返回打乱顺序的推荐
      return currentRecommendations.sort(() => Math.random() - 0.5);
    }
  }
}
