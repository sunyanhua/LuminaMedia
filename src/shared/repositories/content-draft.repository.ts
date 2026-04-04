import { TenantRepository } from './tenant.repository';
import { ContentDraft } from '../../entities/content-draft.entity';
import { Platform } from '../enums/platform.enum';
import { GenerationMethod } from '../enums/generation-method.enum';

/**
 * ContentDraft实体的租户感知Repository
 */
export class ContentDraftRepository extends TenantRepository<ContentDraft> {
  // 可以添加实体特定的查询方法
  async findByPlatform(platform: Platform): Promise<ContentDraft[]> {
    return this.createQueryBuilder('draft')
      .where('draft.platformType = :platform', { platform })
      .orderBy('draft.createdAt', 'DESC')
      .getMany();
  }

  async findByUser(userId: string): Promise<ContentDraft[]> {
    return this.createQueryBuilder('draft')
      .where('draft.userId = :userId', { userId })
      .orderBy('draft.createdAt', 'DESC')
      .getMany();
  }

  async findHighQualityDrafts(minScore: number): Promise<ContentDraft[]> {
    return this.createQueryBuilder('draft')
      .where('draft.qualityScore >= :minScore', { minScore })
      .orderBy('draft.qualityScore', 'DESC')
      .getMany();
  }

  async findByGenerationMethod(method: GenerationMethod): Promise<ContentDraft[]> {
    return this.createQueryBuilder('draft')
      .where('draft.generatedBy = :method', { method })
      .orderBy('draft.createdAt', 'DESC')
      .getMany();
  }

  async findDraftsWithoutPublishTasks(): Promise<ContentDraft[]> {
    return this.createQueryBuilder('draft')
      .leftJoinAndSelect('draft.publishTasks', 'tasks')
      .where('tasks.id IS NULL')
      .getMany();
  }
}
