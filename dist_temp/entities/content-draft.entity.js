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
exports.ContentDraft = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const publish_task_entity_1 = require("./publish-task.entity");
const platform_enum_1 = require("../shared/enums/platform.enum");
const generation_method_enum_1 = require("../shared/enums/generation-method.enum");
let ContentDraft = class ContentDraft {
    id;
    tenantId;
    userId;
    user;
    platformType;
    title;
    content;
    mediaUrls;
    tags;
    generatedBy;
    qualityScore;
    aiGeneratedContent;
    isPreset;
    demoScenario;
    createdAt;
    updatedAt;
    publishTasks;
};
exports.ContentDraft = ContentDraft;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ContentDraft.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], ContentDraft.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], ContentDraft.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE', eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Promise)
], ContentDraft.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'platform_type',
        type: 'enum',
        enum: platform_enum_1.Platform,
    }),
    __metadata("design:type", String)
], ContentDraft.prototype, "platformType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContentDraft.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], ContentDraft.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'media_urls', type: 'json', nullable: true }),
    __metadata("design:type", Array)
], ContentDraft.prototype, "mediaUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], ContentDraft.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'generated_by',
        type: 'enum',
        enum: generation_method_enum_1.GenerationMethod,
        nullable: true,
    }),
    __metadata("design:type", String)
], ContentDraft.prototype, "generatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'quality_score',
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], ContentDraft.prototype, "qualityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'ai_generated_content',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Object)
], ContentDraft.prototype, "aiGeneratedContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ContentDraft.prototype, "isPreset", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ContentDraft.prototype, "demoScenario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ContentDraft.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ContentDraft.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => publish_task_entity_1.PublishTask, (task) => task.draft, { eager: false }),
    __metadata("design:type", Promise)
], ContentDraft.prototype, "publishTasks", void 0);
exports.ContentDraft = ContentDraft = __decorate([
    (0, typeorm_1.Entity)('content_drafts'),
    (0, typeorm_1.Index)(['tenantId'])
], ContentDraft);
//# sourceMappingURL=content-draft.entity.js.map