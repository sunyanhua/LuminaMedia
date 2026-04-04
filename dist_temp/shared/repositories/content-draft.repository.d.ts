import { TenantRepository } from './tenant.repository';
import { ContentDraft } from '../../entities/content-draft.entity';
import { Platform } from '../enums/platform.enum';
import { GenerationMethod } from '../enums/generation-method.enum';
export declare class ContentDraftRepository extends TenantRepository<ContentDraft> {
    findByPlatform(platform: Platform): Promise<ContentDraft[]>;
    findByUser(userId: string): Promise<ContentDraft[]>;
    findHighQualityDrafts(minScore: number): Promise<ContentDraft[]>;
    findByGenerationMethod(method: GenerationMethod): Promise<ContentDraft[]>;
    findDraftsWithoutPublishTasks(): Promise<ContentDraft[]>;
}
