/**
 * 平台适配器抽象接口
 * 支持微信、小红书、微博、抖音等多平台发布
 */
export interface PlatformAdapter {
  /**
   * 获取平台名称
   */
  getPlatformName(): string;

  /**
   * 获取平台类型
   */
  getPlatformType(): PlatformType;

  /**
   * 初始化适配器
   */
  initialize(): Promise<void>;

  /**
   * 健康检查
   */
  healthCheck(): Promise<PlatformHealthStatus>;

  /**
   * 发布内容
   */
  publishContent(content: PublishContentInput): Promise<PublishResult>;

  /**
   * 获取发布状态
   */
  getPublishStatus(publishId: string): Promise<PublishStatus>;

  /**
   * 更新已发布内容
   */
  updateContent(publishId: string, content: Partial<PublishContentInput>): Promise<PublishResult>;

  /**
   * 删除已发布内容
   */
  deleteContent(publishId: string): Promise<void>;

  /**
   * 获取平台统计数据
   */
  getPlatformStats(): Promise<PlatformStats>;

  /**
   * 清理资源
   */
  cleanup(): Promise<void>;
}

/**
 * 平台类型枚举
 */
export enum PlatformType {
  WECHAT = 'wechat',       // 微信公众号
  XIAOHONGSHU = 'xiaohongshu', // 小红书
  WEIBO = 'weibo',         // 微博
  DOUYIN = 'douyin',       // 抖音
  TIKTOK = 'tiktok',       // TikTok（国际版）
  BILIBILI = 'bilibili',   // B站
  KUAISHOU = 'kuaishou',   // 快手
  OTHER = 'other',         // 其他平台
}

/**
 * 发布内容输入
 */
export interface PublishContentInput {
  /** 内容标题 */
  title: string;
  /** 正文内容（支持HTML/Markdown） */
  content: string;
  /** 摘要/导语 */
  summary?: string;
  /** 封面图片URL列表 */
  coverImages?: string[];
  /** 正文图片URL列表 */
  contentImages?: string[];
  /** 视频URL */
  videoUrl?: string;
  /** 标签/话题 */
  tags?: string[];
  /** 发布时间（立即发布或定时发布） */
  publishAt?: Date;
  /** 地理位置信息 */
  location?: LocationInfo;
  /** @提及的用户 */
  mentions?: string[];
  /** 商品链接（电商相关） */
  productLinks?: ProductLink[];
  /** 外部链接 */
  externalLinks?: ExternalLink[];
  /** 元数据（平台特定配置） */
  metadata?: Record<string, any>;
  /** 租户ID */
  tenantId?: string;
  /** 创建用户ID */
  createdBy?: string;
  /** 工作流ID（关联审批流程） */
  workflowId?: string;
  /** 草稿ID */
  draftId?: string;
}

/**
 * 发布结果
 */
export interface PublishResult {
  /** 发布ID（平台返回的唯一标识） */
  publishId: string;
  /** 平台类型 */
  platform: PlatformType;
  /** 发布状态 */
  status: PublishStatusType;
  /** 发布URL */
  url?: string;
  /** 平台返回的原始数据 */
  rawResponse?: any;
  /** 发布时间 */
  publishedAt?: Date;
  /** 错误信息（如果发布失败） */
  error?: string;
  /** 平台特定的元数据 */
  metadata?: Record<string, any>;
}

/**
 * 发布状态类型
 */
export enum PublishStatusType {
  DRAFT = 'draft',           // 草稿
  PENDING = 'pending',       // 等待发布
  PUBLISHING = 'publishing', // 发布中
  PUBLISHED = 'published',   // 已发布
  FAILED = 'failed',         // 发布失败
  DELETED = 'deleted',       // 已删除
  SCHEDULED = 'scheduled',   // 定时发布
}

/**
 * 发布状态详情
 */
export interface PublishStatus {
  publishId: string;
  status: PublishStatusType;
  progress?: number; // 0-100
  message?: string;
  lastUpdated: Date;
  retryCount?: number;
  nextRetryAt?: Date;
}

