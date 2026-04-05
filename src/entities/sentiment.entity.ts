import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantEntity } from '../shared/interfaces/tenant-entity.interface';
import { Tenant } from './tenant.entity';

export enum SentimentPlatform {
  WEIBO = 'weibo',
  WECHAT = 'wechat',
  DOUYIN = 'douyin',
  XIAOHONGSHU = 'xiaohongshu',
}

export enum SentimentType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
}

@Entity('sentiments')
@Index(['tenantId'])
export class Sentiment implements TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', default: 'default-tenant' })
  tenantId: string;

  @Column({
    type: 'enum',
    enum: SentimentPlatform,
    comment: '平台：微博、微信、抖音、小红书',
  })
  platform: SentimentPlatform;

  @Column('text', { comment: '舆情内容' })
  content: string;

  @Column({ comment: '作者/发布者' })
  author: string;

  @Column({ name: 'publish_time', type: 'timestamp', comment: '发布时间' })
  publishTime: Date;

  @Column({
    type: 'enum',
    enum: SentimentType,
    comment: '情感类型：正面、负面、中性',
  })
  sentiment: SentimentType;

  @Column({
    name: 'sentiment_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: '情感分数，范围-1到1，正数为正面，负数为负面',
  })
  sentimentScore: number;

  @Column({ name: 'read_count', default: 0, comment: '阅读数' })
  readCount: number;

  @Column({ name: 'share_count', default: 0, comment: '分享数' })
  shareCount: number;

  @Column({ name: 'comment_count', default: 0, comment: '评论数' })
  commentCount: number;

  @Column('simple-array', { nullable: true, comment: '关键词列表' })
  keywords: string[];

  @Column({ nullable: true, comment: '原文链接' })
  url: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.sentiments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id', referencedColumnName: 'id' })
  tenant: Tenant;
}