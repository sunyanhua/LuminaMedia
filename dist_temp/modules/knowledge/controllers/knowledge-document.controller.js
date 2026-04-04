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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeDocumentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const knowledge_document_service_1 = require("../services/knowledge-document.service");
const knowledge_document_entity_1 = require("../../../entities/knowledge-document.entity");
class CreateDocumentDto {
    title;
    content;
    summary;
    sourceType;
    sourceUrl;
    category;
    tags;
    language;
    metadata;
}
class UpdateDocumentDto {
    title;
    content;
    summary;
    category;
    tags;
    language;
    metadata;
    status;
    isPublic;
    accessControl;
    processingStatus;
    vectorId;
    processingError;
    vectorizedAt;
}
class SearchDocumentsDto {
    query;
    category;
    sourceType;
    status;
    tags;
    limit;
    offset;
}
class ImportFileDto {
    category;
    tags;
    language;
    isPublic;
    accessControl;
}
class ImportUrlDto {
    url;
    category;
    tags;
    language;
    isPublic;
    accessControl;
}
class ImportApiDto {
    title;
    content;
    metadata;
    category;
    tags;
    language;
    isPublic;
    accessControl;
}
class BatchImportDto {
    imports;
}
class BatchUpdateTagsDto {
    documentIds;
    add;
    remove;
}
class BatchUpdateCategoryDto {
    documentIds;
    category;
}
class UpdateCategoryDto {
    newCategory;
}
class MergeTagsDto {
    targetTag;
}
let KnowledgeDocumentController = class KnowledgeDocumentController {
    knowledgeDocumentService;
    constructor(knowledgeDocumentService) {
        this.knowledgeDocumentService = knowledgeDocumentService;
    }
    async createDocument(createDocumentDto) {
        return await this.knowledgeDocumentService.createDocument(createDocumentDto);
    }
    async getDocument(id) {
        return await this.knowledgeDocumentService.getDocument(id);
    }
    async updateDocument(id, updateDocumentDto) {
        return await this.knowledgeDocumentService.updateDocument(id, updateDocumentDto);
    }
    async deleteDocument(id) {
        await this.knowledgeDocumentService.deleteDocument(id);
    }
    async batchDeleteDocuments(documentIds) {
        await this.knowledgeDocumentService.batchDeleteDocuments(documentIds);
    }
    async searchDocuments(query, category, sourceType, status, tags, limit, offset) {
        const tagArray = tags
            ? tags.split(',').map((tag) => tag.trim())
            : undefined;
        return await this.knowledgeDocumentService.searchDocuments(query || '', {
            category,
            sourceType,
            status,
            tags: tagArray,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
        });
    }
    async importFileDocument(file, importFileDto) {
        const fileInfo = {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            storagePath: file.path,
        };
        const tags = importFileDto.tags
            ? Array.isArray(importFileDto.tags)
                ? importFileDto.tags
                : importFileDto.tags.split(',').map((tag) => tag.trim())
            : undefined;
        return await this.knowledgeDocumentService.importFileDocument(fileInfo, {
            category: importFileDto.category,
            tags,
            language: importFileDto.language,
            isPublic: importFileDto.isPublic,
            accessControl: importFileDto.accessControl,
        });
    }
    async importUrlDocument(importUrlDto) {
        return await this.knowledgeDocumentService.importUrlDocument(importUrlDto.url, {
            category: importUrlDto.category,
            tags: importUrlDto.tags,
            language: importUrlDto.language,
            isPublic: importUrlDto.isPublic,
            accessControl: importUrlDto.accessControl,
        });
    }
    async importApiDocument(importApiDto) {
        return await this.knowledgeDocumentService.importApiDocument({
            title: importApiDto.title,
            content: importApiDto.content,
            metadata: importApiDto.metadata,
        }, {
            category: importApiDto.category,
            tags: importApiDto.tags,
            language: importApiDto.language,
            isPublic: importApiDto.isPublic,
            accessControl: importApiDto.accessControl,
        });
    }
    async batchImportDocuments(batchImportDto) {
        return await this.knowledgeDocumentService.batchImportDocuments(batchImportDto.imports);
    }
    async processPendingDocuments(batchSize) {
        await this.knowledgeDocumentService.processPendingDocuments(batchSize ? Number(batchSize) : undefined);
    }
    async getDocumentStats() {
        return await this.knowledgeDocumentService.getDocumentStats();
    }
    async revectorizeAllDocuments() {
        return await this.knowledgeDocumentService.revectorizeAllDocuments();
    }
    async getAllCategories() {
        return await this.knowledgeDocumentService.getAllCategories();
    }
    async getAllTags() {
        return await this.knowledgeDocumentService.getAllTags();
    }
    async updateCategory(category, updateCategoryDto) {
        return await this.knowledgeDocumentService.updateCategory(category, updateCategoryDto.newCategory);
    }
    async mergeTags(sourceTag, mergeTagsDto) {
        return await this.knowledgeDocumentService.mergeTags(sourceTag, mergeTagsDto.targetTag);
    }
    async suggestTags(id, limit) {
        return await this.knowledgeDocumentService.suggestTags(id, limit ? Number(limit) : undefined);
    }
    async suggestCategory(id) {
        return await this.knowledgeDocumentService.suggestCategory(id);
    }
    async batchUpdateTags(batchUpdateTagsDto) {
        return await this.knowledgeDocumentService.batchUpdateTags(batchUpdateTagsDto.documentIds, { add: batchUpdateTagsDto.add, remove: batchUpdateTagsDto.remove });
    }
    async batchUpdateCategory(batchUpdateCategoryDto) {
        return await this.knowledgeDocumentService.batchUpdateCategory(batchUpdateCategoryDto.documentIds, batchUpdateCategoryDto.category);
    }
    async getProcessingStatus(id) {
        const document = await this.knowledgeDocumentService.getDocument(id);
        return {
            processingStatus: document.processingStatus,
            vectorId: document.vectorId,
            vectorizedAt: document.vectorizedAt,
            processingError: document.processingError,
        };
    }
    async triggerVectorization(id) {
        const document = await this.knowledgeDocumentService.getDocument(id);
        if (document.status !== knowledge_document_entity_1.DocumentStatus.ACTIVE) {
            throw new common_1.BadRequestException('只有活跃状态的文档可以向量化');
        }
        await this.knowledgeDocumentService.updateDocument(id, {
            processingStatus: knowledge_document_entity_1.DocumentProcessingStatus.PENDING,
            vectorId: null,
        });
    }
};
exports.KnowledgeDocumentController = KnowledgeDocumentController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: '创建新文档',
        description: '创建新的知识库文档，支持多种来源类型',
    }),
    (0, swagger_1.ApiBody)({ type: CreateDocumentDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: '文档创建成功',
        type: knowledge_document_entity_1.KnowledgeDocument,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数无效' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '已存在相同内容的文档' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateDocumentDto]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "createDocument", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '获取文档详情',
        description: '根据ID获取文档的详细信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '文档ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: '获取成功',
        type: knowledge_document_entity_1.KnowledgeDocument,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '文档不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '更新文档',
        description: '更新文档内容或元数据',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '文档ID' }),
    (0, swagger_1.ApiBody)({ type: UpdateDocumentDto }),
    (0, swagger_1.ApiOkResponse)({
        description: '更新成功',
        type: knowledge_document_entity_1.KnowledgeDocument,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '文档不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateDocumentDto]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "updateDocument", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: '删除文档',
        description: '软删除文档（移至归档状态）',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '文档ID' }),
    (0, swagger_1.ApiNoContentResponse)({ description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '文档不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Delete)('batch/delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: '批量删除文档',
        description: '批量软删除文档',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                documentIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: '文档ID数组',
                },
            },
            required: ['documentIds'],
        },
    }),
    (0, swagger_1.ApiNoContentResponse)({ description: '删除成功' }),
    __param(0, (0, common_1.Body)('documentIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "batchDeleteDocuments", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '搜索文档',
        description: '根据关键词、分类、标签等条件搜索文档',
    }),
    (0, swagger_1.ApiQuery)({ name: 'query', required: false, description: '搜索关键词' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: '文档分类' }),
    (0, swagger_1.ApiQuery)({ name: 'sourceType', required: false, description: '来源类型' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '文档状态' }),
    (0, swagger_1.ApiQuery)({
        name: 'tags',
        required: false,
        description: '标签数组（逗号分隔）',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: '每页数量',
        type: Number,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        required: false,
        description: '偏移量',
        type: Number,
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '搜索成功',
        schema: {
            type: 'object',
            properties: {
                documents: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/KnowledgeDocument' },
                },
                total: { type: 'number' },
            },
        },
    }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('sourceType')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('tags')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "searchDocuments", null);
