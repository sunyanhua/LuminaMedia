import { WorkflowRepository } from '../repositories/workflow.repository';
import { WorkflowNodeRepository } from '../repositories/workflow-node.repository';
import { ApprovalRecordRepository } from '../repositories/approval-record.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { Workflow } from '../entities/workflow.entity';
import { WorkflowNode } from '../entities/workflow-node.entity';
import { ApprovalRecord } from '../entities/approval-record.entity';
import { CreateWorkflowDto, ApprovalRequestDto, WorkflowFilter, WorkflowStats, AssignNodeRequest } from '../interfaces/workflow.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../../entities/user.entity';
import { ContentDraft } from '../../../entities/content-draft.entity';
import { DataSource, Repository } from 'typeorm';
export declare class WorkflowService {
    private readonly workflowRepository;
    private readonly workflowNodeRepository;
    private readonly approvalRecordRepository;
    private readonly notificationRepository;
    private readonly userRepository;
    private readonly contentDraftRepository;
    private readonly eventEmitter;
    private readonly dataSource;
    private readonly logger;
    constructor(workflowRepository: WorkflowRepository, workflowNodeRepository: WorkflowNodeRepository, approvalRecordRepository: ApprovalRecordRepository, notificationRepository: NotificationRepository, userRepository: Repository<User>, contentDraftRepository: Repository<ContentDraft>, eventEmitter: EventEmitter2, dataSource: DataSource);
    createWorkflow(createDto: CreateWorkflowDto, creatorId: string): Promise<Workflow>;
    submitWorkflow(workflowId: string, userId: string): Promise<Workflow>;
    processApproval(workflowId: string, nodeId: string, approvalDto: ApprovalRequestDto, userId: string): Promise<{
        workflow: Workflow;
        node: WorkflowNode;
        record: ApprovalRecord;
    }>;
    getWorkflowById(workflowId: string): Promise<Workflow>;
    getWorkflowNodes(workflowId: string): Promise<WorkflowNode[]>;
    getApprovalRecords(workflowId: string): Promise<ApprovalRecord[]>;
    findWorkflows(filter: WorkflowFilter, page?: number, limit?: number): Promise<{
        data: Workflow[];
        total: number;
    }>;
    getWorkflowStats(): Promise<WorkflowStats>;
    withdrawWorkflow(workflowId: string, userId: string): Promise<Workflow>;
    assignNode(assignRequest: AssignNodeRequest, userId: string): Promise<WorkflowNode>;
    private createDefaultNodes;
    private createWorkflowNodes;
    private isLastNode;
    private activateNextNode;
    private createNotification;
}
