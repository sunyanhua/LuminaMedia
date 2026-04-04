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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalRecordRepository = void 0;
const common_1 = require("@nestjs/common");
const tenant_repository_1 = require("../../../shared/repositories/tenant.repository");
const approval_record_entity_1 = require("../entities/approval-record.entity");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
const typeorm_1 = require("typeorm");
let ApprovalRecordRepository = class ApprovalRecordRepository extends tenant_repository_1.TenantRepository {
    dataSource;
    constructor(dataSource) {
        super(approval_record_entity_1.ApprovalRecord, dataSource.createEntityManager(), dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }
    async findByWorkflowId(workflowId) {
        return this.find({
            where: { workflowId },
            order: { createdAt: 'DESC' },
        });
    }
    async findByNodeId(nodeId) {
        return this.find({
            where: { nodeId },
            order: { createdAt: 'DESC' },
        });
    }
    async findByActorId(actorId) {
        return this.find({
            where: { actorId },
            order: { createdAt: 'DESC' },
        });
    }
    async findByAction(action) {
        return this.find({ where: { action } });
    }
    async findRecent(limit = 50) {
        return this.find({
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getActionStats() {
        const result = await this.createQueryBuilder('record')
            .select('record.action', 'action')
            .addSelect('COUNT(*)', 'count')
            .groupBy('record.action')
            .getRawMany();
        const stats = {};
        Object.values(workflow_status_enum_1.ApprovalAction).forEach((action) => {
            stats[action] = 0;
        });
        result.forEach((row) => {
            stats[row.action] = parseInt(row.count, 10);
        });
        return stats;
    }
    async findByTimeRange(startDate, endDate) {
        return this.find({
            where: {
                createdAt: { $gte: startDate, $lte: endDate },
            },
            order: { createdAt: 'ASC' },
        });
    }
    async getActorStats(actorId) {
        const records = await this.findByActorId(actorId);
        const byAction = {};
        Object.values(workflow_status_enum_1.ApprovalAction).forEach((action) => {
            byAction[action] = 0;
        });
        let totalProcessingTime = 0;
        let countWithTime = 0;
        records.forEach((record) => {
            byAction[record.action] = (byAction[record.action] || 0) + 1;
            if (record.metadata?.processingTimeMs) {
                totalProcessingTime += record.metadata.processingTimeMs;
                countWithTime++;
            }
        });
        return {
            total: records.length,
            byAction,
            averageProcessingTime: countWithTime > 0 ? totalProcessingTime / countWithTime : 0,
        };
    }
    async createRecord(data) {
        const record = this.create({
            ...data,
            metadata: data.metadata || {},
        });
        return this.save(record);
    }
};
exports.ApprovalRecordRepository = ApprovalRecordRepository;
exports.ApprovalRecordRepository = ApprovalRecordRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ApprovalRecordRepository);
//# sourceMappingURL=approval-record.repository.js.map