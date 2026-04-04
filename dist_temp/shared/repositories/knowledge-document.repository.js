"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeDocumentRepository = void 0;
const tenant_repository_1 = require("./tenant.repository");
const knowledge_document_entity_1 = require("../../entities/knowledge-document.entity");
class KnowledgeDocumentRepository extends tenant_repository_1.TenantRepository {
    async findByStatus(status) {
        return this.createQueryBuilder('doc')
            .where('doc.status = :status', { status })
            .orderBy('doc.updatedAt', 'DESC')
            .getMany();
    }
    async findByProcessingStatus(processingStatus) {
        return this.createQueryBuilder('doc')
            .where('doc.processingStatus = :processingStatus', { processingStatus })
            .orderBy('doc.updatedAt', 'DESC')
            .getMany();
    }
    async findBySourceType(sourceType) {
        return this.createQueryBuilder('doc')
            .where('doc.sourceType = :sourceType', { sourceType })
            .orderBy('doc.createdAt', 'DESC')
            .getMany();
    }
    async findByCategory(category) {
        return this.createQueryBuilder('doc')
            .where('doc.category = :category', { category })
            .orderBy('doc.createdAt', 'DESC')
            .getMany();
    }
    async findByTag(tag) {
        return this.createQueryBuilder('doc')
            .where('JSON_CONTAINS(doc.tags, :tag)', { tag: JSON.stringify(tag) })
            .orderBy('doc.createdAt', 'DESC')
            .getMany();
    }
    async findByContentHash(contentHash) {
        return this.createQueryBuilder('doc')
            .where('doc.contentHash = :contentHash', { contentHash })
            .getOne();
    }
    async findVectorizedDocuments(limit) {
        const queryBuilder = this.createQueryBuilder('doc')
            .where('doc.processingStatus IN (:...statuses)', {
            statuses: [
                knowledge_document_entity_1.DocumentProcessingStatus.VECTORIZED,
                knowledge_document_entity_1.DocumentProcessingStatus.ANALYZED,
            ],
        })
            .andWhere('doc.status = :activeStatus', {
            activeStatus: knowledge_document_entity_1.DocumentStatus.ACTIVE,
        })
            .orderBy('doc.vectorizedAt', 'DESC');
        if (limit) {
            queryBuilder.take(limit);
        }
        return queryBuilder.getMany();
    }
    async findPendingProcessing(limit) {
        const queryBuilder = this.createQueryBuilder('doc')
            .where('doc.processingStatus IN (:...statuses)', {
            statuses: [
                knowledge_document_entity_1.DocumentProcessingStatus.PENDING,
                knowledge_document_entity_1.DocumentProcessingStatus.FAILED,
            ],
        })
            .andWhere('doc.status = :activeStatus', {
            activeStatus: knowledge_document_entity_1.DocumentStatus.ACTIVE,
        })
            .orderBy('doc.createdAt', 'ASC');
        if (limit) {
            queryBuilder.take(limit);
        }
        return queryBuilder.getMany();
    }
    async searchDocuments(query, options) {
        const { category, sourceType, limit = 50 } = options || {};
        const queryBuilder = this.createQueryBuilder('doc')
            .where('(doc.title LIKE :query OR doc.content LIKE :query)', {
            query: `%${query}%`,
        })
            .andWhere('doc.status = :activeStatus', {
            activeStatus: knowledge_document_entity_1.DocumentStatus.ACTIVE,
        })
            .orderBy('doc.updatedAt', 'DESC');
        if (category) {
            queryBuilder.andWhere('doc.category = :category', { category });
        }
        if (sourceType) {
            queryBuilder.andWhere('doc.sourceType = :sourceType', { sourceType });
        }
        if (limit) {
            queryBuilder.take(limit);
        }
        return queryBuilder.getMany();
    }
    async getCategoryStats() {
        const results = await this.createQueryBuilder('doc')
            .select('doc.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .where('doc.category IS NOT NULL')
            .andWhere('doc.status = :activeStatus', {
            activeStatus: knowledge_document_entity_1.DocumentStatus.ACTIVE,
        })
            .groupBy('doc.category')
            .orderBy('count', 'DESC')
            .getRawMany();
        return results.map((row) => ({
            category: row.category,
            count: parseInt(row.count, 10),
        }));
    }
    async getSourceTypeStats() {
        const results = await this.createQueryBuilder('doc')
            .select('doc.sourceType', 'sourceType')
            .addSelect('COUNT(*)', 'count')
            .where('doc.status = :activeStatus', {
            activeStatus: knowledge_document_entity_1.DocumentStatus.ACTIVE,
        })
            .groupBy('doc.sourceType')
            .orderBy('count', 'DESC')
            .getRawMany();
        return results.map((row) => ({
            sourceType: row.sourceType,
            count: parseInt(row.count, 10),
        }));
    }
    async getQualityStats() {
        const result = await this.createQueryBuilder('doc')
            .select("AVG(JSON_EXTRACT(doc.quality_score, '$.overall'))", 'avgOverall')
            .addSelect("AVG(JSON_EXTRACT(doc.quality_score, '$.completeness'))", 'avgCompleteness')
            .addSelect("AVG(JSON_EXTRACT(doc.quality_score, '$.relevance'))", 'avgRelevance')
            .addSelect("AVG(JSON_EXTRACT(doc.quality_score, '$.freshness'))", 'avgFreshness')
            .addSelect("AVG(JSON_EXTRACT(doc.quality_score, '$.authority'))", 'avgAuthority')
            .addSelect("AVG(JSON_EXTRACT(doc.quality_score, '$.readability'))", 'avgReadability')
            .where('doc.quality_score IS NOT NULL')
            .andWhere('doc.status = :activeStatus', {
            activeStatus: knowledge_document_entity_1.DocumentStatus.ACTIVE,
        })
            .getRawOne();
        return {
            avgOverall: parseFloat(result?.avgOverall) || 0,
            avgCompleteness: parseFloat(result?.avgCompleteness) || 0,
            avgRelevance: parseFloat(result?.avgRelevance) || 0,
            avgFreshness: parseFloat(result?.avgFreshness) || 0,
            avgAuthority: parseFloat(result?.avgAuthority) || 0,
            avgReadability: parseFloat(result?.avgReadability) || 0,
        };
    }
    async batchUpdateProcessingStatus(documentIds, processingStatus, errorMessage) {
        if (documentIds.length === 0)
            return;
        await this.createQueryBuilder()
            .update(knowledge_document_entity_1.KnowledgeDocument)
            .set({
            processingStatus,
            processingError: errorMessage || undefined,
            updatedAt: () => 'CURRENT_TIMESTAMP',
        })
            .where('id IN (:...ids)', { ids: documentIds })
            .execute();
    }
    async updateVectorInfo(documentId, vectorId, processingStatus = knowledge_document_entity_1.DocumentProcessingStatus.VECTORIZED) {
        await this.createQueryBuilder()
            .update(knowledge_document_entity_1.KnowledgeDocument)
            .set({
            vectorId,
            processingStatus,
            vectorizedAt: () => 'CURRENT_TIMESTAMP',
            updatedAt: () => 'CURRENT_TIMESTAMP',
        })
            .where('id = :id', { id: documentId })
            .execute();
    }
    async getCountByStatus() {
        const results = await this.createQueryBuilder('doc')
            .select('doc.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('doc.status')
            .getRawMany();
        return results.map((row) => ({
            status: row.status,
            count: parseInt(row.count, 10),
        }));
    }
    async getCountByProcessingStatus() {
        const results = await this.createQueryBuilder('doc')
            .select('doc.processingStatus', 'processingStatus')
            .addSelect('COUNT(*)', 'count')
            .groupBy('doc.processingStatus')
            .getRawMany();
        return results.map((row) => ({
            processingStatus: row.processingStatus,
            count: parseInt(row.count, 10),
        }));
    }
}
exports.KnowledgeDocumentRepository = KnowledgeDocumentRepository;
//# sourceMappingURL=knowledge-document.repository.js.map