__decorate([
    (0, common_1.Post)('import/file'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({
        summary: '导入文件文档',
        description: '上传文件并导入为知识库文档，支持多种文件格式',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '文件（PDF、Word、Excel、TXT等）',
                },
                category: { type: 'string' },
                tags: { type: 'string', description: '逗号分隔的标签' },
                language: { type: 'string', default: 'zh-CN' },
                isPublic: { type: 'boolean', default: false },
                accessControl: {
                    type: 'array',
                    items: { type: 'string' },
                },
            },
        },
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: '文件导入成功',
        type: knowledge_document_entity_1.KnowledgeDocument,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '文件无效或参数错误' }),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /^(pdf|docx?|xlsx?|pptx?|txt)$/ }),
        ],
    }))),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ImportFileDto]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "importFileDocument", null);
__decorate([
    (0, common_1.Post)('import/url'),
    (0, swagger_1.ApiOperation)({
        summary: '导入URL文档',
        description: '抓取网页内容并导入为知识库文档',
    }),
    (0, swagger_1.ApiBody)({ type: ImportUrlDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'URL导入成功',
        type: knowledge_document_entity_1.KnowledgeDocument,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'URL无效或抓取失败' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ImportUrlDto]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "importUrlDocument", null);
__decorate([
    (0, common_1.Post)('import/api'),
    (0, swagger_1.ApiOperation)({
        summary: '导入API文档',
        description: '通过API接口导入文档内容',
    }),
    (0, swagger_1.ApiBody)({ type: ImportApiDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'API导入成功',
        type: knowledge_document_entity_1.KnowledgeDocument,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ImportApiDto]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "importApiDocument", null);
__decorate([
    (0, common_1.Post)('import/batch'),
    (0, swagger_1.ApiOperation)({
        summary: '批量导入文档',
        description: '批量导入多种来源的文档',
    }),
    (0, swagger_1.ApiBody)({ type: BatchImportDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: '批量导入成功',
        type: [knowledge_document_entity_1.KnowledgeDocument],
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BatchImportDto]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "batchImportDocuments", null);
__decorate([
    (0, common_1.Post)('process/pending'),
    (0, swagger_1.ApiOperation)({
        summary: '处理待向量化文档',
        description: '批量处理待向量化的文档，将其添加到向量数据库',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'batchSize',
        required: false,
        description: '批量大小',
        type: Number,
    }),
    (0, swagger_1.ApiOkResponse)({ description: '处理完成' }),
    __param(0, (0, common_1.Query)('batchSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "processPendingDocuments", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, swagger_1.ApiOperation)({
        summary: '获取文档统计信息',
        description: '获取文档的数量、状态、分类、来源等统计信息',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                byStatus: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            status: { type: 'string' },
                            count: { type: 'number' },
                        },
                    },
                },
                byProcessingStatus: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            processingStatus: { type: 'string' },
                            count: { type: 'number' },
                        },
                    },
                },
                byCategory: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            category: { type: 'string' },
                            count: { type: 'number' },
                        },
                    },
                },
                bySourceType: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            sourceType: { type: 'string' },
                            count: { type: 'number' },
                        },
                    },
                },
                qualityStats: {
                    type: 'object',
                    properties: {
                        avgOverall: { type: 'number' },
                        avgCompleteness: { type: 'number' },
                        avgRelevance: { type: 'number' },
                        avgFreshness: { type: 'number' },
                        avgAuthority: { type: 'number' },
                        avgReadability: { type: 'number' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "getDocumentStats", null);
__decorate([
    (0, common_1.Post)('revectorize/all'),
    (0, swagger_1.ApiOperation)({
        summary: '重新向量化所有文档',
        description: '重新处理所有已向量化的文档，更新向量数据库',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '重新向量化完成',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                processed: { type: 'number' },
                failed: { type: 'number' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "revectorizeAllDocuments", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({
        summary: '获取所有分类',
        description: '获取文档的所有分类及其文档数量',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '获取成功',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    category: { type: 'string' },
                    count: { type: 'number' },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "getAllCategories", null);
__decorate([
    (0, common_1.Get)('tags'),
    (0, swagger_1.ApiOperation)({
        summary: '获取所有标签',
        description: '获取文档的所有标签及其使用频率',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '获取成功',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    tag: { type: 'string' },
                    count: { type: 'number' },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "getAllTags", null);
__decorate([
    (0, common_1.Put)('categories/:category'),
    (0, swagger_1.ApiOperation)({
        summary: '更新分类名称',
        description: '批量更新文档的分类名称',
    }),
    (0, swagger_1.ApiParam)({ name: 'category', description: '原分类名称' }),
    (0, swagger_1.ApiBody)({ type: UpdateCategoryDto }),
    (0, swagger_1.ApiOkResponse)({
        description: '更新成功',
        schema: {
            type: 'object',
            properties: {
                updated: { type: 'number' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Put)('tags/merge/:sourceTag'),
    (0, swagger_1.ApiOperation)({
        summary: '合并标签',
        description: '将源标签合并到目标标签，并删除源标签',
    }),
    (0, swagger_1.ApiParam)({ name: 'sourceTag', description: '源标签' }),
    (0, swagger_1.ApiBody)({ type: MergeTagsDto }),
    (0, swagger_1.ApiOkResponse)({
        description: '合并成功',
        schema: {
            type: 'object',
            properties: {
                updated: { type: 'number' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('sourceTag')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, MergeTagsDto]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "mergeTags", null);
__decorate([
    (0, common_1.Get)(':id/suggest/tags'),
    (0, swagger_1.ApiOperation)({
        summary: '获取文档建议标签',
        description: '基于文档内容分析生成标签建议',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '文档ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: '建议数量限制',
        type: Number,
    }),
    (0, swagger_1.ApiOkResponse)({
        description: '获取成功',
        schema: {
            type: 'array',
            items: { type: 'string' },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "suggestTags", null);
__decorate([
    (0, common_1.Get)(':id/suggest/category'),
    (0, swagger_1.ApiOperation)({
        summary: '获取文档建议分类',
        description: '基于文档内容分析生成分类建议',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '文档ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: '获取成功',
        type: String,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "suggestCategory", null);
__decorate([
    (0, common_1.Put)('batch/tags'),
    (0, swagger_1.ApiOperation)({
        summary: '批量更新文档标签',
        description: '批量添加或移除文档标签',
    }),
    (0, swagger_1.ApiBody)({ type: BatchUpdateTagsDto }),
    (0, swagger_1.ApiOkResponse)({
        description: '更新成功',
        schema: {
            type: 'object',
            properties: {
                updated: { type: 'number' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BatchUpdateTagsDto]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "batchUpdateTags", null);
__decorate([
    (0, common_1.Put)('batch/category'),
    (0, swagger_1.ApiOperation)({
        summary: '批量更新文档分类',
        description: '批量更新文档分类',
    }),
    (0, swagger_1.ApiBody)({ type: BatchUpdateCategoryDto }),
    (0, swagger_1.ApiOkResponse)({
        description: '更新成功',
        schema: {
            type: 'object',
            properties: {
                updated: { type: 'number' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BatchUpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "batchUpdateCategory", null);
__decorate([
    (0, common_1.Get)(':id/processing-status'),
    (0, swagger_1.ApiOperation)({
        summary: '获取文档处理状态',
        description: '获取文档的向量化处理状态和错误信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '文档ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                processingStatus: { type: 'string' },
                vectorId: { type: 'string', nullable: true },
                vectorizedAt: { type: 'string', format: 'date-time', nullable: true },
                processingError: { type: 'string', nullable: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "getProcessingStatus", null);
__decorate([
    (0, common_1.Post)(':id/vectorize'),
    (0, swagger_1.ApiOperation)({
        summary: '手动触发文档向量化',
        description: '手动触发文档的向量化处理',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '文档ID' }),
    (0, swagger_1.ApiOkResponse)({ description: '向量化任务已触发' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '文档不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KnowledgeDocumentController.prototype, "triggerVectorization", null);
exports.KnowledgeDocumentController = KnowledgeDocumentController = __decorate([
    (0, swagger_1.ApiTags)('knowledge'),
    (0, common_1.Controller)('api/v1/knowledge/documents'),
    __metadata("design:paramtypes", [knowledge_document_service_1.KnowledgeDocumentService])
], KnowledgeDocumentController);
//# sourceMappingURL=knowledge-document.controller.js.map