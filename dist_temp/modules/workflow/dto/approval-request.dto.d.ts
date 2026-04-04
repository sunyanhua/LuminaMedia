import { ApprovalAction } from '../../../shared/enums/workflow-status.enum';
export declare class ApprovalRequestDto {
    action: ApprovalAction;
    comments?: string;
    attachments?: string[];
    transferTo?: string;
    isExpedited?: boolean;
}
