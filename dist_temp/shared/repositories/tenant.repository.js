"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantRepository = void 0;
const tenant_context_service_1 = require("../services/tenant-context.service");
const base_repository_1 = require("./base.repository");
class TenantRepository extends base_repository_1.BaseRepository {
    getCurrentTenantId() {
        return tenant_context_service_1.TenantContextService.getCurrentTenantIdStatic();
    }
    addTenantCondition(queryBuilder) {
        const tenantId = this.getCurrentTenantId();
        const alias = queryBuilder.alias;
        queryBuilder.andWhere(`${alias}.tenantId = :tenantId`, { tenantId });
        return queryBuilder;
    }
    async find(options) {
        const queryBuilder = this.createQueryBuilder(this.metadata.name);
        this.addTenantCondition(queryBuilder);
        if (options?.where) {
            queryBuilder.where(options.where);
        }
        if (options?.order) {
            queryBuilder.orderBy(options.order);
        }
        if (options?.skip) {
            queryBuilder.skip(options.skip);
        }
        if (options?.take) {
            queryBuilder.take(options.take);
        }
        return queryBuilder.getMany();
    }
    async findOne(options) {
        const queryBuilder = this.createQueryBuilder(this.metadata.name);
        this.addTenantCondition(queryBuilder);
        if (options?.where) {
            queryBuilder.where(options.where);
        }
        return queryBuilder.getOne();
    }
    async findByIds(ids) {
        const queryBuilder = this.createQueryBuilder(this.metadata.name);
        this.addTenantCondition(queryBuilder);
        queryBuilder.andWhere(`${queryBuilder.alias}.id IN (:...ids)`, { ids });
        return queryBuilder.getMany();
    }
    createQueryBuilder(alias) {
        const queryBuilder = super.createQueryBuilder(alias);
        return this.addTenantCondition(queryBuilder);
    }
    async count(options) {
        const queryBuilder = this.createQueryBuilder(this.metadata.name);
        this.addTenantCondition(queryBuilder);
        if (options?.where) {
            queryBuilder.where(options.where);
        }
        return queryBuilder.getCount();
    }
    async findAllTenants(options) {
        return super.find(options);
    }
    async checkTenantAccess(entityId) {
        try {
            const entity = await this.findOne({ where: { id: entityId } });
            return entity !== null;
        }
        catch (error) {
            this.logger.error(`Failed to check tenant access for entity ${entityId}: ${error.message}`);
            return false;
        }
    }
    async getTenantStats() {
        const count = await this.count();
        const latest = await this.createQueryBuilder()
            .orderBy(`${this.metadata.name}.updatedAt`, 'DESC')
            .getOne();
        return {
            totalCount: count,
            lastUpdated: latest?.updatedAt || null,
            sizeEstimate: count * 1024,
        };
    }
}
exports.TenantRepository = TenantRepository;
//# sourceMappingURL=tenant.repository.js.map