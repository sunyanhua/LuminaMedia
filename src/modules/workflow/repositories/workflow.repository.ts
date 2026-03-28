import { Injectable } from '@nestjs/common';
import { TenantRepository } from '../../../shared/repositories/tenant.repository';
import { Workflow } from '../entities/workflow.entity';
import { WorkflowStatus } from '../../../shared/enums/workflow-status.enum';
import { DataSource } from 'typeorm';

@Injectable()
export class WorkflowRepository extends TenantRepository<Workflow> {
  constructor(private dataSource: DataSource) {
    super(
      Workflow,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }

  /**
   * 根据状态查找工作流
   */
  async findByStatus(status: WorkflowStatus): Promise<Workflow[]> {
    return this.find({ where: { status }, order: { createdAt: 'DESC' } });
  }

  /**
   * 根据创建者查找工作流
   */
  async findByCreator(userId: string): Promise<Workflow[]> {
    return this.find({
      where: { createdBy: userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查找待处理的工作流（需要当前用户审批）
   */
  async findPendingByUser(userId: string): Promise<Workflow[]> {
    const queryBuilder = this.createQueryBuilder('workflow')
      .leftJoin('workflow.nodes', 'node')
      .where('workflow.status IN (:...statuses)', {
        statuses: [
          WorkflowStatus.EDITOR_REVIEW,
          WorkflowStatus.AI_CHECK,
          WorkflowStatus.MANAGER_REVIEW,
          WorkflowStatus.LEGAL_REVIEW,
        ],
      })
      .andWhere('node.assignedTo = :userId', { userId })
      .andWhere('node.status = :nodeStatus', {
        nodeStatus: WorkflowStatus.EDITOR_REVIEW,
      })
      .orderBy('workflow.priority', 'DESC')
      .addOrderBy('workflow.createdAt', 'ASC');

    return queryBuilder.getMany();
  }

  /**
   * 查找加急工作流
   */
  async findExpedited(): Promise<Workflow[]> {
    return this.find({
      where: { isExpedited: true },
      order: { priority: 'DESC' },
    });
  }

  /**
   * 统计工作流状态
   */
  async getStatusStats(): Promise<Record<WorkflowStatus, number>> {
    const result = await this.createQueryBuilder('workflow')
      .select('workflow.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('workflow.status')
      .getRawMany();

    const stats: Record<WorkflowStatus, number> = {} as Record<
      WorkflowStatus,
      number
    >;
    // 初始化所有状态为0
    Object.values(WorkflowStatus).forEach((status) => {
      stats[status] = 0;
    });

    result.forEach((row) => {
      stats[row.status as WorkflowStatus] = parseInt(row.count, 10);
    });

    return stats;
  }

  /**
   * 查找超时的工作流
   */
  async findTimeoutWorkflows(timeoutHours: number): Promise<Workflow[]> {
    const timeoutDate = new Date(Date.now() - timeoutHours * 60 * 60 * 1000);

    return this.createQueryBuilder('workflow')
      .leftJoin('workflow.nodes', 'node')
      .where('workflow.status IN (:...statuses)', {
        statuses: [
          WorkflowStatus.EDITOR_REVIEW,
          WorkflowStatus.AI_CHECK,
          WorkflowStatus.MANAGER_REVIEW,
          WorkflowStatus.LEGAL_REVIEW,
        ],
      })
      .andWhere('node.startedAt < :timeoutDate', { timeoutDate })
      .andWhere('node.completedAt IS NULL')
      .getMany();
  }

  /**
   * 查找最近完成的工作流
   */
  async findRecentlyCompleted(days: number = 7): Promise<Workflow[]> {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.find({
      where: {
        status: WorkflowStatus.PUBLISHED,
        completedAt: { $gte: sinceDate } as any,
      },
      order: { completedAt: 'DESC' },
    });
  }

  /**
   * 根据内容草稿ID查找工作流
   */
  async findByContentDraft(draftId: string): Promise<Workflow | null> {
    return this.findOne({ where: { contentDraftId: draftId } });
  }
}
