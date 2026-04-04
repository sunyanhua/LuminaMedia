import { WorkflowStatus } from '../../../shared/enums/workflow-status.enum';
export declare class WorkflowFilterDto {
    status?: WorkflowStatus;
    statuses?: WorkflowStatus[];
    createdBy?: string;
    isExpedited?: boolean;
    priority?: number;
    startDate?: Date;
    endDate?: Date;
    contentDraftId?: string;
    search?: string;
    page?: number;
    limit?: number;
}
