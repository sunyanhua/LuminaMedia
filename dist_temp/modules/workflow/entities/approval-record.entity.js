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
exports.ApprovalRecord = void 0;
const typeorm_1 = require("typeorm");
const workflow_entity_1 = require("./workflow.entity");
const workflow_node_entity_1 = require("./workflow-node.entity");
const user_entity_1 = require("../../../entities/user.entity");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
let ApprovalRecord = class ApprovalRecord {
    id;
    tenantId;
    workflowId;
    workflow;
    nodeId;
    node;
    action;
    actorId;
    actor;
    comments;
    attachments;
    transferTo;
    isExpedited;
    previousStatus;
    newStatus;
    ipAddress;
    userAgent;
    device;
    location;
    metadata;
    createdAt;
};
exports.ApprovalRecord = ApprovalRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'workflow_id' }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "workflowId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workflow_entity_1.Workflow, { onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'workflow_id' }),
    __metadata("design:type", Promise)
], ApprovalRecord.prototype, "workflow", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'node_id', nullable: true }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "nodeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workflow_node_entity_1.WorkflowNode, { nullable: true, onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'node_id' }),
    __metadata("design:type", Promise)
], ApprovalRecord.prototype, "node", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: workflow_status_enum_1.ApprovalAction,
    }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actor_id' }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "actorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'actor_id' }),
    __metadata("design:type", user_entity_1.User)
], ApprovalRecord.prototype, "actor", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], ApprovalRecord.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transfer_to', nullable: true }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "transferTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_expedited', default: false }),
    __metadata("design:type", Boolean)
], ApprovalRecord.prototype, "isExpedited", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_status', nullable: true }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "previousStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'new_status', nullable: true }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "newStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', nullable: true }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "device", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ApprovalRecord.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ApprovalRecord.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ApprovalRecord.prototype, "createdAt", void 0);
exports.ApprovalRecord = ApprovalRecord = __decorate([
    (0, typeorm_1.Entity)('approval_records'),
    (0, typeorm_1.Index)(['workflowId']),
    (0, typeorm_1.Index)(['nodeId']),
    (0, typeorm_1.Index)(['actorId']),
    (0, typeorm_1.Index)(['action']),
    (0, typeorm_1.Index)(['createdAt'])
], ApprovalRecord);
//# sourceMappingURL=approval-record.entity.js.map