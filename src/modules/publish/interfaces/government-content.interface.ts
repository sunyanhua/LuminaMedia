/**
 * 政府场景内容接口定义
 * 支持公文发布、防诈骗宣传、政策解读等政府场景内容生成
 */

/**
 * 政府内容类型
 */
export enum GovernmentContentType {
  OFFICIAL_DOCUMENT = 'official_document', // 公文发布
  ANTI_FRAUD = 'anti_fraud', // 防诈骗宣传
  POLICY_INTERPRETATION = 'policy_interpretation', // 政策解读
  GOVERNMENT_SERVICE = 'government_service', // 政务服务
  PUBLIC_ANNOUNCEMENT = 'public_announcement', // 公共通知
  EMERGENCY_RESPONSE = 'emergency_response', // 应急响应
}

/**
 * 政府内容风格
 */
export enum GovernmentContentStyle {
  FORMAL = 'formal', // 正式公文
  SERIOUS = 'serious', // 严肃警示
  AUTHORITATIVE = 'authoritative', // 权威解读
  INSTRUCTIVE = 'instructive', // 指导性
  FRIENDLY = 'friendly', // 亲民友好
}

/**
 * 政府内容合规级别
 */
export enum ComplianceLevel {
  HIGH = 'high', // 高合规性要求（如红头文件）
  MEDIUM = 'medium', // 中等合规性要求
  LOW = 'low', // 低合规性要求（如宣传材料）
}

/**
 * 政府公文头信息
 */
export interface DocumentHeader {
  /** 发文机关 */
  issuingAuthority: string;
  /** 发文字号 */
  documentNumber?: string;
  /** 签发人 */
  issuer?: string;
  /** 秘密等级 */
  securityLevel?: '公开' | '内部公开' | '秘密' | '机密' | '绝密';
  /** 紧急程度 */
  urgencyLevel?: '平件' | '急件' | '特急';
  /** 标题 */
  title: string;
  /** 主送机关 */
  mainRecipient?: string;
  /** 抄送机关 */
  copyRecipient?: string;
  /** 发文日期 */
  issueDate: string;
}

/**
 * 政府公文正文
 */
export interface DocumentBody {
  /** 前言/背景 */
  preface?: string;
  /** 主体内容（分章节） */
  sections: DocumentSection[];
  /** 结尾/要求 */
  conclusion?: string;
}

/**
 * 公文章节
 */
export interface DocumentSection {
  /** 章节标题 */
  title: string;
  /** 章节内容 */
  content: string;
  /** 子章节 */
  subsections?: DocumentSection[];
}

/**
 * 公文尾部
 */
export interface DocumentFooter {
  /** 联系人 */
  contactPerson?: string;
  /** 联系方式 */
  contactInfo?: string;
  /** 附件列表 */
  attachments?: string[];
  /** 印发机关 */
  printingAuthority?: string;
  /** 印发日期 */
  printingDate?: string;
  /** 印发份数 */
  copies?: number;
}

/**
 * 政府公文完整结构
 */
export interface OfficialDocument {
  /** 文档类型 */
  type: GovernmentContentType.OFFICIAL_DOCUMENT;
  /** 文档头 */
  header: DocumentHeader;
  /** 文档正文 */
  body: DocumentBody;
  /** 文档尾部 */
  footer?: DocumentFooter;
  /** 样式要求 */
  style: GovernmentContentStyle.FORMAL;
  /** 合规级别 */
  complianceLevel: ComplianceLevel.HIGH;
}

/**
 * 防诈骗宣传内容
 */
export interface AntiFraudContent {
  /** 内容类型 */
  type: GovernmentContentType.ANTI_FRAUD;
  /** 标题 */
  title: string;
  /** 诈骗类型 */
  fraudType: string;
  /** 近期案例 */
  recentCase: string;
  /** 诈骗手法 */
  fraudMethods: string[];
  /** 识别要点 */
  identificationPoints: string[];
  /** 防范措施 */
  preventionMeasures: string[];
  /** 紧急应对 */
  emergencyResponse: string[];
  /** 举报渠道 */
  reportingChannels: string[];
  /** 样式要求 */
  style: GovernmentContentStyle.SERIOUS;
  /** 合规级别 */
  complianceLevel: ComplianceLevel.MEDIUM;
  /** 视觉样式建议 */
  visualStyle?: '红头文件样式' | '警示标志' | '图文并茂';
}

/**
 * 政策解读内容
 */
export interface PolicyInterpretationContent {
  /** 内容类型 */
  type: GovernmentContentType.POLICY_INTERPRETATION;
  /** 政策名称 */
  policyName: string;
  /** 发文机关 */
  issuingAuthority: string;
  /** 文号 */
  documentNumber?: string;
  /** 发布日期 */
  issueDate: string;
  /** 政策背景 */
  background: string;
  /** 政策要点 */
  keyPoints: PolicyKeyPoint[];
  /** 适用范围 */
  applicableScope: string;
  /** 操作指南 */
  operationGuide: string[];
  /** 常见问题 */
  faqs: FAQ[];
  /** 咨询方式 */
  consultationMethods: string[];
  /** 样式要求 */
  style: GovernmentContentStyle.AUTHORITATIVE;
  /** 合规级别 */
  complianceLevel: ComplianceLevel.HIGH;
}

