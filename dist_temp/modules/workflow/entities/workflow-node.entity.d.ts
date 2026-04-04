import { Workflow } from './workflow.entity';
import { User } from '../../../entities/user.entity';
import { WorkflowStatus, ApprovalNodeType } from '../../../shared/enums/workflow-status.enum';
export declare class WorkflowNode {
    id: string;
    tenantId: string;
    workflowId: string;
    workflow: Promise<Workflow>;
    nodeIndex: number;
    nodeType: ApprovalNodeType;
    name: string;
    description: string;
    status: WorkflowStatus;
    assignedTo: string;
    assignee: User;
    role: string;
    isMandatory: boolean;
    isParallel: boolean;
    parallelGroup: string;
    timeoutHours: number;
    startedAt: Date;
    completedAt: Date;
    timeoutAt: Date;
    result: {
        action: string;
        comments: string;
        attachments?: string[];
        timestamp: Date;
    };
    config: {
        approvalRules: {
            requireCommentsOnReject: boolean;
            requireAttachments: boolean;
            minReviewTime?: number;
        };
        notifications: {
            remindBeforeTimeout: boolean;
            remindIntervalHours: number;
            escalationRecipients: string[];
        };
    };
    dependencies: string[];
    metadata: {
        processingTimeMs: number;
        reminderCount: number;
        escalated: boolean;
        escalationLevel: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
