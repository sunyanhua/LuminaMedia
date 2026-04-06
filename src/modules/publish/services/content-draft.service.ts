import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentDraft, ContentStatus } from '../../../entities/content-draft.entity';
import { User } from '../../../entities/user.entity';
import { ReviewService } from '../../review/services/review.service';

@Injectable()
export class ContentDraftService {
  constructor(
    @InjectRepository(ContentDraft)
    private readonly contentDraftRepository: Repository<ContentDraft>,
    private readonly reviewService: ReviewService,
  ) {}

  /**
   * 创建内容草稿
   */
  async create(draftData: Partial<ContentDraft>, userId: string, tenantId: string): Promise<ContentDraft> {
    const draft = this.contentDraftRepository.create({
      ...draftData,
      userId,
      tenantId,
      status: ContentStatus.DRAFT,
    });

    return await this.contentDraftRepository.save(draft);
  }

  /**
   * 更新内容草稿
   */
  async update(id: string, draftData: Partial<ContentDraft>, userId: string, tenantId: string): Promise<ContentDraft> {
    const draft = await this.contentDraftRepository.findOne({
      where: { id, tenantId },
    });

    if (!draft) {
      throw new NotFoundException('草稿不存在或无权访问');
    }

    // 验证用户权限（只能修改自己的草稿，或管理员）
    if (draft.userId !== userId) {
      // 这里可以添加管理员检查
      throw new NotFoundException('无权修改此草稿');
    }

    Object.assign(draft, draftData);
    return await this.contentDraftRepository.save(draft);
  }

  /**
   * 获取草稿详情
   */
  async findOne(id: string, userId: string, tenantId: string): Promise<ContentDraft> {
    const draft = await this.contentDraftRepository.findOne({
      where: { id, tenantId },
    });

    if (!draft) {
      throw new NotFoundException('草稿不存在');
    }

    // 用户只能查看自己的草稿（或管理员）
    if (draft.userId !== userId) {
      throw new NotFoundException('无权查看此草稿');
    }

    return draft;
  }

  /**
   * 获取用户草稿列表
   */
  async findAll(
    userId: string,
    tenantId: string,
    options?: {
      status?: ContentStatus;
      skip?: number;
      take?: number;
    },
  ): Promise<{ drafts: ContentDraft[]; total: number }> {
    // 向后兼容旧版本调用
    return this.findAllWithFilter(userId, tenantId, {
      status: options?.status,
      page: options?.skip ? Math.floor(options.skip / (options.take || 20)) + 1 : 1,
      limit: options?.take || 20,
    });
  }

  /**
   * 获取用户草稿列表（增强筛选版）
   */
  async findAllWithFilter(
    userId: string,
    tenantId: string,
    filter: {
      status?: ContentStatus;
      keyword?: string;
      createdBy?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ): Promise<{ drafts: ContentDraft[]; total: number }> {
    const queryBuilder = this.contentDraftRepository.createQueryBuilder('draft');

    // 租户隔离
    queryBuilder.where('draft.tenantId = :tenantId', { tenantId });

    // 普通用户只能查看自己的草稿，管理员可以查看所有
    // 这里暂时保持原逻辑：普通用户只能查看自己的
    // 如果传入createdBy参数且用户有权限，可以查看指定用户的草稿（未来扩展）
    queryBuilder.andWhere('draft.userId = :userId', { userId });

    if (filter.status) {
      queryBuilder.andWhere('draft.status = :status', { status: filter.status });
    }

    if (filter.keyword) {
      queryBuilder.andWhere(
        '(draft.title LIKE :keyword OR draft.content LIKE :keyword)',
        { keyword: `%${filter.keyword}%` },
      );
    }

    if (filter.createdBy) {
      // 这里可以添加权限检查：只有管理员可以查看其他用户的草稿
      // 暂时直接筛选
      queryBuilder.andWhere('draft.userId = :createdBy', { createdBy: filter.createdBy });
    }

    if (filter.startDate) {
      queryBuilder.andWhere('draft.createdAt >= :startDate', { startDate: filter.startDate });
    }

    if (filter.endDate) {
      queryBuilder.andWhere('draft.createdAt <= :endDate', { endDate: filter.endDate });
    }

    // 分页
    const skip = ((filter.page || 1) - 1) * (filter.limit || 20);
    const take = filter.limit || 20;

    queryBuilder.orderBy('draft.updatedAt', 'DESC');
    queryBuilder.skip(skip).take(take);

    const [drafts, total] = await queryBuilder.getManyAndCount();

    return { drafts, total };
  }

  /**
   * 提交审核
   */
  async submitForReview(id: string, userId: string, tenantId: string): Promise<ContentDraft> {
    const draft = await this.contentDraftRepository.findOne({
      where: { id, tenantId },
    });

    if (!draft) {
      throw new NotFoundException('草稿不存在或无权访问');
    }

    if (draft.userId !== userId) {
      throw new NotFoundException('无权提交此草稿');
    }

    if (draft.status !== ContentStatus.DRAFT) {
      throw new NotFoundException('只有草稿状态的内容可以提交审核');
    }

    // 更新状态为初审
    draft.status = ContentStatus.PENDING_EDIT;
    const savedDraft = await this.contentDraftRepository.save(draft);

    // 创建初始审核记录
    try {
      await this.reviewService.createInitialReviewRecord(savedDraft.id, tenantId, userId);
    } catch (error) {
      // 审核记录创建失败不影响主要流程，记录日志即可
      console.error('创建初始审核记录失败:', error.message);
    }

    return savedDraft;
  }

  /**
   * 撤回修改（审核通过前可撤回）
   */
  async withdraw(id: string, userId: string, tenantId: string): Promise<ContentDraft> {
    const draft = await this.contentDraftRepository.findOne({
      where: { id, tenantId },
    });

    if (!draft) {
      throw new NotFoundException('草稿不存在或无权访问');
    }

    if (draft.userId !== userId) {
      throw new NotFoundException('无权撤回此草稿');
    }

    // 只能撤回处于审核状态的草稿
    const reviewStatuses = [
      ContentStatus.PENDING_EDIT,
      ContentStatus.PENDING_MANAGER,
      ContentStatus.PENDING_LEGAL,
    ];

    if (!reviewStatuses.includes(draft.status)) {
      throw new NotFoundException('只有审核中的内容可以撤回');
    }

    // 撤回后状态变为草稿
    draft.status = ContentStatus.DRAFT;
    return await this.contentDraftRepository.save(draft);
  }

  /**
   * 删除草稿
   */
  async delete(id: string, userId: string, tenantId: string): Promise<void> {
    const draft = await this.contentDraftRepository.findOne({
      where: { id, tenantId },
    });

    if (!draft) {
      throw new NotFoundException('草稿不存在或无权访问');
    }

    if (draft.userId !== userId) {
      throw new NotFoundException('无权删除此草稿');
    }

    await this.contentDraftRepository.remove(draft);
  }

  /**
   * 查询待发文章（状态为APPROVED）
   */
  async findApprovedForPublishing(
    tenantId: string,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: 'publishOrder' | 'createdAt' | 'updatedAt';
      orderDirection?: 'ASC' | 'DESC';
    },
  ): Promise<{ drafts: ContentDraft[]; total: number }> {
    const queryBuilder = this.contentDraftRepository.createQueryBuilder('draft');

    // 租户隔离
    queryBuilder.where('draft.tenantId = :tenantId', { tenantId });
    // 只查询已通过审核的文章
    queryBuilder.andWhere('draft.status = :status', { status: ContentStatus.APPROVED });

    // 排序
    const orderBy = options?.orderBy || 'publishOrder';
    const orderDirection = options?.orderDirection || 'ASC';
    queryBuilder.orderBy(`draft.${orderBy}`, orderDirection);

    // 分页
    if (options?.skip !== undefined) {
      queryBuilder.skip(options.skip);
    }
    if (options?.take !== undefined) {
      queryBuilder.take(options.take);
    }

    const [drafts, total] = await queryBuilder.getManyAndCount();
    return { drafts, total };
  }