/**
 * 政策要点
 */
export interface PolicyKeyPoint {
  /** 要点标题 */
  title: string;
  /** 要点内容 */
  content: string;
  /** 相关条款 */
  relatedClauses?: string[];
  /** 实施时间 */
  implementationTime?: string;
}

/**
 * 常见问题
 */
export interface FAQ {
  /** 问题 */
  question: string;
  /** 答案 */
  answer: string;
  /** 相关依据 */
  reference?: string;
}

/**
 * 政务服务内容
 */
export interface GovernmentServiceContent {
  /** 内容类型 */
  type: GovernmentContentType.GOVERNMENT_SERVICE;
  /** 服务名称 */
  serviceName: string;
  /** 主管部门 */
  responsibleDepartment: string;
  /** 服务对象 */
  targetAudience: string;
  /** 办理条件 */
  eligibility: string[];
  /** 所需材料 */
  requiredDocuments: string[];
  /** 办理流程 */
  procedures: ProcedureStep[];
  /** 办理时限 */
  processingTime: string;
  /** 收费标准 */
  feeStandard?: string;
  /** 办理地点 */
  locations: ServiceLocation[];
  /** 在线办理网址 */
  onlineUrl?: string;
  /** 咨询电话 */
  contactPhone?: string;
  /** 样式要求 */
  style: GovernmentContentStyle.INSTRUCTIVE;
  /** 合规级别 */
  complianceLevel: ComplianceLevel.MEDIUM;
}

/**
 * 办理流程步骤
 */
export interface ProcedureStep {
  /** 步骤序号 */
  step: number;
  /** 步骤名称 */
  name: string;
  /** 步骤描述 */
  description: string;
  /** 办理方式（线上/线下） */
  method: 'online' | 'offline';
  /** 预计耗时 */
  estimatedTime?: string;
}

/**
 * 服务地点
 */
export interface ServiceLocation {
  /** 地点名称 */
  name: string;
  /** 地址 */
  address: string;
  /** 办公时间 */
  officeHours?: string;
  /** 联系电话 */
  phone?: string;
}

/**
 * 公共通知内容
 */
export interface PublicAnnouncementContent {
  /** 内容类型 */
  type: GovernmentContentType.PUBLIC_ANNOUNCEMENT;
  /** 通知标题 */
  title: string;
  /** 通知单位 */
  issuingUnit: string;
  /** 通知时间 */
  announcementTime: string;
  /** 通知正文 */
  content: string;
  /** 相关区域 */
  affectedAreas?: string[];
  /** 生效时间 */
  effectiveTime?: string;
  /** 截止时间 */
  deadline?: string;
  /** 注意事项 */
  precautions?: string[];
  /** 联系方式 */
  contactInfo?: string;
  /** 样式要求 */
  style: GovernmentContentStyle.FRIENDLY;
  /** 合规级别 */
  complianceLevel: ComplianceLevel.LOW;
}

/**
 * 应急响应内容
 */
export interface EmergencyResponseContent {
  /** 内容类型 */
  type: GovernmentContentType.EMERGENCY_RESPONSE;
  /** 事件类型 */
  eventType: '自然灾害' | '事故灾难' | '公共卫生' | '社会安全';
  /** 事件级别 */
  eventLevel: '一般' | '较大' | '重大' | '特别重大';
  /** 标题 */
  title: string;
  /** 发布单位 */
  issuingUnit: string;
  /** 发布时间 */
  issueTime: string;
  /** 事件概况 */
  eventOverview: string;
  /** 影响范围 */
  affectedAreas: string[];
  /** 应对措施 */
  responseMeasures: string[];
  /** 避难点 */
  shelters?: ShelterInfo[];
  /** 救援资源 */
  rescueResources?: RescueResource[];
  /** 紧急联系方式 */
  emergencyContacts: EmergencyContact[];
  /** 样式要求 */
  style: GovernmentContentStyle.SERIOUS;
  /** 合规级别 */
  complianceLevel: ComplianceLevel.HIGH;
}

/**
 * 避难点信息
 */
export interface ShelterInfo {
  /** 避难点名称 */
  name: string;
  /** 地址 */
  address: string;
  /** 容量 */
  capacity?: number;
  /** 当前人数 */
  currentOccupancy?: number;
  /** 联系电话 */
  contactPhone?: string;
}

/**
 * 救援资源
 */
export interface RescueResource {
  /** 资源类型 */
  type: string;
  /** 资源数量 */
  quantity: number;
  /** 所在位置 */
  location: string;
  /** 负责人 */
  personInCharge?: string;
  /** 联系电话 */
  contactPhone?: string;
}

