"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentDraftRepository = void 0;
const tenant_repository_1 = require("./tenant.repository");
class ContentDraftRepository extends tenant_repository_1.TenantRepository {
    async findByPlatform(platform) {
        return this.createQueryBuilder('draft')
            .where('draft.platformType = :platform', { platform })
            .orderBy('draft.createdAt', 'DESC')
            .getMany();
    }
    async findByUser(userId) {
        return this.createQueryBuilder('draft')
            .where('draft.userId = :userId', { userId })
            .orderBy('draft.createdAt', 'DESC')
            .getMany();
    }
    async findHighQualityDrafts(minScore) {
        return this.createQueryBuilder('draft')
            .where('draft.qualityScore >= :minScore', { minScore })
            .orderBy('draft.qualityScore', 'DESC')
            .getMany();
    }
    async findByGenerationMethod(method) {
        return this.createQueryBuilder('draft')
            .where('draft.generatedBy = :method', { method })
            .orderBy('draft.createdAt', 'DESC')
            .getMany();
    }
    async findDraftsWithoutPublishTasks() {
        return this.createQueryBuilder('draft')
            .leftJoinAndSelect('draft.publishTasks', 'tasks')
            .where('tasks.id IS NULL')
            .getMany();
    }
}
exports.ContentDraftRepository = ContentDraftRepository;
//# sourceMappingURL=content-draft.repository.js.map