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
exports.Notification = void 0;
const typeorm_1 = require("typeorm");
const workflow_entity_1 = require("./workflow.entity");
const workflow_node_entity_1 = require("./workflow-node.entity");
const user_entity_1 = require("../../../entities/user.entity");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
let Notification = class Notification {
    id;
    tenantId;
    type;
    recipientId;
    recipient;
    workflowId;
    workflow;
    nodeId;
    node;
    title;
    content;
    status;
    channels;
    sentAt;
    readAt;
    actionedAt;
    priority;
    isSilent;
    isRecurring;
    recurrenceInterval;
    nextSendAt;
    retryCount;
    maxRetries;
    failureReason;
    metadata;
    createdAt;
    updatedAt;
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], Notification.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: workflow_status_enum_1.NotificationType,
    }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recipient_id' }),
    __metadata("design:type", String)
], Notification.prototype, "recipientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'recipient_id' }),
    __metadata("design:type", user_entity_1.User)
], Notification.prototype, "recipient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'workflow_id', nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "workflowId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workflow_entity_1.Workflow, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'workflow_id' }),
    __metadata("design:type", workflow_entity_1.Workflow)
], Notification.prototype, "workflow", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'node_id', nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "nodeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workflow_node_entity_1.WorkflowNode, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'node_id' }),
    __metadata("design:type", workflow_node_entity_1.WorkflowNode)
], Notification.prototype, "node", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Notification.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['PENDING', 'SENT', 'READ', 'ACTIONED', 'FAILED'],
        default: 'PENDING',
    }),
    __metadata("design:type", String)
], Notification.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { default: 'in_app' }),
    __metadata("design:type", Array)
], Notification.prototype, "channels", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'read_at', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actioned_at', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "actionedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 3 }),
    __metadata("design:type", Number)
], Notification.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_silent', default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isSilent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_recurring', default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRecurring", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recurrence_interval', nullable: true }),
    __metadata("design:type", Number)
], Notification.prototype, "recurrenceInterval", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_send_at', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "nextSendAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', default: 0 }),
    __metadata("design:type", Number)
], Notification.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_retries', default: 3 }),
    __metadata("design:type", Number)
], Notification.prototype, "maxRetries", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failure_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "updatedAt", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('workflow_notifications'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['recipientId']),
    (0, typeorm_1.Index)(['workflowId']),
    (0, typeorm_1.Index)(['nodeId']),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdAt'])
], Notification);
//# sourceMappingURL=notification.entity.js.map