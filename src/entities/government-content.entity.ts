import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('government_contents')
export class GovernmentContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'date' })
  publishDate: Date;

  @Column({ type: 'varchar', length: 100 })
  author: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'published' | 'archived';

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  sourceUrl?: string;

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