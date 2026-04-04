import { TenantRepository } from '../../../shared/repositories/tenant.repository';
import { WorkflowNode } from '../entities/workflow-node.entity';
import { WorkflowStatus, ApprovalNodeType } from '../../../shared/enums/workflow-status.enum';
import { DataSource } from 'typeorm';
export declare class WorkflowNodeRepository extends TenantRepository<WorkflowNode> {
    private dataSource;
    constructor(dataSource: DataSource);
    findByWorkflowId(workflowId: string): Promise<WorkflowNode[]>;
    findPendingByUser(userId: string): Promise<WorkflowNode[]>;
    findByNodeType(nodeType: ApprovalNodeType): Promise<WorkflowNode[]>;
    findActiveNodes(): Promise<WorkflowNode[]>;
    findTimeoutNodes(timeoutHours: number): Promise<WorkflowNode[]>;
    findNextPendingNode(workflowId: string): Promise<WorkflowNode | null>;
    findCompletedNodes(workflowId: string): Promise<WorkflowNode[]>;
    updateNodeStatus(nodeId: string, status: WorkflowStatus): Promise<void>;
    assignNodeToUser(nodeId: string, userId: string): Promise<void>;
    completeNode(nodeId: string, result: any): Promise<void>;
    findParallelGroupNodes(parallelGroup: string): Promise<WorkflowNode[]>;
    isParallelGroupCompleted(parallelGroup: string): Promise<boolean>;
}
