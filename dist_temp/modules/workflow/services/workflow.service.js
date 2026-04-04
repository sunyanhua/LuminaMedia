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
var WorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workflow_repository_1 = require("../repositories/workflow.repository");
const workflow_node_repository_1 = require("../repositories/workflow-node.repository");
const approval_record_repository_1 = require("../repositories/approval-record.repository");
const notification_repository_1 = require("../repositories/notification.repository");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
const workflow_interface_1 = require("../interfaces/workflow.interface");
const event_emitter_1 = require("@nestjs/event-emitter");
const user_entity_1 = require("../../../entities/user.entity");
const content_draft_entity_1 = require("../../../entities/content-draft.entity");
const typeorm_2 = require("typeorm");
const tenant_context_service_1 = require("../../../shared/services/tenant-context.service");
let WorkflowService = WorkflowService_1 = class WorkflowService {
    workflowRepository;
    workflowNodeRepository;
    approvalRecordRepository;
    notificationRepository;
    userRepository;
    contentDraftRepository;
    eventEmitter;
    dataSource;
    logger = new common_1.Logger(WorkflowService_1.name);
    constructor(workflowRepository, workflowNodeRepository, approvalRecordRepository, notificationRepository, userRepository, contentDraftRepository, eventEmitter, dataSource) {
        this.workflowRepository = workflowRepository;
        this.workflowNodeRepository = workflowNodeRepository;
        this.approvalRecordRepository = approvalRecordRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.contentDraftRepository = contentDraftRepository;
        this.eventEmitter = eventEmitter;
        this.dataSource = dataSource;
    }
    async createWorkflow(createDto, creatorId) {
        const contentDraft = await this.contentDraftRepository.findOne({
            where: { id: createDto.contentDraftId },
        });
        if (!contentDraft) {
            throw new common_1.NotFoundException(`Content draft not found: ${createDto.contentDraftId}`);
        }
        const existingWorkflow = await this.workflowRepository.findByContentDraft(createDto.contentDraftId);
        if (existingWorkflow) {
            throw new common_1.BadRequestException(`Workflow already exists for content draft: ${createDto.contentDraftId}`);
        }
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
        const workflow = this.workflowRepository.create({
            tenantId: tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic(),
            contentDraftId: createDto.contentDraftId,
            createdBy: creatorId,
            title: createDto.title || `Workflow for ${contentDraft.title}`,
            description: createDto.description,
            priority: createDto.priority || 3,
            isExpedited: createDto.isExpedited || false,
            expectedCompletionAt: createDto.expectedCompletionAt,
            status: workflow_status_enum_1.WorkflowStatus.DRAFT,
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
        await this.createWorkflowNodes(savedWorkflow, config.nodes);
        this.eventEmitter.emit(workflow_interface_1.WorkflowEventType.WORKFLOW_CREATED, {
            workflowId: savedWorkflow.id,
            userId: creatorId,
            timestamp: new Date(),
        });
        await this.createNotification({
            type: workflow_status_enum_1.NotificationType.TASK_ASSIGNED,
            recipientId: creatorId,
            title: '工作流创建成功',
            content: `您已成功创建工作流 "${savedWorkflow.title}"，请等待审批流程开始。`,
            workflowId: savedWorkflow.id,
            priority: 3,
        });
        this.logger.log(`Workflow created: ${savedWorkflow.id} for draft: ${createDto.contentDraftId}`);
        return savedWorkflow;
    }
    async submitWorkflow(workflowId, userId) {
        const workflow = await this.getWorkflowById(workflowId);
        if (workflow.status !== workflow_status_enum_1.WorkflowStatus.DRAFT) {
            throw new common_1.BadRequestException(`Workflow cannot be submitted. Current status: ${workflow.status}`);
        }
        if (workflow.createdBy !== userId) {
            throw new common_1.ForbiddenException('Only the creator can submit the workflow');
        }
        workflow.status = workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW;
        workflow.updatedAt = new Date();
        const firstNode = await this.workflowNodeRepository.findOne({
            where: { workflowId, nodeIndex: 0 },
        });
        if (firstNode) {
            firstNode.status = workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW;
            firstNode.startedAt = new Date();
            await this.workflowNodeRepository.save(firstNode);
            if (firstNode.assignedTo) {
                await this.createNotification({
                    type: workflow_status_enum_1.NotificationType.PENDING_APPROVAL,
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
        this.eventEmitter.emit(workflow_interface_1.WorkflowEventType.WORKFLOW_STATUS_CHANGED, {
            workflowId,
            userId,
            previousStatus: workflow_status_enum_1.WorkflowStatus.DRAFT,
            newStatus: workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
            timestamp: new Date(),
        });
        return savedWorkflow;
    }
    async processApproval(workflowId, nodeId, approvalDto, userId) {
        const workflow = await this.getWorkflowById(workflowId);
        const node = await this.workflowNodeRepository.findById(nodeId);
        if (!node || node.workflowId !== workflowId) {
            throw new common_1.NotFoundException(`Node not found: ${nodeId}`);
        }
        if (node.assignedTo !== userId) {
            throw new common_1.ForbiddenException('User does not have permission to approve this node');
        }
        if (node.status !== workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW) {
            throw new common_1.BadRequestException(`Node cannot be approved. Current status: ${node.status}`);
        }
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
            newStatus: workflow_status_enum_1.WorkflowStatus.COMPLETED,
            metadata: {
                processingTimeMs: node.startedAt
                    ? Date.now() - node.startedAt.getTime()
                    : 0,
                autoApproved: false,
            },
        });
        node.status = workflow_status_enum_1.WorkflowStatus.COMPLETED;
        node.completedAt = new Date();
        node.result = {
            action: approvalDto.action,
            comments: approvalDto.comments || '',
            attachments: approvalDto.attachments || [],
            timestamp: new Date(),
        };
        await this.workflowNodeRepository.save(node);
        let workflowStatusChanged = false;
        let newWorkflowStatus = workflow.status;
        switch (approvalDto.action) {
            case workflow_status_enum_1.ApprovalAction.APPROVE:
                const isLastNode = await this.isLastNode(workflow, node);
                if (isLastNode) {
                    newWorkflowStatus = workflow_status_enum_1.WorkflowStatus.APPROVED;
                    workflowStatusChanged = true;
                    workflow.completedAt = new Date();
                }
                else {
                    await this.activateNextNode(workflow, node);
                }
                break;
            case workflow_status_enum_1.ApprovalAction.REJECT:
                newWorkflowStatus = workflow_status_enum_1.WorkflowStatus.REJECTED;
                workflowStatusChanged = true;
                workflow.completedAt = new Date();
                break;
            case workflow_status_enum_1.ApprovalAction.RETURN_FOR_REVISION:
                newWorkflowStatus = workflow_status_enum_1.WorkflowStatus.NEEDS_REVISION;
                workflowStatusChanged = true;
                break;
            case workflow_status_enum_1.ApprovalAction.TRANSFER:
                if (!approvalDto.transferTo) {
                    throw new common_1.BadRequestException('Transfer target user is required');
                }
                node.assignedTo = approvalDto.transferTo;
                node.startedAt = new Date();
                await this.workflowNodeRepository.save(node);
                await this.createNotification({
                    type: workflow_status_enum_1.NotificationType.TASK_ASSIGNED,
                    recipientId: approvalDto.transferTo,
                    title: '审批任务转交',
                    content: `您收到一个转交的审批任务：${workflow.title}`,
                    workflowId: workflow.id,
                    nodeId: node.id,
                    priority: workflow.isExpedited ? 5 : 3,
                });
                break;
            case workflow_status_enum_1.ApprovalAction.EXPEDITE:
                workflow.isExpedited = true;
                workflow.priority = Math.max(workflow.priority, 5);
                break;
        }
        if (workflowStatusChanged) {
            const previousStatus = workflow.status;
            workflow.status = newWorkflowStatus;
            workflow.updatedAt = new Date();
            await this.createNotification({
                type: workflow_status_enum_1.NotificationType.WORKFLOW_STATUS_CHANGED,
                recipientId: workflow.createdBy,
                title: '工作流状态变更',
                content: `工作流 "${workflow.title}" 状态已从 ${previousStatus} 变更为 ${newWorkflowStatus}`,
                workflowId: workflow.id,
                priority: 3,
            });
            this.eventEmitter.emit(workflow_interface_1.WorkflowEventType.WORKFLOW_STATUS_CHANGED, {
                workflowId,
                userId,
                previousStatus,
                newStatus: newWorkflowStatus,
                action: approvalDto.action,
                timestamp: new Date(),
            });
        }
        const savedWorkflow = await this.workflowRepository.save(workflow);
        await this.createNotification({
            type: workflow_status_enum_1.NotificationType.APPROVAL_COMPLETED,
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
    async getWorkflowById(workflowId) {
        const workflow = await this.workflowRepository.findById(workflowId);
        if (!workflow) {
            throw new common_1.NotFoundException(`Workflow not found: ${workflowId}`);
        }
        return workflow;
    }
    async getWorkflowNodes(workflowId) {
        return this.workflowNodeRepository.findByWorkflowId(workflowId);
    }
    async getApprovalRecords(workflowId) {
        return this.approvalRecordRepository.findByWorkflowId(workflowId);
    }
    async findWorkflows(filter, page = 1, limit = 20) {
        const queryBuilder = this.workflowRepository.createQueryBuilder('workflow');
        if (filter.status) {
            if (Array.isArray(filter.status)) {
                queryBuilder.andWhere('workflow.status IN (:...statuses)', {
                    statuses: filter.status,
                });
            }
            else {
                queryBuilder.andWhere('workflow.status = :status', {
                    status: filter.status,
                });
            }
        }
        if (filter.createdBy) {
            queryBuilder.andWhere('workflow.createdBy = :createdBy', {
                createdBy: filter.createdBy,
            });
        }
        if (filter.isExpedited !== undefined) {
            queryBuilder.andWhere('workflow.isExpedited = :isExpedited', {
                isExpedited: filter.isExpedited,
            });
        }
        if (filter.priority) {
            queryBuilder.andWhere('workflow.priority >= :priority', {
                priority: filter.priority,
            });
        }
        if (filter.startDate) {
            queryBuilder.andWhere('workflow.createdAt >= :startDate', {
                startDate: filter.startDate,
            });
        }
        if (filter.endDate) {
            queryBuilder.andWhere('workflow.createdAt <= :endDate', {
                endDate: filter.endDate,
            });
        }
        if (filter.contentDraftId) {
            queryBuilder.andWhere('workflow.contentDraftId = :contentDraftId', {
                contentDraftId: filter.contentDraftId,
            });
        }
        if (filter.search) {
            queryBuilder.andWhere('(workflow.title LIKE :search OR workflow.description LIKE :search)', {
                search: `%${filter.search}%`,
            });
        }
        queryBuilder
            .orderBy('workflow.priority', 'DESC')
            .addOrderBy('workflow.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
    }
    async getWorkflowStats() {
        const statusStats = await this.workflowRepository.getStatusStats();
        const total = Object.values(statusStats).reduce((sum, count) => sum + count, 0);
        const pending = [
            workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
            workflow_status_enum_1.WorkflowStatus.AI_CHECK,
            workflow_status_enum_1.WorkflowStatus.MANAGER_REVIEW,
            workflow_status_enum_1.WorkflowStatus.LEGAL_REVIEW,
        ].reduce((sum, status) => sum + (statusStats[status] || 0), 0);
        const completed = [
            workflow_status_enum_1.WorkflowStatus.APPROVED,
            workflow_status_enum_1.WorkflowStatus.PUBLISHED,
            workflow_status_enum_1.WorkflowStatus.REJECTED,
            workflow_status_enum_1.WorkflowStatus.CANCELLED,
        ].reduce((sum, status) => sum + (statusStats[status] || 0), 0);
        const expeditedCount = await this.workflowRepository
            .createQueryBuilder()
            .where('is_expedited = :expedited', { expedited: true })
            .getCount();
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
    async withdrawWorkflow(workflowId, userId) {
        const workflow = await this.getWorkflowById(workflowId);
        if (workflow.createdBy !== userId) {
            throw new common_1.ForbiddenException('Only the creator can withdraw the workflow');
        }
        const withdrawableStatuses = [
            workflow_status_enum_1.WorkflowStatus.DRAFT,
            workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
            workflow_status_enum_1.WorkflowStatus.NEEDS_REVISION,
        ];
        if (!withdrawableStatuses.includes(workflow.status)) {
            throw new common_1.BadRequestException(`Workflow cannot be withdrawn in status: ${workflow.status}`);
        }
        const previousStatus = workflow.status;
        workflow.status = workflow_status_enum_1.WorkflowStatus.WITHDRAWN;
        workflow.completedAt = new Date();
        workflow.updatedAt = new Date();
        const savedWorkflow = await this.workflowRepository.save(workflow);
        this.eventEmitter.emit(workflow_interface_1.WorkflowEventType.WORKFLOW_STATUS_CHANGED, {
            workflowId,
            userId,
            previousStatus,
            newStatus: workflow_status_enum_1.WorkflowStatus.WITHDRAWN,
            timestamp: new Date(),
        });
        return savedWorkflow;
    }
    async assignNode(assignRequest, userId) {
        const node = await this.workflowNodeRepository.findById(assignRequest.nodeId);
        if (!node) {
            throw new common_1.NotFoundException(`Node not found: ${assignRequest.nodeId}`);
        }
        const workflow = await this.getWorkflowById(node.workflowId);
        const previousAssignee = node.assignedTo;
        node.assignedTo = assignRequest.assigneeId;
        node.startedAt = new Date();
        node.status = workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW;
        const savedNode = await this.workflowNodeRepository.save(node);
        await this.createNotification({
            type: workflow_status_enum_1.NotificationType.TASK_ASSIGNED,
            recipientId: assignRequest.assigneeId,
            title: '审批任务分配',
            content: `您被分配了一个审批任务：${workflow.title}`,
            workflowId: workflow.id,
            nodeId: node.id,
            priority: workflow.isExpedited ? 5 : 3,
        });
        if (previousAssignee && previousAssignee !== assignRequest.assigneeId) {
            await this.createNotification({
                type: workflow_status_enum_1.NotificationType.WORKFLOW_STATUS_CHANGED,
                recipientId: previousAssignee,
                title: '审批任务重新分配',
                content: `您的审批任务 "${workflow.title}" 已被重新分配给其他用户`,
                workflowId: workflow.id,
                nodeId: node.id,
                priority: 3,
            });
        }
        this.eventEmitter.emit(workflow_interface_1.WorkflowEventType.NODE_ASSIGNED, {
            workflowId: workflow.id,
            nodeId: node.id,
            userId,
            previousAssignee,
            newAssignee: assignRequest.assigneeId,
            timestamp: new Date(),
        });
        return savedNode;
    }
    createDefaultNodes() {
        return [
            {
                type: workflow_status_enum_1.ApprovalNodeType.EDITOR,
                name: '编辑初审',
                role: 'editor',
                timeoutHours: 24,
                isMandatory: true,
            },
            {
                type: workflow_status_enum_1.ApprovalNodeType.AI,
                name: 'AI自检',
                role: 'ai_system',
                timeoutHours: 1,
                isMandatory: true,
            },
            {
                type: workflow_status_enum_1.ApprovalNodeType.MANAGER,
                name: '主管复审',
                role: 'manager',
                timeoutHours: 48,
                isMandatory: true,
            },
            {
                type: workflow_status_enum_1.ApprovalNodeType.LEGAL,
                name: '法务终审',
                role: 'legal',
                timeoutHours: 72,
                isMandatory: true,
            },
        ];
    }
    async createWorkflowNodes(workflow, nodeConfigs) {
        const nodes = [];
        for (let i = 0; i < nodeConfigs.length; i++) {
            const config = nodeConfigs[i];
            const node = this.workflowNodeRepository.create({
                tenantId: workflow.tenantId,
                workflowId: workflow.id,
                nodeIndex: i,
                nodeType: config.type,
                name: config.name || `${config.type}审批`,
                description: `第${i + 1}个审批节点`,
                status: workflow_status_enum_1.WorkflowStatus.DRAFT,
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
    async isLastNode(workflow, node) {
        const nodes = await this.workflowNodeRepository.findByWorkflowId(workflow.id);
        const sortedNodes = nodes.sort((a, b) => a.nodeIndex - b.nodeIndex);
        const lastNode = sortedNodes[sortedNodes.length - 1];
        if (node.parallelGroup) {
            const parallelNodes = await this.workflowNodeRepository.findParallelGroupNodes(node.parallelGroup);
            const allCompleted = parallelNodes.every((n) => n.status === workflow_status_enum_1.WorkflowStatus.COMPLETED);
            return allCompleted && node.nodeIndex === lastNode.nodeIndex;
        }
        return node.nodeIndex === lastNode.nodeIndex;
    }
    async activateNextNode(workflow, currentNode) {
        const nodes = await this.workflowNodeRepository.findByWorkflowId(workflow.id);
        const sortedNodes = nodes.sort((a, b) => a.nodeIndex - b.nodeIndex);
        const currentIndex = sortedNodes.findIndex((n) => n.id === currentNode.id);
        if (currentIndex === -1 || currentIndex >= sortedNodes.length - 1) {
            return;
        }
        const nextNode = sortedNodes[currentIndex + 1];
        if (nextNode.dependencies && nextNode.dependencies.length > 0) {
            const dependencyNodes = nodes.filter((n) => nextNode.dependencies.includes(n.id));
            const allDependenciesCompleted = dependencyNodes.every((n) => n.status === workflow_status_enum_1.WorkflowStatus.COMPLETED);
            if (!allDependenciesCompleted) {
                return;
            }
        }
        nextNode.status = workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW;
        nextNode.startedAt = new Date();
        await this.workflowNodeRepository.save(nextNode);
        if (nextNode.assignedTo) {
            await this.createNotification({
                type: workflow_status_enum_1.NotificationType.PENDING_APPROVAL,
                recipientId: nextNode.assignedTo,
                title: '新的审批任务',
                content: `您有一个新的内容需要审批：${workflow.title}`,
                workflowId: workflow.id,
                nodeId: nextNode.id,
                priority: workflow.isExpedited ? 5 : 3,
            });
        }
        workflow.currentNodeIndex = nextNode.nodeIndex;
        workflow.completedNodesCount = (workflow.completedNodesCount || 0) + 1;
        await this.workflowRepository.save(workflow);
    }
    async createNotification(data) {
        try {
            return await this.notificationRepository.createNotification(data);
        }
        catch (error) {
            this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = WorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workflow_repository_1.WorkflowRepository)),
    __param(1, (0, typeorm_1.InjectRepository)(workflow_node_repository_1.WorkflowNodeRepository)),
    __param(2, (0, typeorm_1.InjectRepository)(approval_record_repository_1.ApprovalRecordRepository)),
    __param(3, (0, typeorm_1.InjectRepository)(notification_repository_1.NotificationRepository)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(5, (0, typeorm_1.InjectRepository)(content_draft_entity_1.ContentDraft)),
    __metadata("design:paramtypes", [workflow_repository_1.WorkflowRepository,
        workflow_node_repository_1.WorkflowNodeRepository,
        approval_record_repository_1.ApprovalRecordRepository,
        notification_repository_1.NotificationRepository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2,
        typeorm_2.DataSource])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map