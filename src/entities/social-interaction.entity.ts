import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('social_interactions')
export class SocialInteraction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  platform: string; // weibo, wechat, xiaohongshu, etc.

  @Column({ type: 'varchar', length: 50 })
  interactionType: string; // comment, share, like, mention

  @Column({ type: 'varchar', length: 100 })
  targetId: string; // ID of the target post/article

  @Column({ type: 'varchar', length: 255 })
  targetUrl: string; // URL of the target post/article

  @Column({ type: 'text', nullable: true })
  content?: string; // Comment or share content

  @Column({ type: 'varchar', length: 100 })
  sourceUser: string; // Username of the person who made the interaction

  @Column({ type: 'datetime' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 20, default: 'neutral' })
  sentiment: 'positive' | 'negative' | 'neutral';

  @Column({ type: 'int', default: 0 })
  engagementCount: number; // likes, shares, etc.

  @Column({ type: 'varchar', length: 100, default: 'default-tenant' })
  tenantId: string;

  @Column({ default: false })
  isPreset: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  demoScenario?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}