  /**
   * 更新发布顺序
   */
  async updatePublishOrder(
    tenantId: string,
    draftIds: string[],
  ): Promise<void> {
    // 使用事务确保一致性
    await this.contentDraftRepository.manager.transaction(async (manager) => {
      for (let i = 0; i < draftIds.length; i++) {
        const draftId = draftIds[i];
        await manager.update(
          ContentDraft,
          { id: draftId, tenantId },
          { publishOrder: i + 1 },
        );
      }
    });
  }

  /**
   * 执行发布（DEMO模拟）
   */
  async publishDraft(
    draftId: string,
    tenantId: string,
    userId: string,
    options?: {
      scheduledAt?: Date;
    },
  ): Promise<ContentDraft> {
    const draft = await this.contentDraftRepository.findOne({
      where: { id: draftId, tenantId },
    });

    if (!draft) {
      throw new NotFoundException('草稿不存在或无权访问');
    }

    if (draft.status !== ContentStatus.APPROVED) {
      throw new NotFoundException('只有已通过审核的文章可以发布');
    }

    // DEMO版模拟发布成功
    // 实际项目中这里会调用微信公众号API
    draft.status = ContentStatus.PUBLISHED;
    draft.publishScheduledAt = options?.scheduledAt || new Date();

    return await this.contentDraftRepository.save(draft);
  }

  /**
   * 批量发布
   */
  async batchPublish(
    draftIds: string[],
    tenantId: string,
    userId: string,
  ): Promise<{ success: string[]; failed: Array<{ id: string; reason: string }> }> {
    const results: { success: string[]; failed: Array<{ id: string; reason: string }> } = { success: [], failed: [] };

    for (const draftId of draftIds) {
      try {
        await this.publishDraft(draftId, tenantId, userId);
        results.success.push(draftId);
      } catch (error) {
        results.failed.push({ id: draftId, reason: error.message });
      }
    }

    return results;
  }

  /**
   * 检查内容合规性（简单敏感词检查）
   */
  async checkContentCompliance(content: string): Promise<{
    sensitiveWords: string[];
    wordCount: number;
    formatValid: boolean;
  }> {
    // 简单敏感词列表（示例）
    const sensitiveWords = ['敏感词1', '敏感词2', '测试'];
    const foundSensitive = sensitiveWords.filter(word =>
      content.toLowerCase().includes(word.toLowerCase()),
    );

    const wordCount = content.split(/\s+/).length;
    const formatValid = content.length > 0 && content.length < 10000;

    return {
      sensitiveWords: foundSensitive,
      wordCount,
      formatValid,
    };
  }
}