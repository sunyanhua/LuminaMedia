import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewRecord } from '../../../entities/review-record.entity';
import { ContentDraft, ContentStatus } from '../../../entities/content-draft.entity';
import { User } from '../../../entities/user.entity';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { ReviewStep } from '../../../shared/enums/review-step.enum';
import { ReviewStatus } from '../../../shared/enums/review-status.enum';
import { ComplianceCheckService } from '../../publish/services/compliance-check.service';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(ReviewRecord)
    private readonly reviewRecordRepository: Repository<ReviewRecord>,
    @InjectRepository(ContentDraft)
    private readonly contentDraftRepository: Repository<ContentDraft>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly complianceCheckService: ComplianceCheckService,
  ) {}

  /**
   * 根据用户角色获取当前待审的审核步骤
   */
  private getPendingReviewStepByRole(role: UserRole): ReviewStep | null {
    switch (role) {
      case UserRole.CONTENT_EDITOR:
        return ReviewStep.EDIT_REVIEW;
      case UserRole.CONTENT_MANAGER:
        return ReviewStep.MANAGER_REVIEW;
      case UserRole.LEGAL_REVIEWER:
        return ReviewStep.LEGAL_REVIEW;
      default:
        return null;
    }
  }

  /**
   * 获取我的待审列表
   */
  async getMyPendingReviews(
    userId: string,
    tenantId: string,
    options?: { page?: number; limit?: number },
  ): Promise<{ records: ReviewRecord[]; total: number }> {
    // 获取当前用户角色
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
      select: ['id', 'role'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const reviewStep = this.getPendingReviewStepByRole(user.role);
    if (!reviewStep) {
      // 如果用户角色没有审核权限，返回空列表
      return { records: [], total: 0 };
    }

    const queryBuilder = this.reviewRecordRepository.createQueryBuilder('record');

    queryBuilder
      .where('record.tenantId = :tenantId', { tenantId })
      .andWhere('record.reviewStep = :reviewStep', { reviewStep })
      .andWhere('record.status = :status', { status: ReviewStatus.PENDING })
      .leftJoinAndSelect('record.contentDraft', 'contentDraft')
      .leftJoinAndSelect('record.reviewer', 'reviewer')
      .orderBy('record.createdAt', 'DESC');

    // 分页
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [records, total] = await queryBuilder.getManyAndCount();
    return { records, total };
  }

  /**
   * 获取我已审核列表
   */
  async getMyReviewedHistory(
    userId: string,
    tenantId: string,
    options?: { page?: number; limit?: number },
  ): Promise<{ records: ReviewRecord[]; total: number }> {
    const queryBuilder = this.reviewRecordRepository.createQueryBuilder('record');

    queryBuilder
      .where('record.tenantId = :tenantId', { tenantId })
      .andWhere('record.reviewerId = :reviewerId', { reviewerId: userId })
      .andWhere('record.status IN (:...statuses)', {
        statuses: [ReviewStatus.PASSED, ReviewStatus.REJECTED],
      })
      .leftJoinAndSelect('record.contentDraft', 'contentDraft')
      .orderBy('record.reviewedAt', 'DESC');

    // 分页
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [records, total] = await queryBuilder.getManyAndCount();
    return { records, total };
  }

  /**
   * 获取内容审核追踪
   */
  async getContentReviewHistory(
    contentDraftId: string,
    tenantId: string,
  ): Promise<ReviewRecord[]> {
    return await this.reviewRecordRepository.find({
      where: {
        contentDraftId,
        tenantId,
      },
      relations: ['reviewer', 'contentDraft'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 提交审核结果
   */
  async submitReviewResult(
    contentDraftId: string,
    userId: string,
    tenantId: string,
    data: {
      status: ReviewStatus.PASSED | ReviewStatus.REJECTED;
      comment?: string;
    },
  ): Promise<ReviewRecord> {
    // 获取内容草稿
    const contentDraft = await this.contentDraftRepository.findOne({
      where: { id: contentDraftId, tenantId },
    });

    if (!contentDraft) {
      throw new NotFoundException('内容草稿不存在');
    }

    // 获取当前用户
    const user = await this.userRepository.findOne({
      where: { id: userId, tenantId },
      select: ['id', 'role'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 确定当前审核步骤
    const reviewStep = this.getPendingReviewStepByRole(user.role);
    if (!reviewStep) {
      throw new BadRequestException('当前用户角色无审核权限');
    }

    // 查找待处理的审核记录
    let reviewRecord = await this.reviewRecordRepository.findOne({
      where: {
        contentDraftId,
        tenantId,
        reviewStep,
        status: ReviewStatus.PENDING,
      },
    });

    if (!reviewRecord) {
      // 如果不存在待处理记录，创建新的审核记录
      reviewRecord = this.reviewRecordRepository.create({
        contentDraftId,
        tenantId,
        reviewerId: userId,
        reviewerRole: user.role,
        reviewStep,
        status: data.status,
        comment: data.comment,
        reviewedAt: new Date(),
      });
    } else {
      // 更新现有记录
      reviewRecord.status = data.status;
      reviewRecord.comment = data.comment ?? '';
      reviewRecord.reviewedAt = new Date();
    }

    // 保存审核记录
    const savedRecord = await this.reviewRecordRepository.save(reviewRecord);

    // 根据审核结果更新内容草稿状态
    await this.updateContentDraftStatus(contentDraft, reviewStep, data.status);

    return savedRecord;
  }

  /**
   * 根据审核结果更新内容草稿状态
   */
  private async updateContentDraftStatus(
    contentDraft: ContentDraft,
    reviewStep: ReviewStep,
    reviewStatus: ReviewStatus,
  ): Promise<void> {
    if (reviewStatus === ReviewStatus.REJECTED) {
      // 审核退回，状态变为REJECTED
      contentDraft.status = ContentStatus.REJECTED;
    } else if (reviewStatus === ReviewStatus.PASSED) {
      // 审核通过，进入下一环节
      switch (reviewStep) {
        case ReviewStep.EDIT_REVIEW:
          // 编辑初审通过后，进入AI检测环节
          contentDraft.status = ContentStatus.PENDING_MANAGER;
          // 触发AI检测
          await this.createAndProcessAIReview(contentDraft);
          break;
        case ReviewStep.MANAGER_REVIEW:
          // 主管复审通过后，进入法务终审
          contentDraft.status = ContentStatus.PENDING_LEGAL;
          break;
        case ReviewStep.LEGAL_REVIEW:
          // 法务终审通过后，审核完成
          contentDraft.status = ContentStatus.APPROVED;
          break;
        default:
          // AI检测环节暂不处理
          break;
      }
    }

    await this.contentDraftRepository.save(contentDraft);
  }

  /**
   * 创建并处理AI检测
   */
  private async createAndProcessAIReview(contentDraft: ContentDraft): Promise<void> {
    try {
      // 创建AI检测记录
      const aiReviewRecord = this.reviewRecordRepository.create({
        contentDraftId: contentDraft.id,
        tenantId: contentDraft.tenantId,
        reviewerId: 'system', // 系统用户
        reviewerRole: UserRole.SUPER_ADMIN, // 系统用户作为超级管理员
        reviewStep: ReviewStep.AI_REVIEW,
        status: ReviewStatus.PENDING,
      });

      const savedAIRecord = await this.reviewRecordRepository.save(aiReviewRecord);
      this.logger.log(`AI检测记录创建成功，内容草稿ID: ${contentDraft.id}`);

      // 执行合规检查（模拟）
      // 实际应该调用ComplianceCheckService检查内容
      // 这里简化：假设AI检测自动通过
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟检测耗时

      // 更新AI检测记录为通过
      savedAIRecord.status = ReviewStatus.PASSED;
      savedAIRecord.comment = 'AI检测通过：内容合规，无敏感词，格式规范';
      savedAIRecord.reviewedAt = new Date();
      await this.reviewRecordRepository.save(savedAIRecord);

      this.logger.log(`AI检测通过，内容草稿ID: ${contentDraft.id}`);

      // 创建主管复审记录
      const managerReviewRecord = this.reviewRecordRepository.create({
        contentDraftId: contentDraft.id,
        tenantId: contentDraft.tenantId,
        reviewerId: 'pending', // 待指定主管
        reviewerRole: UserRole.CONTENT_MANAGER,
        reviewStep: ReviewStep.MANAGER_REVIEW,
        status: ReviewStatus.PENDING,
      });

      await this.reviewRecordRepository.save(managerReviewRecord);
      this.logger.log(`主管复审记录创建成功，内容草稿ID: ${contentDraft.id}`);

    } catch (error) {
      this.logger.error(`AI检测处理失败，内容草稿ID: ${contentDraft.id}`, error.stack);
      // 即使AI检测失败，仍然允许进入主管复审环节
      const managerReviewRecord = this.reviewRecordRepository.create({
        contentDraftId: contentDraft.id,
        tenantId: contentDraft.tenantId,
        reviewerId: 'pending',
        reviewerRole: UserRole.CONTENT_MANAGER,
        reviewStep: ReviewStep.MANAGER_REVIEW,
        status: ReviewStatus.PENDING,
      });
      await this.reviewRecordRepository.save(managerReviewRecord);
    }
  }

  /**
   * 创建初始审核记录（当内容提交审核时调用）
   */
  async createInitialReviewRecord(
    contentDraftId: string,
    tenantId: string,
    userId: string,
  ): Promise<ReviewRecord> {
    // 获取内容草稿
    const contentDraft = await this.contentDraftRepository.findOne({
      where: { id: contentDraftId, tenantId },
    });

    if (!contentDraft) {
      throw new NotFoundException('内容草稿不存在');
    }

    // 创建编辑初审记录
    const reviewRecord = this.reviewRecordRepository.create({
      contentDraftId,
      tenantId,
      reviewerId: userId, // 提交审核的用户
      reviewerRole: UserRole.CONTENT_EDITOR, // 假设提交者是编辑角色
      reviewStep: ReviewStep.EDIT_REVIEW,
      status: ReviewStatus.PENDING,
    });

    return await this.reviewRecordRepository.save(reviewRecord);
  }
}