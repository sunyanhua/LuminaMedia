import { Injectable } from '@nestjs/common';
import { TenantRepository } from '../../../shared/repositories/tenant.repository';
import { ApprovalRecord } from '../entities/approval-record.entity';
import { ApprovalAction } from '../../../shared/enums/workflow-status.enum';
import { DataSource } from 'typeorm';

@Injectable()
export class ApprovalRecordRepository extends TenantRepository<ApprovalRecord> {
  constructor(private dataSource: DataSource) {
    super(ApprovalRecord, dataSource.createEntityManager(), dataSource.createQueryRunner());
  }

  /**
   * 根据工作流ID查找审批记录
   */
  async findByWorkflowId(workflowId: string): Promise<ApprovalRecord[]> {
    return this.find({
      where: { workflowId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据节点ID查找审批记录
   */
  async findByNodeId(nodeId: string): Promise<ApprovalRecord[]> {
    return this.find({
      where: { nodeId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据审批人ID查找审批记录
   */
  async findByActorId(actorId: string): Promise<ApprovalRecord[]> {
    return this.find({
      where: { actorId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据审批动作查找记录
   */
  async findByAction(action: ApprovalAction): Promise<ApprovalRecord[]> {
    return this.find({ where: { action } });
  }

  /**
   * 查找最近的审批记录
   */
  async findRecent(limit: number = 50): Promise<ApprovalRecord[]> {
    return this.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 统计审批动作
   */
  async getActionStats(): Promise<Record<ApprovalAction, number>> {
    const result = await this.createQueryBuilder('record')
      .select('record.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('record.action')
      .getRawMany();

    const stats: Record<ApprovalAction, number> = {} as Record<ApprovalAction, number>;
    // 初始化所有动作为0
    Object.values(ApprovalAction).forEach(action => {
      stats[action] = 0;
    });

    result.forEach(row => {
      stats[row.action as ApprovalAction] = parseInt(row.count, 10);
    });

    return stats;
  }

  /**
   * 查找时间范围内的审批记录
   */
  async findByTimeRange(startDate: Date, endDate: Date): Promise<ApprovalRecord[]> {
    return this.find({
      where: {
        createdAt: { $gte: startDate, $lte: endDate } as any,
      },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 获取审批人的审批统计
   */
  async getActorStats(actorId: string): Promise<{
    total: number;
    byAction: Record<ApprovalAction, number>;
    averageProcessingTime: number;
  }> {
    const records = await this.findByActorId(actorId);
    const byAction: Record<ApprovalAction, number> = {} as Record<ApprovalAction, number>;

    Object.values(ApprovalAction).forEach(action => {
      byAction[action] = 0;
    });

    let totalProcessingTime = 0;
    let countWithTime = 0;

    records.forEach(record => {
      byAction[record.action] = (byAction[record.action] || 0) + 1;

      // 如果有元数据中的处理时间
      if (record.metadata?.processingTimeMs) {
        totalProcessingTime += record.metadata.processingTimeMs;
        countWithTime++;
      }
    });

    return {
      total: records.length,
      byAction,
      averageProcessingTime: countWithTime > 0 ? totalProcessingTime / countWithTime : 0,
    };
  }

  /**
   * 创建审批记录
   */
  async createRecord(data: {
    workflowId: string;
    nodeId?: string;
    action: ApprovalAction;
    actorId: string;
    comments?: string;
    attachments?: string[];
    transferTo?: string;
    isExpedited?: boolean;
    previousStatus?: string;
    newStatus?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<ApprovalRecord> {
    const record = this.create({
      ...data,
      metadata: data.metadata || {},
    });

    return this.save(record);
  }
}