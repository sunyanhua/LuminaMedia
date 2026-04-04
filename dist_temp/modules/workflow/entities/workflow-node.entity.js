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
exports.WorkflowNode = void 0;
const typeorm_1 = require("typeorm");
const workflow_entity_1 = require("./workflow.entity");
const user_entity_1 = require("../../../entities/user.entity");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
let WorkflowNode = class WorkflowNode {
    id;
    tenantId;
    workflowId;
    workflow;
    nodeIndex;
    nodeType;
    name;
    description;
    status;
    assignedTo;
    assignee;
    role;
    isMandatory;
    isParallel;
    parallelGroup;
    timeoutHours;
    startedAt;
    completedAt;
    timeoutAt;
    result;
    config;
    dependencies;
    metadata;
    createdAt;
    updatedAt;
};
exports.WorkflowNode = WorkflowNode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WorkflowNode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], WorkflowNode.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'workflow_id' }),
    __metadata("design:type", String)
], WorkflowNode.prototype, "workflowId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workflow_entity_1.Workflow, { onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'workflow_id' }),
    __metadata("design:type", Promise)
], WorkflowNode.prototype, "workflow", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'node_index' }),
    __metadata("design:type", Number)
], WorkflowNode.prototype, "nodeIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'node_type',
        type: 'enum',
        enum: workflow_status_enum_1.ApprovalNodeType,
    }),
    __metadata("design:type", String)
], WorkflowNode.prototype, "nodeType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], WorkflowNode.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], WorkflowNode.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: workflow_status_enum_1.WorkflowStatus,
        default: workflow_status_enum_1.WorkflowStatus.DRAFT,
    }),
    __metadata("design:type", String)
], WorkflowNode.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to', nullable: true }),
    __metadata("design:type", String)
], WorkflowNode.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to' }),
    __metadata("design:type", user_entity_1.User)
], WorkflowNode.prototype, "assignee", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WorkflowNode.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_mandatory', default: true }),
    __metadata("design:type", Boolean)
], WorkflowNode.prototype, "isMandatory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_parallel', default: false }),
    __metadata("design:type", Boolean)
], WorkflowNode.prototype, "isParallel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parallel_group', nullable: true }),
    __metadata("design:type", String)
], WorkflowNode.prototype, "parallelGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'timeout_hours', nullable: true }),
    __metadata("design:type", Number)
], WorkflowNode.prototype, "timeoutHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'started_at', nullable: true }),
    __metadata("design:type", Date)
], WorkflowNode.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], WorkflowNode.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'timeout_at', nullable: true }),
    __metadata("design:type", Date)
], WorkflowNode.prototype, "timeoutAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], WorkflowNode.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], WorkflowNode.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], WorkflowNode.prototype, "dependencies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], WorkflowNode.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WorkflowNode.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], WorkflowNode.prototype, "updatedAt", void 0);
exports.WorkflowNode = WorkflowNode = __decorate([
    (0, typeorm_1.Entity)('workflow_nodes'),
    (0, typeorm_1.Index)(['workflowId']),
    (0, typeorm_1.Index)(['nodeType']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['assignedTo'])
], WorkflowNode);
//# sourceMappingURL=workflow-node.entity.js.map