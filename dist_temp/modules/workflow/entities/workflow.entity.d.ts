import { User } from '../../../entities/user.entity';
import { ContentDraft } from '../../../entities/content-draft.entity';
import { WorkflowStatus, ApprovalNodeType } from '../../../shared/enums/workflow-status.enum';
import { WorkflowNode } from './workflow-node.entity';
import { ApprovalRecord } from './approval-record.entity';
export declare class Workflow {
    id: string;
    tenantId: string;
    contentDraftId: string;
    contentDraft: ContentDraft;
    createdBy: string;
    creator: User;
    title: string;
    description: string;
    status: WorkflowStatus;
    priority: number;
    isExpedited: boolean;
    expectedCompletionAt: Date;
    completedAt: Date;
    config: {
        nodes: Array<{
            type: ApprovalNodeType;
            assignee?: string;
            role?: string;
            timeoutHours?: number;
            isMandatory?: boolean;
            parallelGroup?: string;
        }>;
        rules: {
            allowExpedite: boolean;
            allowWithdraw: boolean;
            allowReassign: boolean;
            maxRevisionCount: number;
            autoEscalateHours: number;
        };
    };
    currentNodeIndex: number;
    completedNodesCount: number;
    totalNodesCount: number;
    approvalHistory: Array<{
        nodeIndex: number;
        nodeType: ApprovalNodeType;
        action: string;
        actor: string;
        timestamp: Date;
        comments?: string;
    }>;
    metadata: {
        revisionCount: number;
        totalProcessingTimeMs: number;
        averageNodeTimeMs: number;
        escalationCount: number;
    };
    createdAt: Date;
    updatedAt: Date;
    nodes: Promise<WorkflowNode[]>;
    approvalRecords: Promise<ApprovalRecord[]>;
}
