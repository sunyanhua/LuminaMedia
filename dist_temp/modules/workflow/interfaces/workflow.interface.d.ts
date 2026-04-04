import { WorkflowStatus, ApprovalAction, ApprovalNodeType, NotificationType } from '../../../shared/enums/workflow-status.enum';
export interface CreateWorkflowDto {
    contentDraftId: string;
    title?: string;
    description?: string;
    priority?: number;
    isExpedited?: boolean;
    expectedCompletionAt?: Date;
    config?: {
        nodes?: Array<{
            type: ApprovalNodeType;
            name?: string;
            assignee?: string;
            role?: string;
            timeoutHours?: number;
            isMandatory?: boolean;
            parallelGroup?: string;
        }>;
        rules?: {
            allowExpedite?: boolean;
            allowWithdraw?: boolean;
            allowReassign?: boolean;
            maxRevisionCount?: number;
            autoEscalateHours?: number;
        };
    };
}
export interface UpdateWorkflowDto {
    title?: string;
    description?: string;
    priority?: number;
    isExpedited?: boolean;
    expectedCompletionAt?: Date;
    status?: WorkflowStatus;
    config?: any;
}
export interface ApprovalRequestDto {
    action: ApprovalAction;
    comments?: string;
    attachments?: string[];
    transferTo?: string;
    isExpedited?: boolean;
}
export interface WorkflowFilter {
    status?: WorkflowStatus | WorkflowStatus[];
    createdBy?: string;
    isExpedited?: boolean;
    priority?: number;
    startDate?: Date;
    endDate?: Date;
    contentDraftId?: string;
    search?: string;
}
export interface WorkflowStats {
    byStatus: Record<WorkflowStatus, number>;
    total: number;
    pending: number;
    completed: number;
    averageProcessingTime: number;
    expeditedCount: number;
}
export interface AssignNodeRequest {
    nodeId: string;
    assigneeId: string;
    force?: boolean;
}
export interface TransferWorkflowRequest {
    workflowId: string;
    newOwnerId: string;
    reason?: string;
}
export interface CreateNotificationRequest {
    type: NotificationType;
    recipientId: string;
    title: string;
    content: string;
    workflowId?: string;
    nodeId?: string;
    channels?: string[];
    priority?: number;
    metadata?: any;
}
export declare enum WorkflowEventType {
    WORKFLOW_CREATED = "WORKFLOW_CREATED",
    WORKFLOW_STATUS_CHANGED = "WORKFLOW_STATUS_CHANGED",
    NODE_ASSIGNED = "NODE_ASSIGNED",
    NODE_COMPLETED = "NODE_COMPLETED",
    APPROVAL_SUBMITTED = "APPROVAL_SUBMITTED",
    WORKFLOW_COMPLETED = "WORKFLOW_COMPLETED",
    WORKFLOW_REJECTED = "WORKFLOW_REJECTED",
    WORKFLOW_ESCALATED = "WORKFLOW_ESCALATED",
    NOTIFICATION_SENT = "NOTIFICATION_SENT"
}
export interface WorkflowEventData {
    workflowId: string;
    nodeId?: string;
    userId?: string;
    previousStatus?: WorkflowStatus;
    newStatus?: WorkflowStatus;
    action?: ApprovalAction;
    comments?: string;
    timestamp: Date;
    metadata?: any;
}
