import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workflow } from './workflow.entity';
import { User } from '../../../entities/user.entity';
import {
  WorkflowStatus,
  ApprovalNodeType,
} from '../../../shared/enums/workflow-status.enum';

/**
 * 工作流节点实体
 * 表示工作流中的一个审批节点
 */
@Entity('workflow_nodes')
@Index(['workflowId'])
@Index(['nodeType'])
@Index(['status'])
@Index(['assignedTo'])
export class WorkflowNode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tenant_id',
    type: 'varchar',
    length: 36,
    default: 'default-tenant',
  })
  tenantId: string;

  /** 所属工作流ID */
  @Column({ name: 'workflow_id' })
  workflowId: string;

  @ManyToOne(() => Workflow, (workflow) => workflow.nodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;

  /** 节点索引（顺序） */
  @Column({ name: 'node_index' })
  nodeIndex: number;

  /** 节点类型 */
  @Column({
    name: 'node_type',
    type: 'enum',
    enum: ApprovalNodeType,
  })
  nodeType: ApprovalNodeType;

  /** 节点名称/描述 */
  @Column()
  name: string;

  /** 节点描述 */
  @Column('text', { nullable: true })
  description: string;

  /** 节点状态 */
  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.DRAFT,
  })
  status: WorkflowStatus;

  /** 节点处理人ID */
  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  /** 节点处理角色（当assignedTo为空时，按角色分配） */
  @Column({ nullable: true })
  role: string;

  /** 是否为必审节点 */
  @Column({ name: 'is_mandatory', default: true })
  isMandatory: boolean;

  /** 是否为并行节点组 */
  @Column({ name: 'is_parallel', default: false })
  isParallel: boolean;

  /** 并行组标识（同一组的节点并行处理） */
  @Column({ name: 'parallel_group', nullable: true })
  parallelGroup: string;

  /** 超时时间（小时） */
  @Column({ name: 'timeout_hours', nullable: true })
  timeoutHours: number;

  /** 节点开始时间 */
  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  /** 节点完成时间 */
  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  /** 节点超时时间 */
  @Column({ name: 'timeout_at', nullable: true })
  timeoutAt: Date;

  /** 节点处理结果 */
  @Column({ type: 'json', nullable: true })
  result: {
    action: string;
    comments: string;
    attachments?: string[];
    timestamp: Date;
  };

  /** 节点配置 */
  @Column({ type: 'json', nullable: true })
  config: {
    /** 审批规则 */
    approvalRules: {
      requireCommentsOnReject: boolean; // 拒绝时必须填写原因
      requireAttachments: boolean; // 是否需要附件
      minReviewTime?: number; // 最小评审时间（分钟）
    };
    /** 通知配置 */
    notifications: {
      remindBeforeTimeout: boolean; // 超时前提醒
      remindIntervalHours: number; // 提醒间隔（小时）
      escalationRecipients: string[]; // 升级审批接收人
    };
  };

  /** 前置节点ID（依赖关系） */
  @Column('simple-array', { nullable: true })
  dependencies: string[];

  /** 节点元数据 */
  @Column({ type: 'json', nullable: true })
  metadata: {
    processingTimeMs: number; // 处理时间（毫秒）
    reminderCount: number; // 提醒次数
    escalated: boolean; // 是否已升级
    escalationLevel: number; // 升级级别
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