/**
 * 平台健康状态
 */
export interface PlatformHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  lastChecked: Date;
  metrics?: {
    availability: number; // 0-100
    latency: number; // 毫秒
    successRate: number; // 0-100
    quotaUsed: number; // API配额使用情况
    quotaRemaining: number; // 剩余配额
  };
}

/**
 * 平台统计信息
 */
export interface PlatformStats {
  platform: PlatformType;
  totalPublished: number;
  totalFailed: number;
  totalScheduled: number;
  averagePublishTime: number; // 平均发布耗时（毫秒）
  successRate: number; // 成功率（0-100）
  lastPublishAt?: Date;
  quotaInfo?: {
    dailyLimit: number;
    usedToday: number;
    remainingToday: number;
    resetAt: Date;
  };
}

/**
 * 地理位置信息
 */
export interface LocationInfo {
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
}

/**
 * 商品链接
 */
export interface ProductLink {
  title: string;
  url: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  description?: string;
}

/**
 * 外部链接
 */
export interface ExternalLink {
  title: string;
  url: string;
  description?: string;
}

/**
 * 平台配置
 */
export interface PlatformConfig {
  type: PlatformType;
  name: string;
  enabled: boolean;
  credentials: PlatformCredentials;
  options?: PlatformOptions;
  quota?: PlatformQuota;
  webhookUrl?: string;
}

/**
 * 平台凭证（各平台不同）
 */
export type PlatformCredentials =
  | WechatCredentials
  | XHSCredentials
  | WeiboCredentials
  | DouyinCredentials
  | OtherPlatformCredentials;

/**
 * 微信公众号凭证
 */
export interface WechatCredentials {
  appId: string;
  appSecret: string;
  accessToken?: string;
  accessTokenExpiresAt?: Date;
  refreshToken?: string;
  wechatId: string; // 公众号原始ID
  wechatName: string; // 公众号名称
  encodingAESKey?: string; // 消息加解密密钥
  token?: string; // 服务器配置令牌
}

/**
 * 小红书凭证
 */
export interface XHSCredentials {
  username: string;
  password?: string;
  sessionToken?: string;
  cookies?: string; // 序列化的cookie
  deviceId?: string;
  userId?: string;
  xhsToken?: string;
}

/**
 * 微博凭证
 */
export interface WeiboCredentials {
  appKey: string;
  appSecret: string;
  accessToken?: string;
  refreshToken?: string;
  uid?: string; // 微博用户ID
  screenName?: string; // 微博昵称
}

/**
 * 抖音凭证
 */
export interface DouyinCredentials {
  clientKey: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
  openId?: string;
  unionId?: string;
}

/**
 * 其他平台凭证
 */
export interface OtherPlatformCredentials {
  type: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  username?: string;
  password?: string;
  customFields?: Record<string, string>;
}

/**
 * 平台选项
 */
export interface PlatformOptions {
  /** 发布失败重试次数 */
  maxRetries?: number;
  /** 重试间隔（毫秒） */
  retryDelay?: number;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 是否启用代理 */
  useProxy?: boolean;
  /** 代理地址 */
  proxyUrl?: string;
  /** 是否验证SSL证书 */
  verifySSL?: boolean;
  /** 请求头自定义 */
  customHeaders?: Record<string, string>;
  /** 平台特定选项 */
  platformSpecific?: Record<string, any>;
}

/**
 * 平台配额
 */
export interface PlatformQuota {
  /** 每日发布限额 */
  dailyLimit: number;
  /** 每分钟请求限额 */
  perMinuteLimit?: number;
  /** 每小时请求限额 */
  perHourLimit?: number;
  /** 文件大小限制（字节） */
  maxFileSize?: number;
  /** 图片数量限制 */
  maxImages?: number;
  /** 视频大小限制（字节） */
  maxVideoSize?: number;
  /** 视频时长限制（秒） */
  maxVideoDuration?: number;
}