import { ApprovalNodeType } from '../../../shared/enums/workflow-status.enum';
declare class WorkflowNodeConfigDto {
    type: ApprovalNodeType;
    name?: string;
    assignee?: string;
    role?: string;
    timeoutHours?: number;
    isMandatory?: boolean;
    parallelGroup?: string;
}
declare class WorkflowRulesConfigDto {
    allowExpedite?: boolean;
    allowWithdraw?: boolean;
    allowReassign?: boolean;
    maxRevisionCount?: number;
    autoEscalateHours?: number;
}
export declare class CreateWorkflowDto {
    contentDraftId: string;
    title?: string;
    description?: string;
    priority?: number;
    isExpedited?: boolean;
    expectedCompletionAt?: Date;
    nodes?: WorkflowNodeConfigDto[];
    rules?: WorkflowRulesConfigDto;
}
export {};
