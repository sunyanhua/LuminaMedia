import { TenantRepository } from '../../../shared/repositories/tenant.repository';
import { Workflow } from '../entities/workflow.entity';
import { WorkflowStatus } from '../../../shared/enums/workflow-status.enum';
import { DataSource } from 'typeorm';
export declare class WorkflowRepository extends TenantRepository<Workflow> {
    private dataSource;
    constructor(dataSource: DataSource);
    findByStatus(status: WorkflowStatus): Promise<Workflow[]>;
    findByCreator(userId: string): Promise<Workflow[]>;
    findPendingByUser(userId: string): Promise<Workflow[]>;
    findExpedited(): Promise<Workflow[]>;
    getStatusStats(): Promise<Record<WorkflowStatus, number>>;
    findTimeoutWorkflows(timeoutHours: number): Promise<Workflow[]>;
    findRecentlyCompleted(days?: number): Promise<Workflow[]>;
    findByContentDraft(draftId: string): Promise<Workflow | null>;
}
