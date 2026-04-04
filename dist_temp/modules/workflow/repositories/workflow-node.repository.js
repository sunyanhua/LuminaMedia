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
exports.WorkflowNodeRepository = void 0;
const common_1 = require("@nestjs/common");
const tenant_repository_1 = require("../../../shared/repositories/tenant.repository");
const workflow_node_entity_1 = require("../entities/workflow-node.entity");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
const typeorm_1 = require("typeorm");
let WorkflowNodeRepository = class WorkflowNodeRepository extends tenant_repository_1.TenantRepository {
    dataSource;
    constructor(dataSource) {
        super(workflow_node_entity_1.WorkflowNode, dataSource.createEntityManager(), dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }
    async findByWorkflowId(workflowId) {
        return this.find({
            where: { workflowId },
            order: { nodeIndex: 'ASC' },
        });
    }
    async findPendingByUser(userId) {
        return this.find({
            where: {
                assignedTo: userId,
                status: workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
            },
            order: { createdAt: 'ASC' },
        });
    }
    async findByNodeType(nodeType) {
        return this.find({ where: { nodeType } });
    }
    async findActiveNodes() {
        return this.find({
            where: {
                status: workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
            },
            order: { startedAt: 'ASC' },
        });
    }
    async findTimeoutNodes(timeoutHours) {
        const timeoutDate = new Date(Date.now() - timeoutHours * 60 * 60 * 1000);
        return this.createQueryBuilder('node')
            .where('node.status = :status', { status: workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW })
            .andWhere('node.startedAt < :timeoutDate', { timeoutDate })
            .andWhere('node.completedAt IS NULL')
            .getMany();
    }
    async findNextPendingNode(workflowId) {
        return this.findOne({
            where: {
                workflowId,
                status: workflow_status_enum_1.WorkflowStatus.EDITOR_REVIEW,
            },
            order: { nodeIndex: 'ASC' },
        });
    }
    async findCompletedNodes(workflowId) {
        return this.find({
            where: {
                workflowId,
                status: workflow_status_enum_1.WorkflowStatus.COMPLETED,
            },
            order: { completedAt: 'ASC' },
        });
    }
    async updateNodeStatus(nodeId, status) {
        await this.updateById(nodeId, { status });
    }
    async assignNodeToUser(nodeId, userId) {
        await this.updateById(nodeId, {
            assignedTo: userId,
            startedAt: new Date(),
        });
    }
    async completeNode(nodeId, result) {
        await this.updateById(nodeId, {
            status: workflow_status_enum_1.WorkflowStatus.COMPLETED,
            completedAt: new Date(),
            result,
        });
    }
    async findParallelGroupNodes(parallelGroup) {
        return this.find({
            where: { parallelGroup },
            order: { nodeIndex: 'ASC' },
        });
    }
    async isParallelGroupCompleted(parallelGroup) {
        const nodes = await this.findParallelGroupNodes(parallelGroup);
        return nodes.every((node) => node.status === workflow_status_enum_1.WorkflowStatus.COMPLETED);
    }
};
exports.WorkflowNodeRepository = WorkflowNodeRepository;
exports.WorkflowNodeRepository = WorkflowNodeRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], WorkflowNodeRepository);
//# sourceMappingURL=workflow-node.repository.js.map