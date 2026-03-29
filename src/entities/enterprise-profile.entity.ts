import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
import { CustomerProfile } from './customer-profile.entity';
import { User } from './user.entity';

// 基础信息
export interface EnterpriseBasicInfo {
  industry: string;           // 行业
  scale: 'small' | 'medium' | 'large'; // 规模
  region: string;            // 地区
  foundingYear: number;      // 创立年份
  employeeCount?: number;    // 员工数量
  annualRevenue?: string;    // 年收入范围
  website?: string;          // 官网
  description?: string;      // 企业描述
}

// 品牌形象
export interface EnterpriseBrandImage {
  tone: string[];            // 语调风格
  values: string[];          // 品牌价值观
  personality: string[];     // 品牌人格
  visualStyle: string[];     // 视觉风格
  tagline?: string;          // 品牌标语
  colorPalette?: string[];   // 品牌色系
  logoStyle?: string;        // LOGO风格
}

// 内容偏好
export interface EnterpriseContentPreference {
  topics: string[];          // 偏好话题
  formats: string[];         // 内容格式（图文、视频等）
  frequency: string;         // 发布频率
  peakHours: number[];       // 高峰时段
  contentLength: string;     // 内容长度偏好
  languageStyle: string;     // 语言风格
  keyMessages: string[];     // 核心传播信息
}

// 禁忌限制
export interface EnterpriseRestrictions {
  forbiddenWords: string[];  // 禁忌词
  sensitiveTopics: string[]; // 敏感话题
  legalConstraints: string[]; // 法律限制
  culturalTaboos: string[];  // 文化禁忌
  competitorNames?: string[]; // 竞品名称（避免提及）
  politicalSensitivity?: string[]; // 政治敏感点
}

// 成功案例模式
export interface EnterpriseSuccessPattern {
  topic: string;             // 话题
  engagementRate: number;    // 参与率
  format: string;            // 内容格式
  timing: string;            // 发布时间
  audienceReaction: string;  // 受众反应
}

// 时间分析
export interface TimingAnalysis {
  dayOfWeek: string;         // 星期几
  hourOfDay: number;         // 小时
  engagementScore: number;   // 参与度分数
}

// 响应模式
export interface ResponsePattern {
  audienceSegment: string;   // 受众细分
  responseType: string;      // 响应类型（点赞、评论、转发）
  sentiment: 'positive' | 'neutral' | 'negative'; // 情感倾向
  commonFeedback: string[];  // 常见反馈
}

// 完整企业画像
export interface EnterpriseProfileData {
  basicInfo: EnterpriseBasicInfo;
  brandImage: EnterpriseBrandImage;
  contentPreference: EnterpriseContentPreference;
  restrictions: EnterpriseRestrictions;
  successPatterns: {
    highEngagementTopics: string[]; // 高参与度话题
    effectiveFormats: string[];     // 有效内容格式
    bestTiming: TimingAnalysis[];   // 最佳发布时间
    audienceResponse: ResponsePattern[]; // 受众反应模式
  };
  analysisSummary?: string;         // 分析摘要
  confidenceScores: {
    basicInfo: number;              // 基础信息置信度
    brandImage: number;             // 品牌形象置信度
    contentPreference: number;      // 内容偏好置信度
    restrictions: number;           // 禁忌限制置信度
    successPatterns: number;        // 成功模式置信度
  };
  lastUpdated: string;              // 最后更新时间
  version: number;                  // 画像版本
}

@Entity('enterprise_profiles')
@Index(['tenantId'])
@Index(['customerProfileId'])
@Index(['industry'])
@Index(['createdAt'])
export class EnterpriseProfile implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tenant_id',
    type: 'varchar',
    length: 36,
    default: 'default-tenant',
  })
  tenantId: string;

  // 关联客户档案
  @Column({ name: 'customer_profile_id', type: 'varchar', length: 36 })
  customerProfileId: string;

  @ManyToOne(() => CustomerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_profile_id' })
  customerProfile: CustomerProfile;

  // 创建者
  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  // 行业分类
  @Column({ type: 'varchar', length: 100 })
  industry: string;

  // 企业规模
  @Column({
    type: 'enum',
    enum: ['small', 'medium', 'large'],
    default: 'medium',
  })
  scale: 'small' | 'medium' | 'large';

  // 地区
  @Column({ type: 'varchar', length: 100 })
  region: string;

  // 完整画像数据（JSON格式）
  @Column({ name: 'profile_data', type: 'json' })
  profileData: EnterpriseProfileData;

  // 分析状态
  @Column({
    type: 'enum',
    enum: ['pending', 'analyzing', 'completed', 'failed'],
    default: 'pending',
  })
  status: 'pending' | 'analyzing' | 'completed' | 'failed';

  // 分析进度（0-100）
  @Column({ type: 'int', default: 0 })
  analysisProgress: number;

  // 分析错误信息
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  // 分析报告
  @Column({ name: 'analysis_report', type: 'json', nullable: true })
  analysisReport: Record<string, any>;

  // 版本管理
  @Column({ type: 'int', default: 1 })
  version: number;

  // 是否当前版本
  @Column({ name: 'is_current', type: 'boolean', default: true })
  isCurrent: boolean;

  // 上一个版本ID
  @Column({ name: 'previous_version_id', type: 'varchar', length: 36, nullable: true })
  previousVersionId: string;

  // 特征向量（用于相似性搜索）
  @Column({ name: 'feature_vector', type: 'json', nullable: true })
  featureVector: number[];

  // 特征提取时间
  @Column({ name: 'features_extracted_at', type: 'timestamp', nullable: true })
  featuresExtractedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}