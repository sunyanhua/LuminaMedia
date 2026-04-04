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
exports.KnowledgeDocument = exports.DocumentProcessingStatus = exports.DocumentStatus = exports.DocumentSourceType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var DocumentSourceType;
(function (DocumentSourceType) {
    DocumentSourceType["FILE"] = "file";
    DocumentSourceType["URL"] = "url";
    DocumentSourceType["API"] = "api";
    DocumentSourceType["MANUAL"] = "manual";
})(DocumentSourceType || (exports.DocumentSourceType = DocumentSourceType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["DRAFT"] = "draft";
    DocumentStatus["PROCESSING"] = "processing";
    DocumentStatus["ACTIVE"] = "active";
    DocumentStatus["ARCHIVED"] = "archived";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
var DocumentProcessingStatus;
(function (DocumentProcessingStatus) {
    DocumentProcessingStatus["PENDING"] = "pending";
    DocumentProcessingStatus["EXTRACTING"] = "extracting";
    DocumentProcessingStatus["VECTORIZED"] = "vectorized";
    DocumentProcessingStatus["ANALYZED"] = "analyzed";
    DocumentProcessingStatus["FAILED"] = "failed";
})(DocumentProcessingStatus || (exports.DocumentProcessingStatus = DocumentProcessingStatus = {}));
let KnowledgeDocument = class KnowledgeDocument {
    id;
    tenantId;
    createdBy;
    creator;
    title;
    content;
    summary;
    sourceType;
    sourceUrl;
    fileInfo;
    category;
    tags;
    language;
    metadata;
    status;
    processingStatus;
    processingError;
    vectorId;
    qualityScore;
    version;
    isPublic;
    accessControl;
    contentHash;
    extractedAt;
    vectorizedAt;
    analyzedAt;
    createdAt;
    updatedAt;
    deletedAt;
    isVectorized() {
        return (this.processingStatus === DocumentProcessingStatus.VECTORIZED ||
            this.processingStatus === DocumentProcessingStatus.ANALYZED);
    }
    isAnalyzed() {
        return this.processingStatus === DocumentProcessingStatus.ANALYZED;
    }
    isSearchable() {
        return this.status === DocumentStatus.ACTIVE && this.isVectorized();
    }
};
exports.KnowledgeDocument = KnowledgeDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tenant_id',
        type: 'varchar',
        length: 36,
        default: 'default-tenant',
    }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'varchar', length: 36, nullable: true }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], KnowledgeDocument.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'longtext', nullable: true }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'source_type',
        type: 'enum',
        enum: DocumentSourceType,
        default: DocumentSourceType.MANUAL,
    }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "sourceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_url', type: 'varchar', length: 2000, nullable: true }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "sourceUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_info', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KnowledgeDocument.prototype, "fileInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], KnowledgeDocument.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'zh-CN' }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KnowledgeDocument.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.DRAFT,
    }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'processing_status',
        type: 'enum',
        enum: DocumentProcessingStatus,
        default: DocumentProcessingStatus.PENDING,
    }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "processingStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_error', type: 'text', nullable: true }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "processingError", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vector_id', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "vectorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quality_score', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], KnowledgeDocument.prototype, "qualityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], KnowledgeDocument.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_public', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], KnowledgeDocument.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'access_control', type: 'json', nullable: true }),
    __metadata("design:type", Array)
], KnowledgeDocument.prototype, "accessControl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'content_hash', type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", String)
], KnowledgeDocument.prototype, "contentHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extracted_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], KnowledgeDocument.prototype, "extractedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vectorized_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], KnowledgeDocument.prototype, "vectorizedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'analyzed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], KnowledgeDocument.prototype, "analyzedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], KnowledgeDocument.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], KnowledgeDocument.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], KnowledgeDocument.prototype, "deletedAt", void 0);
exports.KnowledgeDocument = KnowledgeDocument = __decorate([
    (0, typeorm_1.Entity)('knowledge_documents'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['sourceType']),
    (0, typeorm_1.Index)(['category']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['processingStatus']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['vectorId'])
], KnowledgeDocument);
//# sourceMappingURL=knowledge-document.entity.js.map