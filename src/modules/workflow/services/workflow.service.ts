import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkflowRepository } from '../repositories/workflow.repository';
import { WorkflowNodeRepository } from '../repositories/workflow-node.repository';
import { ApprovalRecordRepository } from '../repositories/approval-record.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { Workflow } from '../entities/workflow.entity';
import { WorkflowNode } from '../entities/workflow-node.entity';
import { ApprovalRecord } from '../entities/approval-record.entity';
import { Notification } from '../entities/notification.entity';
import {
  WorkflowStatus,
  ApprovalAction,
  ApprovalNodeType,
  NotificationType,
} from '../../../shared/enums/workflow-status.enum';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  ApprovalRequestDto,
  WorkflowFilter,
  WorkflowStats,
  AssignNodeRequest,
  TransferWorkflowRequest,
  WorkflowEventType,
} from '../interfaces/workflow.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../../entities/user.entity';
import { ContentDraft } from '../../../entities/content-draft.entity';
import { DataSource, Repository } from 'typeorm';
import { TenantContextService } from '../../../shared/services/tenant-context.service';

/**
 * 三审三校工作流服务
 * 负责工作流状态机、审批流程管理和通知系统
 */
@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectRepository(WorkflowRepository)
    private readonly workflowRepository: WorkflowRepository,
    @InjectRepository(WorkflowNodeRepository)
    private readonly workflowNodeRepository: WorkflowNodeRepository,
    @InjectRepository(ApprovalRecordRepository)
    private readonly approvalRecordRepository: ApprovalRecordRepository,
    @InjectRepository(NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ContentDraft)
    private readonly contentDraftRepository: Repository<ContentDraft>,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建工作流
   */
  async createWorkflow(createDto: CreateWorkflowDto, creatorId: string): Promise<Workflow> {
    // 验证内容草稿是否存在
    const contentDraft = await this.contentDraftRepository.findOne({
      where: { id: createDto.contentDraftId },
    });

    if (!contentDraft) {
      throw new NotFoundException(`Content draft not found: ${createDto.contentDraftId}`);
    }

    // 检查是否已存在工作流
    const existingWorkflow = await this.workflowRepository.findByContentDraft(createDto.contentDraftId);
    if (existingWorkflow) {
      throw new BadRequestException(`Workflow already exists for content draft: ${createDto.contentDraftId}`);
    }

    // 创建默认配置
    const defaultConfig = {
      nodes: this.createDefaultNodes(),
      rules: {
        allowExpedite: true,
        allowWithdraw: true,
        allowReassign: true,
        maxRevisionCount: 3,
        autoEscalateHours: 24,
      },
    };

    const config = {
      ...defaultConfig,
      ...createDto.config,
      nodes: createDto.config?.nodes || defaultConfig.nodes,
    };

    // 创建并保存工作流
    const workflow = this.workflowRepository.create({
      tenantId: TenantContextService.getCurrentTenantIdStatic(),
      contentDraftId: createDto.contentDraftId,
      createdBy: creatorId,
      title: createDto.title || `Workflow for ${contentDraft.title}`,
      description: createDto.description,
      priority: createDto.priority || 3,
      isExpedited: createDto.isExpedited || false,
      expectedCompletionAt: createDto.expectedCompletionAt,
      status: WorkflowStatus.DRAFT,
      config,
      totalNodesCount: config.nodes.length,
      metadata: {
        revisionCount: 0,
        totalProcessingTimeMs: 0,
        averageNodeTimeMs: 0,
        escalationCount: 0,
      },
    });

    const savedWorkflow = await this.workflowRepository.save(workflow);

    // 创建工作流节点
    await this.createWorkflowNodes(savedWorkflow, config.nodes);

    // 发送事件
    this.eventEmitter.emit(WorkflowEventType.WORKFLOW_CREATED, {
      workflowId: savedWorkflow.id,
      userId: creatorId,
      timestamp: new Date(),
    });

    // 发送通知给创建者
    await this.createNotification({
      type: NotificationType.TASK_ASSIGNED,
      recipientId: creatorId,
      title: '工作流创建成功',
      content: `您已成功创建工作流 "${savedWorkflow.title}"，请等待审批流程开始。`,
      workflowId: savedWorkflow.id,
      priority: 3,
    });

    this.logger.log(`Workflow created: ${savedWorkflow.id} for draft: ${createDto.contentDraftId}`);
    return savedWorkflow;
  }

  /**
   * 提交工作流审批（从草稿状态启动审批流程）
   */
  async submitWorkflow(workflowId: string, userId: string): Promise<Workflow> {
    const workflow = await this.getWorkflowById(workflowId);

    if (workflow.status !== WorkflowStatus.DRAFT) {
      throw new BadRequestException(`Workflow cannot be submitted. Current status: ${workflow.status}`);
    }

    if (workflow.createdBy !== userId) {
      throw new ForbiddenException('Only the creator can submit the workflow');
    }

    // 更新工作流状态为编辑初审
    workflow.status = WorkflowStatus.EDITOR_REVIEW;
    workflow.updatedAt = new Date();

    // 激活第一个节点
    const firstNode = await this.workflowNodeRepository.findOne({
      where: { workflowId, nodeIndex: 0 },
    });

    if (firstNode) {
      firstNode.status = WorkflowStatus.EDITOR_REVIEW;
      firstNode.startedAt = new Date();
      await this.workflowNodeRepository.save(firstNode);

      // 发送通知给审批人
      if (firstNode.assignedTo) {
        await this.createNotification({
          type: NotificationType.PENDING_APPROVAL,
          recipientId: firstNode.assignedTo,
          title: '新的审批任务',
          content: `您有一个新的内容需要审批：${workflow.title}`,
          workflowId: workflow.id,
          nodeId: firstNode.id,
          priority: workflow.isExpedited ? 5 : 3,
        });
      }
    }

    const savedWorkflow = await this.workflowRepository.save(workflow);

    // 发送事件
    this.eventEmitter.emit(WorkflowEventType.WORKFLOW_STATUS_CHANGED, {
      workflowId,
      userId,
      previousStatus: WorkflowStatus.DRAFT,
      newStatus: WorkflowStatus.EDITOR_REVIEW,
      timestamp: new Date(),
    });

    return savedWorkflow;
  }

  /**
   * 处理审批请求
   */
  async processApproval(
    workflowId: string,
    nodeId: string,
    approvalDto: ApprovalRequestDto,
    userId: string,
  ): Promise<{ workflow: Workflow; node: WorkflowNode; record: ApprovalRecord }> {
    const workflow = await this.getWorkflowById(workflowId);
    const node = await this.workflowNodeRepository.findById(nodeId);

    if (!node || node.workflowId !== workflowId) {
      throw new NotFoundException(`Node not found: ${nodeId}`);
    }

    // 检查用户是否有审批权限
    if (node.assignedTo !== userId) {
      throw new ForbiddenException('User does not have permission to approve this node');
    }

    if (node.status !== WorkflowStatus.EDITOR_REVIEW) {
      throw new BadRequestException(`Node cannot be approved. Current status: ${node.status}`);
    }

    // 创建审批记录
    const approvalRecord = await this.approvalRecordRepository.createRecord({
      workflowId,
      nodeId,
      action: approvalDto.action,
      actorId: userId,
      comments: approvalDto.comments,
      attachments: approvalDto.attachments,
      transferTo: approvalDto.transferTo,
      isExpedited: approvalDto.isExpedited,
      previousStatus: node.status,
      newStatus: WorkflowStatus.COMPLETED,
      metadata: {
        processingTimeMs: node.startedAt ? Date.now() - node.startedAt.getTime() : 0,
        autoApproved: false,
      },
    });

    // 更新节点状态
    node.status = WorkflowStatus.COMPLETED;
    node.completedAt = new Date();
    node.result = {
      action: approvalDto.action,
      comments: approvalDto.comments || '',
      attachments: approvalDto.attachments || [],
      timestamp: new Date(),
    };
    await this.workflowNodeRepository.save(node);

    // 根据审批动作处理工作流状态
    let workflowStatusChanged = false;
    let newWorkflowStatus = workflow.status;

    switch (approvalDto.action) {
      case ApprovalAction.APPROVE:
        // 检查是否为最后一个节点
        const isLastNode = await this.isLastNode(workflow, node);
        if (isLastNode) {
          newWorkflowStatus = WorkflowStatus.APPROVED;
          workflowStatusChanged = true;
          workflow.completedAt = new Date();
        } else {
          // 激活下一个节点
          await this.activateNextNode(workflow, node);
        }
        break;

      case ApprovalAction.REJECT:
        newWorkflowStatus = WorkflowStatus.REJECTED;
        workflowStatusChanged = true;
        workflow.completedAt = new Date();
        break;

      case ApprovalAction.RETURN_FOR_REVISION:
        newWorkflowStatus = WorkflowStatus.NEEDS_REVISION;
        workflowStatusChanged = true;
        break;

      case ApprovalAction.TRANSFER:
        if (!approvalDto.transferTo) {
          throw new BadRequestException('Transfer target user is required');
        }
        // 转交节点给其他用户
        node.assignedTo = approvalDto.transferTo;
        node.startedAt = new Date();
        await this.workflowNodeRepository.save(node);

        // 通知新审批人
        await this.createNotification({
          type: NotificationType.TASK_ASSIGNED,
          recipientId: approvalDto.transferTo,
          title: '审批任务转交',
          content: `您收到一个转交的审批任务：${workflow.title}`,
          workflowId: workflow.id,
          nodeId: node.id,
          priority: workflow.isExpedited ? 5 : 3,
        });
        break;

      case ApprovalAction.EXPEDITE:
        workflow.isExpedited = true;
        workflow.priority = Math.max(workflow.priority, 5);
        break;
    }

    // 更新工作流状态
    if (workflowStatusChanged) {
      const previousStatus = workflow.status;
      workflow.status = newWorkflowStatus;
      workflow.updatedAt = new Date();

      // 发送状态变更通知
      await this.createNotification({
        type: NotificationType.WORKFLOW_STATUS_CHANGED,
        recipientId: workflow.createdBy,
        title: '工作流状态变更',
        content: `工作流 "${workflow.title}" 状态已从 ${previousStatus} 变更为 ${newWorkflowStatus}`,
        workflowId: workflow.id,
        priority: 3,
      });

      // 发送事件
      this.eventEmitter.emit(WorkflowEventType.WORKFLOW_STATUS_CHANGED, {
        workflowId,
        userId,
        previousStatus,
        newStatus: newWorkflowStatus,
        action: approvalDto.action,
        timestamp: new Date(),
      });
    }

    const savedWorkflow = await this.workflowRepository.save(workflow);

    // 发送审批完成通知
    await this.createNotification({
      type: NotificationType.APPROVAL_COMPLETED,
      recipientId: workflow.createdBy,
      title: '审批完成',
      content: `节点 "${node.name}" 审批已完成，操作：${approvalDto.action}`,
      workflowId: workflow.id,
      nodeId: node.id,
      priority: 3,
    });

    this.logger.log(`Approval processed: ${approvalDto.action} for workflow ${workflowId}, node ${nodeId}`);

    return {
      workflow: savedWorkflow,
      node,
      record: approvalRecord,
    };
  }

  /**
   * 获取工作流详情
   */
  async getWorkflowById(workflowId: string): Promise<Workflow> {
    const workflow = await this.workflowRepository.findById(workflowId);
    if (!workflow) {
      throw new NotFoundException(`Workflow not found: ${workflowId}`);
    }
    return workflow;
  }

  /**
   * 获取工作流节点
   */
  async getWorkflowNodes(workflowId: string): Promise<WorkflowNode[]> {
    return this.workflowNodeRepository.findByWorkflowId(workflowId);
  }

  /**
   * 获取审批记录
   */
  async getApprovalRecords(workflowId: string): Promise<ApprovalRecord[]> {
    return this.approvalRecordRepository.findByWorkflowId(workflowId);
  }

  /**
   * 查询工作流（带过滤）
   */
  async findWorkflows(filter: WorkflowFilter, page = 1, limit = 20): Promise<{ data: Workflow[]; total: number }> {
    const queryBuilder = this.workflowRepository.createQueryBuilder('workflow');

    // 应用过滤器
    if (filter.status) {
      if (Array.isArray(filter.status)) {
        queryBuilder.andWhere('workflow.status IN (:...statuses)', { statuses: filter.status });
      } else {
        queryBuilder.andWhere('workflow.status = :status', { status: filter.status });
      }
    }

    if (filter.createdBy) {
      queryBuilder.andWhere('workflow.createdBy = :createdBy', { createdBy: filter.createdBy });
    }

    if (filter.isExpedited !== undefined) {
      queryBuilder.andWhere('workflow.isExpedited = :isExpedited', { isExpedited: filter.isExpedited });
    }

    if (filter.priority) {
      queryBuilder.andWhere('workflow.priority >= :priority', { priority: filter.priority });
    }

    if (filter.startDate) {
      queryBuilder.andWhere('workflow.createdAt >= :startDate', { startDate: filter.startDate });
    }

    if (filter.endDate) {
      queryBuilder.andWhere('workflow.createdAt <= :endDate', { endDate: filter.endDate });
    }

    if (filter.contentDraftId) {
      queryBuilder.andWhere('workflow.contentDraftId = :contentDraftId', { contentDraftId: filter.contentDraftId });
    }

    if (filter.search) {
      queryBuilder.andWhere('(workflow.title LIKE :search OR workflow.description LIKE :search)', {
        search: `%${filter.search}%`,
      });
    }

    // 排序和分页
    queryBuilder
      .orderBy('workflow.priority', 'DESC')
      .addOrderBy('workflow.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  /**
   * 获取工作流统计
   */
  async getWorkflowStats(): Promise<WorkflowStats> {
    const statusStats = await this.workflowRepository.getStatusStats();

    const total = Object.values(statusStats).reduce((sum, count) => sum + count, 0);
    const pending = [
      WorkflowStatus.EDITOR_REVIEW,
      WorkflowStatus.AI_CHECK,
      WorkflowStatus.MANAGER_REVIEW,
      WorkflowStatus.LEGAL_REVIEW,
    ].reduce((sum, status) => sum + (statusStats[status] || 0), 0);

    const completed = [
      WorkflowStatus.APPROVED,
      WorkflowStatus.PUBLISHED,
      WorkflowStatus.REJECTED,
      WorkflowStatus.CANCELLED,
    ].reduce((sum, status) => sum + (statusStats[status] || 0), 0);

    // 计算加急工作流数量
    const expeditedCount = await this.workflowRepository
      .createQueryBuilder()
      .where('is_expedited = :expedited', { expedited: true })
      .getCount();

    // 这里可以添加平均处理时间的计算逻辑
    const averageProcessingTime = 0;

    return {
      byStatus: statusStats,
      total,
      pending,
      completed,
      averageProcessingTime,
      expeditedCount,
    };
  }

  /**
   * 撤回工作流
   */
  async withdrawWorkflow(workflowId: string, userId: string): Promise<Workflow> {
    const workflow = await this.getWorkflowById(workflowId);

    if (workflow.createdBy !== userId) {
      throw new ForbiddenException('Only the creator can withdraw the workflow');
    }

    const withdrawableStatuses = [
      WorkflowStatus.DRAFT,
      WorkflowStatus.EDITOR_REVIEW,
      WorkflowStatus.NEEDS_REVISION,
    ];

    if (!withdrawableStatuses.includes(workflow.status)) {
      throw new BadRequestException(`Workflow cannot be withdrawn in status: ${workflow.status}`);
    }

    const previousStatus = workflow.status;
    workflow.status = WorkflowStatus.WITHDRAWN;
    workflow.completedAt = new Date();
    workflow.updatedAt = new Date();

    const savedWorkflow = await this.workflowRepository.save(workflow);

    // 发送事件和通知
    this.eventEmitter.emit(WorkflowEventType.WORKFLOW_STATUS_CHANGED, {
      workflowId,
      userId,
      previousStatus,
      newStatus: WorkflowStatus.WITHDRAWN,
      timestamp: new Date(),
    });

    return savedWorkflow;
  }

  /**
   * 分配节点给用户
   */
  async assignNode(assignRequest: AssignNodeRequest, userId: string): Promise<WorkflowNode> {
    const node = await this.workflowNodeRepository.findById(assignRequest.nodeId);
    if (!node) {
      throw new NotFoundException(`Node not found: ${assignRequest.nodeId}`);
    }

    const workflow = await this.getWorkflowById(node.workflowId);

    // 检查权限（这里简化处理，实际应该检查用户是否有分配权限）
    // 通常只有管理员或节点负责人可以重新分配

    const previousAssignee = node.assignedTo;
    node.assignedTo = assignRequest.assigneeId;
    node.startedAt = new Date();
    node.status = WorkflowStatus.EDITOR_REVIEW;

    const savedNode = await this.workflowNodeRepository.save(node);

    // 通知新审批人
    await this.createNotification({
      type: NotificationType.TASK_ASSIGNED,
      recipientId: assignRequest.assigneeId,
      title: '审批任务分配',
      content: `您被分配了一个审批任务：${workflow.title}`,
      workflowId: workflow.id,
      nodeId: node.id,
      priority: workflow.isExpedited ? 5 : 3,
    });

    // 如果之前有分配人，通知他们任务已被转走
    if (previousAssignee && previousAssignee !== assignRequest.assigneeId) {
      await this.createNotification({
        type: NotificationType.WORKFLOW_STATUS_CHANGED,
        recipientId: previousAssignee,
        title: '审批任务重新分配',
        content: `您的审批任务 "${workflow.title}" 已被重新分配给其他用户`,
        workflowId: workflow.id,
        nodeId: node.id,
        priority: 3,
      });
    }

    this.eventEmitter.emit(WorkflowEventType.NODE_ASSIGNED, {
      workflowId: workflow.id,
      nodeId: node.id,
      userId,
      previousAssignee,
      newAssignee: assignRequest.assigneeId,
      timestamp: new Date(),
    });

    return savedNode;
  }

  // ========== 私有方法 ==========

  /**
   * 创建默认审批节点
   */
  private createDefaultNodes(): Array<{
    type: ApprovalNodeType;
    name?: string;
    assignee?: string;
    role?: string;
    timeoutHours?: number;
    isMandatory?: boolean;
    parallelGroup?: string;
  }> {
    return [
      {
        type: ApprovalNodeType.EDITOR,
        name: '编辑初审',
        role: 'editor',
        timeoutHours: 24,
        isMandatory: true,
      },
      {
        type: ApprovalNodeType.AI,
        name: 'AI自检',
        role: 'ai_system',
        timeoutHours: 1,
        isMandatory: true,
      },
      {
        type: ApprovalNodeType.MANAGER,
        name: '主管复审',
        role: 'manager',
        timeoutHours: 48,
        isMandatory: true,
      },
      {
        type: ApprovalNodeType.LEGAL,
        name: '法务终审',
        role: 'legal',
        timeoutHours: 72,
        isMandatory: true,
      },
    ];
  }

  /**
   * 创建工作流节点
   */
  private async createWorkflowNodes(
    workflow: Workflow,
    nodeConfigs: Array<{
      type: ApprovalNodeType;
      name?: string;
      assignee?: string;
      role?: string;
      timeoutHours?: number;
      isMandatory?: boolean;
      parallelGroup?: string;
    }>,
  ): Promise<WorkflowNode[]> {
    const nodes: WorkflowNode[] = [];

    for (let i = 0; i < nodeConfigs.length; i++) {
      const config = nodeConfigs[i];
      const node = this.workflowNodeRepository.create({
        tenantId: workflow.tenantId,
        workflowId: workflow.id,
        nodeIndex: i,
        nodeType: config.type,
        name: config.name || `${config.type}审批`,
        description: `第${i + 1}个审批节点`,
        status: WorkflowStatus.DRAFT,
        assignedTo: config.assignee,
        role: config.role,
        isMandatory: config.isMandatory ?? true,
        isParallel: !!config.parallelGroup,
        parallelGroup: config.parallelGroup,
        timeoutHours: config.timeoutHours || 24,
        config: {
          approvalRules: {
            requireCommentsOnReject: true,
            requireAttachments: false,
          },
          notifications: {
            remindBeforeTimeout: true,
            remindIntervalHours: 12,
            escalationRecipients: [],
          },
        },
        metadata: {
          processingTimeMs: 0,
          reminderCount: 0,
          escalated: false,
          escalationLevel: 0,
        },
      });

      nodes.push(node);
    }

    return this.workflowNodeRepository.saveMany(nodes);
  }

  /**
   * 检查是否为最后一个节点
   */
  private async isLastNode(workflow: Workflow, node: WorkflowNode): Promise<boolean> {
    const nodes = await this.workflowNodeRepository.findByWorkflowId(workflow.id);
    const sortedNodes = nodes.sort((a, b) => a.nodeIndex - b.nodeIndex);
    const lastNode = sortedNodes[sortedNodes.length - 1];

    // 如果是并行节点，需要检查整个并行组是否完成
    if (node.parallelGroup) {
      const parallelNodes = await this.workflowNodeRepository.findParallelGroupNodes(node.parallelGroup);
      const allCompleted = parallelNodes.every(n => n.status === WorkflowStatus.COMPLETED);
      return allCompleted && node.nodeIndex === lastNode.nodeIndex;
    }

    return node.nodeIndex === lastNode.nodeIndex;
  }

  /**
   * 激活下一个节点
   */
  private async activateNextNode(workflow: Workflow, currentNode: WorkflowNode): Promise<void> {
    const nodes = await this.workflowNodeRepository.findByWorkflowId(workflow.id);
    const sortedNodes = nodes.sort((a, b) => a.nodeIndex - b.nodeIndex);

    const currentIndex = sortedNodes.findIndex(n => n.id === currentNode.id);
    if (currentIndex === -1 || currentIndex >= sortedNodes.length - 1) {
      return;
    }

    const nextNode = sortedNodes[currentIndex + 1];

    // 检查依赖关系
    if (nextNode.dependencies && nextNode.dependencies.length > 0) {
      const dependencyNodes = nodes.filter(n => nextNode.dependencies.includes(n.id));
      const allDependenciesCompleted = dependencyNodes.every(n => n.status === WorkflowStatus.COMPLETED);
      if (!allDependenciesCompleted) {
        return;
      }
    }

    // 激活下一个节点
    nextNode.status = WorkflowStatus.EDITOR_REVIEW;
    nextNode.startedAt = new Date();
    await this.workflowNodeRepository.save(nextNode);

    // 发送通知给下一个审批人
    if (nextNode.assignedTo) {
      await this.createNotification({
        type: NotificationType.PENDING_APPROVAL,
        recipientId: nextNode.assignedTo,
        title: '新的审批任务',
        content: `您有一个新的内容需要审批：${workflow.title}`,
        workflowId: workflow.id,
        nodeId: nextNode.id,
        priority: workflow.isExpedited ? 5 : 3,
      });
    }

    // 更新工作流当前节点索引
    workflow.currentNodeIndex = nextNode.nodeIndex;
    workflow.completedNodesCount = (workflow.completedNodesCount || 0) + 1;
    await this.workflowRepository.save(workflow);
  }

  /**
   * 创建通知
   */
  private async createNotification(data: {
    type: NotificationType;
    recipientId: string;
    title: string;
    content: string;
    workflowId?: string;
    nodeId?: string;
    channels?: string[];
    priority?: number;
    metadata?: any;
  }): Promise<Notification> {
    try {
      return await this.notificationRepository.createNotification(data);
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
      throw error;
    }
  }
}