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
exports.DataImportJob = void 0;
const typeorm_1 = require("typeorm");
const customer_profile_entity_1 = require("./customer-profile.entity");
const source_type_enum_1 = require("../shared/enums/source-type.enum");
const data_import_status_enum_1 = require("../shared/enums/data-import-status.enum");
let DataImportJob = class DataImportJob {
    id;
    tenantId;
    customerProfileId;
    customerProfile;
    sourceType;
    filePath;
    originalFilename;
    recordCount;
    successCount;
    failedCount;
    status;
    errorMessage;
    validationErrors;
    summary;
    notes;
    importData;
    createdAt;
    startedAt;
    completedAt;
};
exports.DataImportJob = DataImportJob;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DataImportJob.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], DataImportJob.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_profile_id', type: 'varchar', length: 36 }),
    __metadata("design:type", String)
], DataImportJob.prototype, "customerProfileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_profile_entity_1.CustomerProfile, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_profile_id' }),
    __metadata("design:type", customer_profile_entity_1.CustomerProfile)
], DataImportJob.prototype, "customerProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'source_type',
        type: 'enum',
        enum: source_type_enum_1.SourceType,
        default: source_type_enum_1.SourceType.CSV,
    }),
    __metadata("design:type", String)
], DataImportJob.prototype, "sourceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_path', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], DataImportJob.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'original_filename',
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", Object)
], DataImportJob.prototype, "originalFilename", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'record_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DataImportJob.prototype, "recordCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'success_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DataImportJob.prototype, "successCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DataImportJob.prototype, "failedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: data_import_status_enum_1.DataImportStatus,
        default: data_import_status_enum_1.DataImportStatus.PENDING,
    }),
    __metadata("design:type", String)
], DataImportJob.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DataImportJob.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'validation_errors', type: 'json', nullable: true }),
    __metadata("design:type", Array)
], DataImportJob.prototype, "validationErrors", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'summary', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DataImportJob.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DataImportJob.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'import_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], DataImportJob.prototype, "importData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DataImportJob.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'started_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], DataImportJob.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], DataImportJob.prototype, "completedAt", void 0);
exports.DataImportJob = DataImportJob = __decorate([
    (0, typeorm_1.Entity)('data_import_jobs'),
    (0, typeorm_1.Index)(['customerProfileId', 'status']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['tenantId'])
], DataImportJob);
//# sourceMappingURL=data-import-job.entity.js.map