import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowNode } from './workflow-node.entity';
import { User } from '../../../entities/user.entity';
import { ApprovalAction } from '../../../shared/enums/workflow-status.enum';

/**
 * 审批记录实体
 * 记录工作流中每个审批动作的详细信息
 */
@Entity('approval_records')
@Index(['workflowId'])
@Index(['nodeId'])
@Index(['actorId'])
@Index(['action'])
@Index(['createdAt'])
export class ApprovalRecord {
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

  @ManyToOne(() => Workflow, (workflow) => workflow.approvalRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;

  /** 所属节点ID */
  @Column({ name: 'node_id', nullable: true })
  nodeId: string;

  @ManyToOne(() => WorkflowNode, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'node_id' })
  node: WorkflowNode;

  /** 审批动作 */
  @Column({
    type: 'enum',
    enum: ApprovalAction,
  })
  action: ApprovalAction;

  /** 审批人ID */
  @Column({ name: 'actor_id' })
  actorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  /** 审批意见 */
  @Column('text', { nullable: true })
  comments: string;

  /** 附件URL */
  @Column('simple-array', { nullable: true })
  attachments: string[];

  /** 转交目标用户ID（如果是转交动作） */
  @Column({ name: 'transfer_to', nullable: true })
  transferTo: string;

  /** 加急标记 */
  @Column({ name: 'is_expedited', default: false })
  isExpedited: boolean;

  /** 审批前状态 */
  @Column({ name: 'previous_status', nullable: true })
  previousStatus: string;

  /** 审批后状态 */
  @Column({ name: 'new_status', nullable: true })
  newStatus: string;

  /** IP地址（用于审计） */
  @Column({ nullable: true })
  ipAddress: string;

  /** 用户代理（用于审计） */
  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  /** 设备信息（用于审计） */
  @Column({ nullable: true })
  device: string;

  /** 地理位置（用于审计） */
  @Column({ nullable: true })
  location: string;

  /** 元数据 */
  @Column({ type: 'json', nullable: true })
  metadata: {
    processingTimeMs: number; // 从节点分配到审批的处理时间
    autoApproved: boolean; // 是否自动审批
    escalated: boolean; // 是否升级审批
    reminderCount: number; // 提醒次数
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}