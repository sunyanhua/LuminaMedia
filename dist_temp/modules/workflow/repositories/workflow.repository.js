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
exports.WorkflowRepository = void 0;
const common_1 = require("@nestjs/common");
const tenant_repository_1 = require("../../../shared/repositories/tenant.repository");
const workflow_entity_1 = require("../entities/workflow.entity");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
const typeorm_1 = require("typeorm");
let WorkflowRepository = class WorkflowRepository extends tenant_repository_1.TenantRepository {
    dataSource;
    constructor(dataSource) {
        super(workflow_entity_1.Workflow, dataSource.createEntityManager(), dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }
    async findByStatus(status) {
        return this.find({ where: { status }, order: { createdAt: 'DESC' } });
    }
    async findByCreator(userId) {
        return this.find({
            where: { createdBy: userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findPendingByUser(userId) {
        const queryBuilder = this.createQueryBuilder('workflow')
            .leftJoin('workflow.nodes', 'node')
            .where('workflow.status IN (:...statuses)', {
            statuses: [
                workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
                workflow_status_enum_1.WorkflowStatus.AI_CHECK,
                workflow_status_enum_1.WorkflowStatus.MANAGER_REVIEW,
                workflow_status_enum_1.WorkflowStatus.LEGAL_REVIEW,
            ],
        })
            .andWhere('node.assignedTo = :userId', { userId })
            .andWhere('node.status = :nodeStatus', {
            nodeStatus: workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
        })
            .orderBy('workflow.priority', 'DESC')
            .addOrderBy('workflow.createdAt', 'ASC');
        return queryBuilder.getMany();
    }
    async findExpedited() {
        return this.find({
            where: { isExpedited: true },
            order: { priority: 'DESC' },
        });
    }
    async getStatusStats() {
        const result = await this.createQueryBuilder('workflow')
            .select('workflow.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('workflow.status')
            .getRawMany();
        const stats = {};
        Object.values(workflow_status_enum_1.WorkflowStatus).forEach((status) => {
            stats[status] = 0;
        });
        result.forEach((row) => {
            stats[row.status] = parseInt(row.count, 10);
        });
        return stats;
    }
    async findTimeoutWorkflows(timeoutHours) {
        const timeoutDate = new Date(Date.now() - timeoutHours * 60 * 60 * 1000);
        return this.createQueryBuilder('workflow')
            .leftJoin('workflow.nodes', 'node')
            .where('workflow.status IN (:...statuses)', {
            statuses: [
                workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
                workflow_status_enum_1.WorkflowStatus.AI_CHECK,
                workflow_status_enum_1.WorkflowStatus.MANAGER_REVIEW,
                workflow_status_enum_1.WorkflowStatus.LEGAL_REVIEW,
            ],
        })
            .andWhere('node.startedAt < :timeoutDate', { timeoutDate })
            .andWhere('node.completedAt IS NULL')
            .getMany();
    }
    async findRecentlyCompleted(days = 7) {
        const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return this.find({
            where: {
                status: workflow_status_enum_1.WorkflowStatus.PUBLISHED,
                completedAt: { $gte: sinceDate },
            },
            order: { completedAt: 'DESC' },
        });
    }
    async findByContentDraft(draftId) {
        return this.findOne({ where: { contentDraftId: draftId } });
    }
};
exports.WorkflowRepository = WorkflowRepository;
exports.WorkflowRepository = WorkflowRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], WorkflowRepository);
//# sourceMappingURL=workflow.repository.js.map