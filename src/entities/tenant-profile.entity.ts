import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';

// 形象定位类型
export enum PositioningType {
  AUTHORITATIVE = 'authoritative', // 权威型
  PEOPLE_FRIENDLY = 'people_friendly', // 亲民型
  PROFESSIONAL = 'professional', // 专业型
  INNOVATIVE = 'innovative', // 创新型
  SERVICE_ORIENTED = 'service_oriented', // 服务型
  OTHER = 'other', // 其他
}

// 语言风格类型
export enum LanguageStyleType {
  FORMAL = 'formal', // 正式严谨
  CONCISE = 'concise', // 简洁明快
  VIVID = 'vivid', // 生动活泼
  PERSUASIVE = 'persuasive', // 说服力强
  POPULAR = 'popular', // 通俗易懂
  PROFESSIONAL = 'professional', // 专业术语
  OTHER = 'other', // 其他
}

// 视觉偏好类型
export enum VisualPreferenceType {
  MINIMALIST = 'minimalist', // 极简风格
  MODERN = 'modern', // 现代风格
  TRADITIONAL = 'traditional', // 传统风格
  COLORFUL = 'colorful', // 多彩风格
  GRADIENT = 'gradient', // 渐变风格
  FLAT = 'flat', // 扁平风格
  OTHER = 'other', // 其他
}

// 发布习惯 - 最佳时段
export enum PublishingTimePreference {
  MORNING = 'morning', // 早上 (8:00-10:00)
  NOON = 'noon', // 中午 (11:00-13:00)
  AFTERNOON = 'afternoon', // 下午 (14:00-16:00)
  EVENING = 'evening', // 晚上 (17:00-20:00)
  WEEKEND = 'weekend', // 周末
  WORKDAY = 'workday', // 工作日
  ANYTIME = 'anytime', // 随时
}

// 发布习惯 - 发布频率
export enum PublishingFrequency {
  DAILY = 'daily', // 每天
  WEEKLY_1_2 = 'weekly_1_2', // 每周1-2次
  WEEKLY_3_4 = 'weekly_3_4', // 每周3-4次
  WEEKLY_5 = 'weekly_5', // 每周5次以上
  MONTHLY_1_2 = 'monthly_1_2', // 每月1-2次
  OCCASIONAL = 'occasional', // 偶尔发布
  IRREGULAR = 'irregular', // 不定期
}

// 话题偏好标签接口
export interface TopicTag {
  name: string; // 标签名称
  weight: number; // 权重 (0-100)
  frequency: number; // 出现频率
}

// 视觉偏好详情接口
export interface VisualPreferenceDetail {
  primaryColor?: string; // 主色调
  secondaryColor?: string; // 辅色调
  fontFamily?: string; // 字体
  imageStyle?: string; // 图片风格
  layoutPreference?: string; // 版式偏好
}

// 发布习惯详情接口
export interface PublishingHabitsDetail {
  bestTime: PublishingTimePreference[]; // 最佳发布时段
  frequency: PublishingFrequency; // 发布频率
  preferredPlatforms: string[]; // 偏好平台
  contentLength: 'short' | 'medium' | 'long'; // 内容长度偏好
  postFormat: string[]; // 发布格式 (图文/视频/纯文字等)
}

// 画像原始数据接口
export interface ProfileRawData {
  analyzedDocuments: string[]; // 用于分析的文档ID列表
  aiModel: string; // 使用的AI模型
  aiPrompt: string; // AI提示词
  analysisDate: Date; // 分析日期
  confidence: number; // 置信度 (0-100)
  version: string; // 画像版本
  metadata?: Record<string, any>; // 扩展元数据
}

@Entity('tenant_profiles')
@Index(['tenantId'])
export class TenantProfile implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tenant_id',
    type: 'varchar',
    length: 36,
  })
  tenantId: string;

  // 形象定位
  @Column({
    type: 'enum',
    enum: PositioningType,
    nullable: true,
  })
  positioning: PositioningType;

  // 形象定位描述（AI生成的详细描述）
  @Column({ name: 'positioning_description', type: 'text', nullable: true })
  positioningDescription: string;

  // 形象定位标签（JSON数组）
  @Column({ name: 'positioning_tags', type: 'json', nullable: true })
  positioningTags: string[];

  // 语言风格
  @Column({
    name: 'language_style',
    type: 'enum',
    enum: LanguageStyleType,
    nullable: true,
  })
  languageStyle: LanguageStyleType;

  // 语言风格描述
  @Column({ name: 'language_style_description', type: 'text', nullable: true })
  languageStyleDescription: string;

  // 语言风格示例
  @Column({ name: 'language_style_examples', type: 'json', nullable: true })
  languageStyleExamples: string[];

  // 视觉偏好
  @Column({
    name: 'visual_preference',
    type: 'enum',
    enum: VisualPreferenceType,
    nullable: true,
  })
  visualPreference: VisualPreferenceType;

  // 视觉偏好详情（JSON）
  @Column({ name: 'visual_preference_detail', type: 'json', nullable: true })
  visualPreferenceDetail: VisualPreferenceDetail;

  // 话题偏好（JSON数组）
  @Column({ name: 'topic_preference', type: 'json', nullable: true })
  topicPreference: TopicTag[];

  // 发布习惯详情（JSON）
  @Column({ name: 'publishing_habits', type: 'json', nullable: true })
  publishingHabits: PublishingHabitsDetail;

  // 画像状态
  @Column({
    type: 'enum',
    enum: ['draft', 'generated', 'manually_edited', 'published'],
    default: 'draft',
  })
  status: 'draft' | 'generated' | 'manually_edited' | 'published';

  // AI生成的原始数据（JSON）
  @Column({ name: 'raw_data', type: 'json', nullable: true })
  rawData: ProfileRawData;

  // 生成时间
  @Column({ name: 'generated_at', type: 'timestamp', nullable: true })
  generatedAt: Date;

  // 最后编辑时间
  @Column({ name: 'last_edited_at', type: 'timestamp', nullable: true })
  lastEditedAt: Date;

  // 编辑者
  @Column({ name: 'last_edited_by', type: 'varchar', length: 36, nullable: true })
  lastEditedBy: string;

  // 版本号
  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 软删除标记
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  // 辅助方法：检查画像是否已生成
  isGenerated(): boolean {
    return this.status === 'generated' || this.status === 'manually_edited' || this.status === 'published';
  }

  // 辅助方法：检查画像是否可发布
  isPublishable(): boolean {
    return this.status === 'generated' || this.status === 'manually_edited';
  }

  // 辅助方法：获取话题标签按权重排序
  getSortedTopicTags(): TopicTag[] {
    if (!this.topicPreference || this.topicPreference.length === 0) {
      return [];
    }
    return [...this.topicPreference].sort((a, b) => b.weight - a.weight);
  }
}