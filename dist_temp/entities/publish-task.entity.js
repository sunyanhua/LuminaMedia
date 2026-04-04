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
exports.PublishTask = void 0;
const typeorm_1 = require("typeorm");
const content_draft_entity_1 = require("./content-draft.entity");
const social_account_entity_1 = require("./social-account.entity");
const task_status_enum_1 = require("../shared/enums/task-status.enum");
let PublishTask = class PublishTask {
    id;
    tenantId;
    draftId;
    draft;
    accountId;
    account;
    status;
    scheduledAt;
    publishedAt;
    postUrl;
    errorMessage;
};
exports.PublishTask = PublishTask;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PublishTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], PublishTask.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'draft_id' }),
    __metadata("design:type", String)
], PublishTask.prototype, "draftId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => content_draft_entity_1.ContentDraft, { onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'draft_id' }),
    __metadata("design:type", Promise)
], PublishTask.prototype, "draft", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id' }),
    __metadata("design:type", String)
], PublishTask.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => social_account_entity_1.SocialAccount, (account) => account.publishTasks, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id' }),
    __metadata("design:type", social_account_entity_1.SocialAccount)
], PublishTask.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: task_status_enum_1.TaskStatus,
        default: task_status_enum_1.TaskStatus.PENDING,
    }),
    __metadata("design:type", String)
], PublishTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_at', nullable: true }),
    __metadata("design:type", Date)
], PublishTask.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'published_at', nullable: true }),
    __metadata("design:type", Date)
], PublishTask.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'post_url', nullable: true }),
    __metadata("design:type", String)
], PublishTask.prototype, "postUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PublishTask.prototype, "errorMessage", void 0);
exports.PublishTask = PublishTask = __decorate([
    (0, typeorm_1.Entity)('publish_tasks'),
    (0, typeorm_1.Index)(['tenantId'])
], PublishTask);
//# sourceMappingURL=publish-task.entity.js.map