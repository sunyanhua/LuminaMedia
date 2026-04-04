import { TenantRepository } from '../../../shared/repositories/tenant.repository';
import { ApprovalRecord } from '../entities/approval-record.entity';
import { ApprovalAction } from '../../../shared/enums/workflow-status.enum';
import { DataSource } from 'typeorm';
export declare class ApprovalRecordRepository extends TenantRepository<ApprovalRecord> {
    private dataSource;
    constructor(dataSource: DataSource);
    findByWorkflowId(workflowId: string): Promise<ApprovalRecord[]>;
    findByNodeId(nodeId: string): Promise<ApprovalRecord[]>;
    findByActorId(actorId: string): Promise<ApprovalRecord[]>;
    findByAction(action: ApprovalAction): Promise<ApprovalRecord[]>;
    findRecent(limit?: number): Promise<ApprovalRecord[]>;
    getActionStats(): Promise<Record<ApprovalAction, number>>;
    findByTimeRange(startDate: Date, endDate: Date): Promise<ApprovalRecord[]>;
    getActorStats(actorId: string): Promise<{
        total: number;
        byAction: Record<ApprovalAction, number>;
        averageProcessingTime: number;
    }>;
    createRecord(data: {
        workflowId: string;
        nodeId?: string;
        action: ApprovalAction;
        actorId: string;
        comments?: string;
        attachments?: string[];
        transferTo?: string;
        isExpedited?: boolean;
        previousStatus?: string;
        newStatus?: string;
        ipAddress?: string;
        userAgent?: string;
        metadata?: any;
    }): Promise<ApprovalRecord>;
}
