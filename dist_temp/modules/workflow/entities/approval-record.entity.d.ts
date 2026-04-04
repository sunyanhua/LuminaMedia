import { Workflow } from './workflow.entity';
import { WorkflowNode } from './workflow-node.entity';
import { User } from '../../../entities/user.entity';
import { ApprovalAction } from '../../../shared/enums/workflow-status.enum';
export declare class ApprovalRecord {
    id: string;
    tenantId: string;
    workflowId: string;
    workflow: Promise<Workflow>;
    nodeId: string;
    node: Promise<WorkflowNode>;
    action: ApprovalAction;
    actorId: string;
    actor: User;
    comments: string;
    attachments: string[];
    transferTo: string;
    isExpedited: boolean;
    previousStatus: string;
    newStatus: string;
    ipAddress: string;
    userAgent: string;
    device: string;
    location: string;
    metadata: {
        processingTimeMs: number;
        autoApproved: boolean;
        escalated: boolean;
        reminderCount: number;
    };
    createdAt: Date;
}
