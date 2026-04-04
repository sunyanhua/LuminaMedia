import { WorkflowStatus } from '../../../shared/enums/workflow-status.enum';
export declare class UpdateWorkflowDto {
    title?: string;
    description?: string;
    priority?: number;
    isExpedited?: boolean;
    expectedCompletionAt?: Date;
    status?: WorkflowStatus;
    config?: any;
}
