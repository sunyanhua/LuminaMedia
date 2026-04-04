"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_quota_entity_1 = require("../../../entities/tenant-quota.entity");
let QuotaService = class QuotaService {
    tenantQuotaRepository;
    constructor(tenantQuotaRepository) {
        this.tenantQuotaRepository = tenantQuotaRepository;
    }
    async checkQuota(tenantId, featureKey) {
        const quotaRecord = await this.tenantQuotaRepository.findOne({
            where: {
                tenantId,
                featureKey,
            },
        });
        if (!quotaRecord) {
            return { hasQuota: true, remaining: -1 };
        }
        await this.maybeResetQuota(quotaRecord);
        const remaining = quotaRecord.maxCount - quotaRecord.usedCount;
        return {
            hasQuota: remaining > 0,
            remaining: remaining > 0 ? remaining : 0
        };
    }
    async consumeQuota(tenantId, featureKey) {
        const quotaInfo = await this.checkQuota(tenantId, featureKey);
        if (!quotaInfo.hasQuota) {
            return false;
        }
        const quotaRecord = await this.getOrCreateQuotaRecord(tenantId, featureKey);
        await this.maybeResetQuota(quotaRecord);
        quotaRecord.usedCount += 1;
        quotaRecord.updatedAt = new Date();
        await this.tenantQuotaRepository.save(quotaRecord);
        return true;
    }
    async getQuotaInfo(tenantId, featureKey) {
        const quotaRecord = await this.getOrCreateQuotaRecord(tenantId, featureKey);
        await this.maybeResetQuota(quotaRecord);
        const remaining = quotaRecord.maxCount - quotaRecord.usedCount;
        return {
            usedCount: quotaRecord.usedCount,
            maxCount: quotaRecord.maxCount,
            remaining: remaining > 0 ? remaining : 0,
            resetTime: quotaRecord.resetTime,
        };
    }
    async resetQuota(tenantId, featureKey) {
        const quotaRecord = await this.getOrCreateQuotaRecord(tenantId, featureKey);
        quotaRecord.usedCount = 0;
        quotaRecord.resetTime = this.calculateNextResetTime(quotaRecord.quotaPeriod);
        quotaRecord.updatedAt = new Date();
        await this.tenantQuotaRepository.save(quotaRecord);
    }
    async resetQuotasForTenant(tenantId) {
        const quotaRecords = await this.tenantQuotaRepository.find({
            where: { tenantId },
        });
        for (const record of quotaRecords) {
            record.usedCount = 0;
            record.resetTime = this.calculateNextResetTime(record.quotaPeriod);
            record.updatedAt = new Date();
        }
        await this.tenantQuotaRepository.save(quotaRecords);
    }
    async setQuota(tenantId, featureKey, maxCount, quotaPeriod = 'daily') {
        let quotaRecord = await this.tenantQuotaRepository.findOne({
            where: { tenantId, featureKey },
        });
        if (quotaRecord) {
            quotaRecord.maxCount = maxCount;
            quotaRecord.quotaPeriod = quotaPeriod;
            quotaRecord.updatedAt = new Date();
        }
        else {
            quotaRecord = this.tenantQuotaRepository.create({
                tenantId,
                featureKey,
                maxCount,
                quotaPeriod,
            });
        }
        return await this.tenantQuotaRepository.save(quotaRecord);
    }
    async getOrCreateQuotaRecord(tenantId, featureKey) {
        let quotaRecord = await this.tenantQuotaRepository.findOne({
            where: { tenantId, featureKey },
        });
        if (!quotaRecord) {
            quotaRecord = this.tenantQuotaRepository.create({
                tenantId,
                featureKey,
                maxCount: 100,
                quotaPeriod: 'daily',
            });
            quotaRecord = await this.tenantQuotaRepository.save(quotaRecord);
        }
        return quotaRecord;
    }
    async maybeResetQuota(quotaRecord) {
        if (!quotaRecord.resetTime) {
            quotaRecord.resetTime = this.calculateNextResetTime(quotaRecord.quotaPeriod);
            quotaRecord.usedCount = 0;
            await this.tenantQuotaRepository.save(quotaRecord);
            return;
        }
        const now = new Date();
        if (now >= quotaRecord.resetTime) {
            quotaRecord.usedCount = 0;
            quotaRecord.resetTime = this.calculateNextResetTime(quotaRecord.quotaPeriod);
            await this.tenantQuotaRepository.save(quotaRecord);
        }
    }
    calculateNextResetTime(period) {
        const now = new Date();
        switch (period) {
            case 'daily':
                now.setDate(now.getDate() + 1);
                now.setHours(0, 0, 0, 0);
                return now;
            case 'weekly':
                const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
                now.setDate(now.getDate() + daysUntilMonday);
                now.setHours(0, 0, 0, 0);
                return now;
            case 'monthly':
                now.setMonth(now.getMonth() + 1);
                now.setDate(1);
                now.setHours(0, 0, 0, 0);
                return now;
        }
    }
    async getQuotas(query) {
        const { tenantId, featureKey, quotaPeriod, page = 1, pageSize = 20 } = query;
        const skip = (page - 1) * pageSize;
        const where = {};
        if (tenantId) {
            where.tenantId = tenantId;
        }
        if (featureKey) {
            where.featureKey = featureKey;
        }
        if (quotaPeriod) {
            where.quotaPeriod = quotaPeriod;
        }
        const [data, total] = await this.tenantQuotaRepository.findAndCount({
            where,
            skip,
            take: pageSize,
            order: {
                createdAt: 'DESC',
            },
        });
        return {
            data,
            total,
            page,
            pageSize,
        };
    }
    async getAllQuotas() {
        return await this.tenantQuotaRepository.find({
            order: {
                tenantId: 'ASC',
                featureKey: 'ASC',
            },
        });
    }
    async getTenantQuotaUsage(tenantId) {
        const quotaRecords = await this.tenantQuotaRepository.find({
            where: { tenantId },
        });
        const result = [];
        for (const record of quotaRecords) {
            await this.maybeResetQuota(record);
            const remaining = record.maxCount - record.usedCount;
            result.push({
                featureKey: record.featureKey,
                usedCount: record.usedCount,
                maxCount: record.maxCount,
                remaining: remaining > 0 ? remaining : 0,
                quotaPeriod: record.quotaPeriod,
                resetTime: record.resetTime,
            });
        }
        return result;
    }
    async getFeatureQuotas(featureKey) {
        return await this.tenantQuotaRepository.find({
            where: { featureKey },
            order: {
                tenantId: 'ASC',
            },
        });
    }
    async deleteQuota(tenantId, featureKey) {
        await this.tenantQuotaRepository.delete({
            tenantId,
            featureKey,
        });
    }
};
exports.QuotaService = QuotaService;
exports.QuotaService = QuotaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_quota_entity_1.TenantQuota)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], QuotaService);
//# sourceMappingURL=quota.service.js.map