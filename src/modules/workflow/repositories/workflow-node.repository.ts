import { Injectable } from '@nestjs/common';
import { TenantRepository } from '../../../shared/repositories/tenant.repository';
import { WorkflowNode } from '../entities/workflow-node.entity';
import {
  WorkflowStatus,
  ApprovalNodeType,
} from '../../../shared/enums/workflow-status.enum';
import { DataSource } from 'typeorm';

@Injectable()
export class WorkflowNodeRepository extends TenantRepository<WorkflowNode> {
  constructor(private dataSource: DataSource) {
    super(
      WorkflowNode,
      dataSource.createEntityManager(),
      dataSource.createQueryRunner(),
    );
  }

  /**
   * 根据工作流ID查找所有节点
   */
  async findByWorkflowId(workflowId: string): Promise<WorkflowNode[]> {
    return this.find({
      where: { workflowId },
      order: { nodeIndex: 'ASC' },
    });
  }

  /**
   * 根据用户ID查找待处理的节点
   */
  async findPendingByUser(userId: string): Promise<WorkflowNode[]> {
    return this.find({
      where: {
        assignedTo: userId,
        status: WorkflowStatus.EDITOR_REVIEW,
      },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 根据节点类型查找节点
   */
  async findByNodeType(nodeType: ApprovalNodeType): Promise<WorkflowNode[]> {
    return this.find({ where: { nodeType } });
  }

  /**
   * 查找活跃节点（未完成）
   */
  async findActiveNodes(): Promise<WorkflowNode[]> {
    return this.find({
      where: {
        status: WorkflowStatus.EDITOR_REVIEW,
      },
      order: { startedAt: 'ASC' },
    });
  }

  /**
   * 查找超时节点
   */
  async findTimeoutNodes(timeoutHours: number): Promise<WorkflowNode[]> {
    const timeoutDate = new Date(Date.now() - timeoutHours * 60 * 60 * 1000);

    return this.createQueryBuilder('node')
      .where('node.status = :status', { status: WorkflowStatus.EDITOR_REVIEW })
      .andWhere('node.startedAt < :timeoutDate', { timeoutDate })
      .andWhere('node.completedAt IS NULL')
      .getMany();
  }

  /**
   * 查找下一个待处理节点
   */
  async findNextPendingNode(workflowId: string): Promise<WorkflowNode | null> {
    return this.findOne({
      where: {
        workflowId,
        status: WorkflowStatus.EDITOR_REVIEW,
      },
      order: { nodeIndex: 'ASC' },
    });
  }

  /**
   * 查找已完成节点
   */
  async findCompletedNodes(workflowId: string): Promise<WorkflowNode[]> {
    return this.find({
      where: {
        workflowId,
        status: WorkflowStatus.COMPLETED,
      },
      order: { completedAt: 'ASC' },
    });
  }

  /**
   * 更新节点状态
   */
  async updateNodeStatus(
    nodeId: string,
    status: WorkflowStatus,
  ): Promise<void> {
    await this.updateById(nodeId, { status });
  }

  /**
   * 分配节点给用户
   */
  async assignNodeToUser(nodeId: string, userId: string): Promise<void> {
    await this.updateById(nodeId, {
      assignedTo: userId,
      startedAt: new Date(),
    });
  }

  /**
   * 完成节点
   */
  async completeNode(nodeId: string, result: any): Promise<void> {
    await this.updateById(nodeId, {
      status: WorkflowStatus.COMPLETED,
      completedAt: new Date(),
      result,
    });
  }

  /**
   * 查找并行组内的所有节点
   */
  async findParallelGroupNodes(parallelGroup: string): Promise<WorkflowNode[]> {
    return this.find({
      where: { parallelGroup },
      order: { nodeIndex: 'ASC' },
    });
  }

  /**
   * 检查并行组是否全部完成
   */
  async isParallelGroupCompleted(parallelGroup: string): Promise<boolean> {
    const nodes = await this.findParallelGroupNodes(parallelGroup);
    return nodes.every((node) => node.status === WorkflowStatus.COMPLETED);
  }
}
