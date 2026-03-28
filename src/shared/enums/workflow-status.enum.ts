/**
 * 三审三校工作流状态枚举
 */
export enum WorkflowStatus {
  /** 草稿状态 - 内容创建完成，等待提交审批 */
  DRAFT = 'DRAFT',

  /** 编辑初审 - 编辑进行内容初审 */
  EDITOR_REVIEW = 'EDITOR_REVIEW',

  /** AI自检 - AI进行安全合规检查 */
  AI_CHECK = 'AI_CHECK',

  /** 主管复审 - 主管进行内容复审 */
  MANAGER_REVIEW = 'MANAGER_REVIEW',

  /** 法务终审 - 法务进行最终合规审查 */
  LEGAL_REVIEW = 'LEGAL_REVIEW',

  /** 审批通过 - 所有审批节点通过 */
  APPROVED = 'APPROVED',

  /** 已发布 - 内容已发布到平台 */
  PUBLISHED = 'PUBLISHED',

  /** 被拒绝 - 内容被拒绝 */
  REJECTED = 'REJECTED',

  /** 需要修改 - 内容需要修改后重新提交 */
  NEEDS_REVISION = 'NEEDS_REVISION',

  /** 已撤回 - 提交者撤回审批请求 */
  WITHDRAWN = 'WITHDRAWN',

  /** 已取消 - 工作流被取消 */
  CANCELLED = 'CANCELLED',
}

/**
 * 审批节点类型枚举
 */
export enum ApprovalNodeType {
  /** 编辑初审节点 */
  EDITOR = 'EDITOR',

  /** AI自检节点 */
  AI = 'AI',

  /** 主管复审节点 */
  MANAGER = 'MANAGER',

  /** 法务终审节点 */
  LEGAL = 'LEGAL',

  /** 并行审批节点 */
  PARALLEL = 'PARALLEL',

  /** 串行审批节点 */
  SEQUENTIAL = 'SEQUENTIAL',
}

/**
 * 审批动作枚举
 */
export enum ApprovalAction {
  /** 通过 */
  APPROVE = 'APPROVE',

  /** 拒绝 */
  REJECT = 'REJECT',

  /** 退回修改 */
  RETURN_FOR_REVISION = 'RETURN_FOR_REVISION',

  /** 转交他人 */
  TRANSFER = 'TRANSFER',

  /** 加急处理 */
  EXPEDITE = 'EXPEDITE',
}

/**
 * 通知类型枚举
 */
export enum NotificationType {
  /** 审批任务分配 */
  TASK_ASSIGNED = 'TASK_ASSIGNED',

  /** 审批待处理 */
  PENDING_APPROVAL = 'PENDING_APPROVAL',

  /** 审批完成 */
  APPROVAL_COMPLETED = 'APPROVAL_COMPLETED',

  /** 审批超时提醒 */
  APPROVAL_TIMEOUT = 'APPROVAL_TIMEOUT',

  /** 工作流状态变更 */
  WORKFLOW_STATUS_CHANGED = 'WORKFLOW_STATUS_CHANGED',

  /** 紧急审批提醒 */
  URGENT_APPROVAL = 'URGENT_APPROVAL',
}