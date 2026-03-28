import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowNode } from './workflow-node.entity';
import { User } from '../../../entities/user.entity';
import { NotificationType } from '../../../shared/enums/workflow-status.enum';

/**
 * 通知实体
 * 用于工作流中的通知和提醒系统
 */
@Entity('workflow_notifications')
@Index(['tenantId'])
@Index(['recipientId'])
@Index(['workflowId'])
@Index(['nodeId'])
@Index(['type'])
@Index(['status'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tenant_id',
    type: 'varchar',
    length: 36,
    default: 'default-tenant',
  })
  tenantId: string;

  /** 通知类型 */
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  /** 接收人ID */
  @Column({ name: 'recipient_id' })
  recipientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  /** 关联的工作流ID */
  @Column({ name: 'workflow_id', nullable: true })
  workflowId: string;

  @ManyToOne(() => Workflow, { nullable: true })
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;

  /** 关联的节点ID */
  @Column({ name: 'node_id', nullable: true })
  nodeId: string;

  @ManyToOne(() => WorkflowNode, { nullable: true })
  @JoinColumn({ name: 'node_id' })
  node: WorkflowNode;

  /** 通知标题 */
  @Column()
  title: string;

  /** 通知内容 */
  @Column('text')
  content: string;

  /** 通知状态 */
  @Column({
    type: 'enum',
    enum: ['PENDING', 'SENT', 'READ', 'ACTIONED', 'FAILED'],
    default: 'PENDING',
  })
  status: string;

  /** 发送渠道 */
  @Column('simple-array', { default: 'in_app' })
  channels: string[]; // in_app, email, sms, wechat, dingtalk, etc.

  /** 发送时间 */
  @Column({ name: 'sent_at', nullable: true })
  sentAt: Date;

  /** 阅读时间 */
  @Column({ name: 'read_at', nullable: true })
  readAt: Date;

  /** 动作时间（如点击通知） */
  @Column({ name: 'actioned_at', nullable: true })
  actionedAt: Date;

  /** 通知优先级 (1-5) */
  @Column({ default: 3 })
  priority: number;

  /** 是否静默通知 */
  @Column({ name: 'is_silent', default: false })
  isSilent: boolean;

  /** 是否重复通知 */
  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  /** 重复间隔（分钟） */
  @Column({ name: 'recurrence_interval', nullable: true })
  recurrenceInterval: number;

  /** 下次发送时间 */
  @Column({ name: 'next_send_at', nullable: true })
  nextSendAt: Date;

  /** 重试次数 */
  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  /** 最大重试次数 */
  @Column({ name: 'max_retries', default: 3 })
  maxRetries: number;

  /** 失败原因 */
  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string;

  /** 通知元数据 */
  @Column({ type: 'json', nullable: true })
  metadata: {
    actionUrl?: string; // 动作URL
    deepLink?: string; // 深度链接
    templateId?: string; // 模板ID
    variables?: Record<string, any>; // 模板变量
    category?: string; // 通知分类
    tags?: string[]; // 标签
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}