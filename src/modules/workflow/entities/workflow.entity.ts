import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../../entities/user.entity';
import { ContentDraft } from '../../../entities/content-draft.entity';
import { WorkflowStatus, ApprovalNodeType } from '../../../shared/enums/workflow-status.enum';
import { WorkflowNode } from './workflow-node.entity';
import { ApprovalRecord } from './approval-record.entity';

/**
 * 三审三校工作流实体
 * 表示一个内容从草稿到发布的完整审批流程
 */
@Entity('workflows')
@Index(['tenantId'])
@Index(['contentDraftId'])
@Index(['status'])
@Index(['createdAt'])
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tenant_id',
    type: 'varchar',
    length: 36,
    default: 'default-tenant',
  })
  tenantId: string;

  /** 关联的内容草稿ID */
  @Column({ name: 'content_draft_id' })
  contentDraftId: string;

  @ManyToOne(() => ContentDraft, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_draft_id' })
  contentDraft: ContentDraft;

  /** 工作流创建者 */
  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  /** 工作流标题/描述 */
  @Column({ nullable: true })
  title: string;

  /** 工作流描述 */
  @Column('text', { nullable: true })
  description: string;

  /** 当前工作流状态 */
  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.DRAFT,
  })
  status: WorkflowStatus;

  /** 工作流优先级 (1-5, 1为最低，5为最高) */
  @Column({
    type: 'int',
    default: 3,
  })
  priority: number;

  /** 是否为加急流程 */
  @Column({ name: 'is_expedited', default: false })
  isExpedited: boolean;

  /** 期望完成时间 */
  @Column({ name: 'expected_completion_at', nullable: true })
  expectedCompletionAt: Date;

  /** 实际完成时间 */
  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  /** 工作流配置JSON (存储节点配置、审批规则等) */
  @Column({ type: 'json', nullable: true })
  config: {
    /** 审批节点配置 */
    nodes: Array<{
      type: ApprovalNodeType;
      assignee?: string; // 审批人ID (用户ID或角色ID)
      role?: string; // 审批角色
      timeoutHours?: number; // 超时时间(小时)
      isMandatory?: boolean; // 是否必审
      parallelGroup?: string; // 并行审批组标识
    }>;
    /** 审批规则 */
    rules: {
      allowExpedite: boolean; // 是否允许加急
      allowWithdraw: boolean; // 是否允许撤回
      allowReassign: boolean; // 是否允许转交
      maxRevisionCount: number; // 最大修改次数
      autoEscalateHours: number; // 自动升级审批时间(小时)
    };
  };

  /** 当前活跃节点索引 */
  @Column({ name: 'current_node_index', default: 0 })
  currentNodeIndex: number;

  /** 已完成的节点数量 */
  @Column({ name: 'completed_nodes_count', default: 0 })
  completedNodesCount: number;

  /** 总节点数量 */
  @Column({ name: 'total_nodes_count', default: 0 })
  totalNodesCount: number;

  /** 审批历史记录（摘要信息） */
  @Column({ type: 'json', nullable: true })
  approvalHistory: Array<{
    nodeIndex: number;
    nodeType: ApprovalNodeType;
    action: string;
    actor: string;
    timestamp: Date;
    comments?: string;
  }>;

  /** 元数据：修改次数、耗时统计等 */
  @Column({ type: 'json', nullable: true })
  metadata: {
    revisionCount: number; // 修改次数
    totalProcessingTimeMs: number; // 总处理时间(毫秒)
    averageNodeTimeMs: number; // 平均节点处理时间
    escalationCount: number; // 升级审批次数
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** 关联的审批节点 */
  @OneToMany(() => WorkflowNode, (node) => node.workflow)
  nodes: WorkflowNode[];

  /** 关联的审批记录 */
  @OneToMany(() => ApprovalRecord, (record) => record.workflow)
  approvalRecords: ApprovalRecord[];
}