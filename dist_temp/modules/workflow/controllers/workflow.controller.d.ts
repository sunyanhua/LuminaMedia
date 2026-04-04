import { WorkflowService } from '../services/workflow.service';
import { NotificationService } from '../services/notification.service';
import { CreateWorkflowDto } from '../dto/create-workflow.dto';
import { UpdateWorkflowDto } from '../dto/update-workflow.dto';
import { ApprovalRequestDto } from '../dto/approval-request.dto';
import { WorkflowFilterDto } from '../dto/workflow-filter.dto';
import { Workflow } from '../entities/workflow.entity';
import { WorkflowNode } from '../entities/workflow-node.entity';
import { ApprovalRecord } from '../entities/approval-record.entity';
import { Notification } from '../entities/notification.entity';
import { WorkflowStats } from '../interfaces/workflow.interface';
export declare class WorkflowController {
    private readonly workflowService;
    private readonly notificationService;
    constructor(workflowService: WorkflowService, notificationService: NotificationService);
    createWorkflow(createDto: CreateWorkflowDto, req: any): Promise<Workflow>;
    submitWorkflow(workflowId: string, req: any): Promise<Workflow>;
    approveNode(workflowId: string, nodeId: string, approvalDto: ApprovalRequestDto, req: any): Promise<{
        workflow: Workflow;
        node: WorkflowNode;
        record: ApprovalRecord;
    }>;
    findWorkflows(filter: WorkflowFilterDto): Promise<{
        data: Workflow[];
        total: number;
    }>;
    getWorkflowStats(): Promise<WorkflowStats>;
    getWorkflow(workflowId: string): Promise<Workflow>;
    getWorkflowNodes(workflowId: string): Promise<WorkflowNode[]>;
    getApprovalRecords(workflowId: string): Promise<ApprovalRecord[]>;
    updateWorkflow(workflowId: string, updateDto: UpdateWorkflowDto, req: any): Promise<Workflow>;
    withdrawWorkflow(workflowId: string, req: any): Promise<Workflow>;
    getMyPendingWorkflows(req: any): Promise<Workflow[]>;
    getUnreadNotifications(req: any): Promise<Notification[]>;
    markNotificationAsRead(notificationId: string, req: any): Promise<void>;
    markNotificationAsActioned(notificationId: string, req: any): Promise<void>;
    deleteNotification(notificationId: string, req: any): Promise<void>;
}
