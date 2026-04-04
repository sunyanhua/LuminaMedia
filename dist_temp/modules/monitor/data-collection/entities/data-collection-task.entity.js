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
exports.DataCollectionTask = void 0;
const typeorm_1 = require("typeorm");
const data_collection_interface_1 = require("../interfaces/data-collection.interface");
let DataCollectionTask = class DataCollectionTask {
    id;
    tenantId;
    platform;
    method;
    config;
    status;
    progress;
    errorMessage;
    result;
    scheduledAt;
    startedAt;
    completedAt;
    retryCount;
    nextRetryAt;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
};
exports.DataCollectionTask = DataCollectionTask;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DataCollectionTask.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], DataCollectionTask.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: data_collection_interface_1.PlatformType,
        comment: '目标平台: wechat, weibo, xiaohongshu, douyin, news, forum',
    }),
    __metadata("design:type", String)
], DataCollectionTask.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: data_collection_interface_1.CollectionMethod,
        default: data_collection_interface_1.CollectionMethod.API,
        comment: '采集方式: API, RSS, CRAWLER',
    }),
    __metadata("design:type", String)
], DataCollectionTask.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DataCollectionTask.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: data_collection_interface_1.TaskStatus,
        default: data_collection_interface_1.TaskStatus.PENDING,
    }),
    __metadata("design:type", String)
], DataCollectionTask.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DataCollectionTask.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DataCollectionTask.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DataCollectionTask.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DataCollectionTask.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DataCollectionTask.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DataCollectionTask.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DataCollectionTask.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DataCollectionTask.prototype, "nextRetryAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DataCollectionTask.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DataCollectionTask.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], DataCollectionTask.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], DataCollectionTask.prototype, "updatedBy", void 0);
exports.DataCollectionTask = DataCollectionTask = __decorate([
    (0, typeorm_1.Entity)('data_collection_tasks'),
    (0, typeorm_1.Index)(['platform', 'status']),
    (0, typeorm_1.Index)(['scheduledAt', 'status'])
], DataCollectionTask);
//# sourceMappingURL=data-collection-task.entity.js.map