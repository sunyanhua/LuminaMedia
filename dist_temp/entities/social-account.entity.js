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
exports.SocialAccount = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const publish_task_entity_1 = require("./publish-task.entity");
const platform_adapter_interface_1 = require("../modules/publish/interfaces/platform-adapter.interface");
const account_status_enum_1 = require("../shared/enums/account-status.enum");
let SocialAccount = class SocialAccount {
    id;
    tenantId;
    userId;
    user;
    platform;
    accountName;
    platformUserId;
    platformUserName;
    avatarUrl;
    encryptedCredentials;
    credentialHash;
    config;
    quotaInfo;
    webhookUrl;
    isEnabled;
    lastTestedAt;
    testResult;
    description;
    createdAt;
    updatedAt;
    status;
    lastUsedAt;
    publishTasks;
};
exports.SocialAccount = SocialAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SocialAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], SocialAccount.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], SocialAccount.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.socialAccounts, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], SocialAccount.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: platform_adapter_interface_1.PlatformType,
    }),
    __metadata("design:type", String)
], SocialAccount.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name' }),
    __metadata("design:type", String)
], SocialAccount.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'platform_user_id',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], SocialAccount.prototype, "platformUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'platform_user_name',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], SocialAccount.prototype, "platformUserName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SocialAccount.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encrypted_credentials', type: 'text' }),
    __metadata("design:type", String)
], SocialAccount.prototype, "encryptedCredentials", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'credential_hash',
        type: 'varchar',
        length: 64,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SocialAccount.prototype, "credentialHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'config', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SocialAccount.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quota_info', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SocialAccount.prototype, "quotaInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'webhook_url', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SocialAccount.prototype, "webhookUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_enabled', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SocialAccount.prototype, "isEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_tested_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SocialAccount.prototype, "lastTestedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'test_result', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SocialAccount.prototype, "testResult", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SocialAccount.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], SocialAccount.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], SocialAccount.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: account_status_enum_1.AccountStatus,
        default: account_status_enum_1.AccountStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], SocialAccount.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_used_at', nullable: true }),
    __metadata("design:type", Date)
], SocialAccount.prototype, "lastUsedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => publish_task_entity_1.PublishTask, (task) => task.account),
    __metadata("design:type", Array)
], SocialAccount.prototype, "publishTasks", void 0);
exports.SocialAccount = SocialAccount = __decorate([
    (0, typeorm_1.Entity)('social_accounts'),
    (0, typeorm_1.Index)(['tenantId'])
], SocialAccount);
//# sourceMappingURL=social-account.entity.js.map