/**
 * 紧急联系方式
 */
export interface EmergencyContact {
  /** 单位/部门 */
  department: string;
  /** 联系电话 */
  phone: string;
  /** 联系人 */
  contactPerson?: string;
  /** 职责 */
  responsibility?: string;
}

/**
 * 政府内容通用接口
 */
export type GovernmentContent =
  | OfficialDocument
  | AntiFraudContent
  | PolicyInterpretationContent
  | GovernmentServiceContent
  | PublicAnnouncementContent
  | EmergencyResponseContent;

/**
 * 政府内容生成请求
 */
export interface GovernmentContentRequest {
  /** 内容类型 */
  contentType: GovernmentContentType;
  /** 内容主题 */
  theme: string;
  /** 目标受众 */
  targetAudience?: string;
  /** 风格要求 */
  style?: GovernmentContentStyle;
  /** 合规级别要求 */
  complianceLevel?: ComplianceLevel;
  /** 内容长度（短/中/长） */
  length?: 'short' | 'medium' | 'long';
  /** 具体参数 */
  params?: Record<string, any>;
  /** 租户ID */
  tenantId?: string;
  /** 用户ID */
  userId?: string;
}

/**
 * 政府内容生成响应
 */
export interface GovernmentContentResponse {
  /** 生成状态 */
  success: boolean;
  /** 生成的内容 */
  content?: GovernmentContent;
  /** 错误信息 */
  error?: string;
  /** 生成耗时（毫秒） */
  generationTime?: number;
  /** 合规性检查结果 */
  complianceCheck?: ComplianceCheckResult;
  /** 建议的平台 */
  suggestedPlatforms?: string[];
  /** 内容摘要 */
  summary?: string;
}

/**
 * 合规性检查结果
 */
export interface ComplianceCheckResult {
  /** 是否通过 */
  passed: boolean;
  /** 合规分数（0-100） */
  score: number;
  /** 检查项 */
  items: ComplianceCheckItem[];
  /** 警告信息 */
  warnings: string[];
  /** 必须修改的问题 */
  requiredFixes: string[];
  /** 建议 */
  suggestions: string[];
}

/**
 * 合规性检查项
 */
export interface ComplianceCheckItem {
  /** 检查项名称 */
  name: string;
  /** 检查项描述 */
  description: string;
  /** 是否通过 */
  passed: boolean;
  /** 详细信息 */
  details?: string;
  /** 严重程度 */
  severity: 'high' | 'medium' | 'low';
}

/**
 * 政府内容模板
 */
export interface GovernmentContentTemplate {
  /** 模板ID */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 内容类型 */
  contentType: GovernmentContentType;
  /** 模板结构 */
  structure: Record<string, any>;
  /** 示例数据 */
  example: any;
  /** 字段说明 */
  fieldDescriptions: Record<string, string>;
  /** 风格建议 */
  styleSuggestions: string[];
  /** 合规要点 */
  compliancePoints: string[];
  /** 适用场景 */
  applicableScenarios: string[];
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 政府场景演示剧本
 */
export interface GovernmentScenarioScript {
  /** 剧本ID */
  id: string;
  /** 剧本名称 */
  name: string;
  /** 剧本描述 */
  description: string;
  /** 场景类型 */
  scenarioType: GovernmentContentType;
  /** 目标受众 */
  targetAudience: string;
  /** 演示时长（分钟） */
  duration: number;
  /** 演示步骤 */
  steps: ScenarioStep[];
  /** 所需数据 */
  requiredData: string[];
  /** 预期效果 */
  expectedOutcomes: string[];
  /** 注意事项 */
  precautions: string[];
  /** 创建时间 */
  createdAt: Date;
}

/**
 * 场景步骤
 */
export interface ScenarioStep {
  /** 步骤序号 */
  step: number;
  /** 步骤名称 */
  name: string;
  /** 步骤描述 */
  description: string;
  /** 操作动作 */
  action: string;
  /** 操作参数 */
  params?: Record<string, any>;
  /** 预期结果 */
  expectedResult: string;
  /** 演示要点 */
  demonstrationPoints: string[];
  /** 时间分配（秒） */
  timeAllocation?: number;
  /** 依赖步骤 */
  dependencies?: number[];
}

/**
 * 政府内容生成统计
 */
export interface GovernmentContentStats {
  /** 总生成次数 */
  totalGenerations: number;
  /** 各类型生成次数 */
  typeBreakdown: Record<GovernmentContentType, number>;
  /** 成功率 */
  successRate: number;
  /** 平均生成时间（毫秒） */
  averageGenerationTime: number;
  /** 合规检查通过率 */
  compliancePassRate: number;
  /** 最常用模板 */
  mostUsedTemplates: string[];
  /** 使用趋势 */
  usageTrend: {
    date: string;
    count: number;
  }[];
}