"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseProfileRepository = void 0;
const tenant_repository_1 = require("./tenant.repository");
const enterprise_profile_entity_1 = require("../../entities/enterprise-profile.entity");
class EnterpriseProfileRepository extends tenant_repository_1.TenantRepository {
    async findByCustomerProfileId(customerProfileId) {
        return this.createQueryBuilder('profile')
            .where('profile.customerProfileId = :customerProfileId', {
            customerProfileId,
        })
            .orderBy('profile.version', 'DESC')
            .getMany();
    }
    async findCurrentByCustomerProfileId(customerProfileId) {
        return this.createQueryBuilder('profile')
            .where('profile.customerProfileId = :customerProfileId', {
            customerProfileId,
        })
            .andWhere('profile.isCurrent = :isCurrent', { isCurrent: true })
            .getOne();
    }
    async findByIndustry(industry) {
        return this.createQueryBuilder('profile')
            .where('profile.industry LIKE :industry', { industry: `%${industry}%` })
            .andWhere('profile.isCurrent = :isCurrent', { isCurrent: true })
            .getMany();
    }
    async findSimilarProfiles(featureVector, limit = 5, excludeProfileId) {
        if (!featureVector || featureVector.length === 0) {
            return this.find({ where: { isCurrent: true }, take: limit });
        }
        const queryBuilder = this.createQueryBuilder('profile')
            .where('profile.featureVector IS NOT NULL')
            .andWhere('profile.isCurrent = :isCurrent', { isCurrent: true })
            .orderBy('profile.updatedAt', 'DESC')
            .take(limit);
        if (excludeProfileId) {
            queryBuilder.andWhere('profile.id != :excludeProfileId', {
                excludeProfileId,
            });
        }
        return queryBuilder.getMany();
    }
    async getVersionHistory(customerProfileId) {
        return this.createQueryBuilder('profile')
            .where('profile.customerProfileId = :customerProfileId', {
            customerProfileId,
        })
            .orderBy('profile.version', 'DESC')
            .getMany();
    }
    async updateVersionStatus(customerProfileId, newCurrentVersionId) {
        await this.createQueryBuilder()
            .update(enterprise_profile_entity_1.EnterpriseProfile)
            .set({ isCurrent: false })
            .where('customerProfileId = :customerProfileId', { customerProfileId })
            .execute();
        await this.createQueryBuilder()
            .update(enterprise_profile_entity_1.EnterpriseProfile)
            .set({ isCurrent: true })
            .where('id = :id', { id: newCurrentVersionId })
            .execute();
    }
    async getIndustryStats() {
        const results = await this.createQueryBuilder('profile')
            .select('profile.industry', 'industry')
            .addSelect('COUNT(*)', 'count')
            .where('profile.isCurrent = :isCurrent', { isCurrent: true })
            .groupBy('profile.industry')
            .orderBy('count', 'DESC')
            .getRawMany();
        return results.map((row) => ({
            industry: row.industry,
            count: parseInt(row.count, 10),
        }));
    }
    async getAnalysisStatusStats() {
        const results = await this.createQueryBuilder('profile')
            .select('profile.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .addSelect('AVG(profile.analysisProgress)', 'avgProgress')
            .groupBy('profile.status')
            .getRawMany();
        return results.map((row) => ({
            status: row.status,
            count: parseInt(row.count, 10),
            avgProgress: parseFloat(row.avgProgress) || 0,
        }));
    }
}
exports.EnterpriseProfileRepository = EnterpriseProfileRepository;
//# sourceMappingURL=enterprise-profile.repository.js.map