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
exports.Workflow = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../../entities/user.entity");
const content_draft_entity_1 = require("../../../entities/content-draft.entity");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
const workflow_node_entity_1 = require("./workflow-node.entity");
const approval_record_entity_1 = require("./approval-record.entity");
let Workflow = class Workflow {
    id;
    tenantId;
    contentDraftId;
    contentDraft;
    createdBy;
    creator;
    title;
    description;
    status;
    priority;
    isExpedited;
    expectedCompletionAt;
    completedAt;
    config;
    currentNodeIndex;
    completedNodesCount;
    totalNodesCount;
    approvalHistory;
    metadata;
    createdAt;
    updatedAt;
    nodes;
    approvalRecords;
};
exports.Workflow = Workflow;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Workflow.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], Workflow.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'content_draft_id' }),
    __metadata("design:type", String)
], Workflow.prototype, "contentDraftId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => content_draft_entity_1.ContentDraft, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'content_draft_id' }),
    __metadata("design:type", content_draft_entity_1.ContentDraft)
], Workflow.prototype, "contentDraft", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], Workflow.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Workflow.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Workflow.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Workflow.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: workflow_status_enum_1.WorkflowStatus,
        default: workflow_status_enum_1.WorkflowStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Workflow.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 3,
    }),
    __metadata("design:type", Number)
], Workflow.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_expedited', default: false }),
    __metadata("design:type", Boolean)
], Workflow.prototype, "isExpedited", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_completion_at', nullable: true }),
    __metadata("design:type", Date)
], Workflow.prototype, "expectedCompletionAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], Workflow.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Workflow.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_node_index', default: 0 }),
    __metadata("design:type", Number)
], Workflow.prototype, "currentNodeIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_nodes_count', default: 0 }),
    __metadata("design:type", Number)
], Workflow.prototype, "completedNodesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_nodes_count', default: 0 }),
    __metadata("design:type", Number)
], Workflow.prototype, "totalNodesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Workflow.prototype, "approvalHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Workflow.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Workflow.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Workflow.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workflow_node_entity_1.WorkflowNode, (node) => node.workflow),
    __metadata("design:type", Promise)
], Workflow.prototype, "nodes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => approval_record_entity_1.ApprovalRecord, (record) => record.workflow),
    __metadata("design:type", Promise)
], Workflow.prototype, "approvalRecords", void 0);
exports.Workflow = Workflow = __decorate([
    (0, typeorm_1.Entity)('workflows'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['contentDraftId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdAt'])
], Workflow);
//# sourceMappingURL=workflow.entity.js.map