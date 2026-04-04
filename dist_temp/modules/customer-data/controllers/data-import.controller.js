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
exports.DataImportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const data_import_service_1 = require("../services/data-import.service");
const data_import_job_entity_1 = require("../../../entities/data-import-job.entity");
const create_import_job_dto_1 = require("../dto/create-import-job.dto");
const process_import_dto_1 = require("../dto/process-import.dto");
const source_type_enum_1 = require("../../../shared/enums/source-type.enum");
const data_import_status_enum_1 = require("../../../shared/enums/data-import-status.enum");
let DataImportController = class DataImportController {
    dataImportService;
    constructor(dataImportService) {
        this.dataImportService = dataImportService;
    }
    async createImportJobForProfile(profileId, createDto) {
        return await this.dataImportService.createImportJob(profileId, createDto.sourceType, createDto.filePath, createDto.fileName, createDto.recordCount, createDto.notes);
    }
    async createImportJob(createDto) {
        return await this.dataImportService.createImportJob(createDto.customerProfileId, createDto.sourceType, createDto.filePath, createDto.fileName, createDto.recordCount, createDto.notes);
    }
    async getImportJob(id) {
        return await this.dataImportService.getImportJob(id);
    }
    async getImportJobsByProfile(profileId) {
        return await this.dataImportService.getImportJobsByProfile(profileId);
    }
    async processImportFile(id, processDto) {
        return await this.dataImportService.processImportFile(id, processDto.fileContent);
    }
    async cancelImportJob(id) {
        return await this.dataImportService.cancelImportJob(id);
    }
    async retryImportJob(id) {
        return await this.dataImportService.retryImportJob(id);
    }
    async getImportStats(profileId) {
        return await this.dataImportService.getImportStats(profileId);
    }
    async validateImportData(id, validationRules) {
        return await this.dataImportService.validateImportData(id, validationRules);
    }
    getSourceTypes() {
        return Object.entries(source_type_enum_1.SourceType).map(([key, value]) => ({
            value,
            label: this.getSourceTypeLabel(value),
        }));
    }
    getImportStatuses() {
        return Object.entries(data_import_status_enum_1.DataImportStatus).map(([key, value]) => ({
            value,
            label: this.getImportStatusLabel(value),
        }));
    }
    getSourceTypeLabel(sourceType) {
        const labels = {
            [source_type_enum_1.SourceType.CSV]: 'CSV文件',
            [source_type_enum_1.SourceType.EXCEL]: 'Excel文件',
            [source_type_enum_1.SourceType.JSON]: 'JSON文件',
            [source_type_enum_1.SourceType.DATABASE]: '数据库',
            [source_type_enum_1.SourceType.API]: 'API接口',
            [source_type_enum_1.SourceType.MANUAL]: '手工录入',
            [source_type_enum_1.SourceType.OTHER]: '其他',
        };
        return labels[sourceType] || sourceType;
    }
    getImportStatusLabel(status) {
        const labels = {
            [data_import_status_enum_1.DataImportStatus.PENDING]: '待处理',
            [data_import_status_enum_1.DataImportStatus.PROCESSING]: '处理中',
            [data_import_status_enum_1.DataImportStatus.SUCCESS]: '成功',
            [data_import_status_enum_1.DataImportStatus.PARTIAL_SUCCESS]: '部分成功',
            [data_import_status_enum_1.DataImportStatus.FAILED]: '失败',
            [data_import_status_enum_1.DataImportStatus.CANCELLED]: '已取消',
        };
        return labels[status] || status;
    }
};
exports.DataImportController = DataImportController;
__decorate([
    (0, common_1.Post)('profiles/:profileId/import'),
    (0, swagger_1.ApiOperation)({
        summary: '为客户档案创建数据导入任务',
        description: '为客户档案创建一个新的数据导入任务，支持CSV、Excel、API等多种数据源',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiBody)({ type: create_import_job_dto_1.CreateImportJobDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '导入任务创建成功',
        type: data_import_job_entity_1.DataImportJob,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数无效' }),
    __param(0, (0, common_1.Param)('profileId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_import_job_dto_1.CreateImportJobDto]),
    __metadata("design:returntype", Promise)
], DataImportController.prototype, "createImportJobForProfile", null);
__decorate([
    (0, common_1.Post)('import-jobs'),
    (0, swagger_1.ApiOperation)({
        summary: '创建数据导入任务',
        description: '创建一个新的数据导入任务',
    }),
    (0, swagger_1.ApiBody)({ type: create_import_job_dto_1.CreateImportJobDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '导入任务创建成功',
        type: data_import_job_entity_1.DataImportJob,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_import_job_dto_1.CreateImportJobDto]),
    __metadata("design:returntype", Promise)
], DataImportController.prototype, "createImportJob", null);
__decorate([
    (0, common_1.Get)('import-jobs/:id'),
    (0, swagger_1.ApiOperation)({
        summary: '获取导入任务详情',
        description: '根据ID获取数据导入任务的详细信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '导入任务ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        type: data_import_job_entity_1.DataImportJob,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '导入任务不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataImportController.prototype, "getImportJob", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/import-jobs'),
    (0, swagger_1.ApiOperation)({
        summary: '获取客户档案的导入任务列表',
        description: '获取指定客户档案的所有数据导入任务列表',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        type: [data_import_job_entity_1.DataImportJob],
    }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataImportController.prototype, "getImportJobsByProfile", null);
__decorate([
    (0, common_1.Post)('import-jobs/:id/process'),
    (0, swagger_1.ApiOperation)({
        summary: '处理导入文件',
        description: '处理已上传的数据文件，解析数据并验证',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '导入任务ID' }),
    (0, swagger_1.ApiBody)({ type: process_import_dto_1.ProcessImportDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '文件处理成功',
        type: data_import_job_entity_1.DataImportJob,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '导入任务不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '导入任务状态无效' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, process_import_dto_1.ProcessImportDto]),
    __metadata("design:returntype", Promise)
], DataImportController.prototype, "processImportFile", null);
__decorate([
    (0, common_1.Post)('import-jobs/:id/cancel'),
    (0, swagger_1.ApiOperation)({
        summary: '取消导入任务',
        description: '取消进行中的数据导入任务',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '导入任务ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '任务取消成功',
        type: data_import_job_entity_1.DataImportJob,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '导入任务不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '无法取消已完成或失败的任务' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataImportController.prototype, "cancelImportJob", null);
__decorate([
    (0, common_1.Post)('import-jobs/:id/retry'),
    (0, swagger_1.ApiOperation)({
        summary: '重试失败的导入任务',
        description: '重新执行失败的数据导入任务',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '导入任务ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '重试任务创建成功',
        type: data_import_job_entity_1.DataImportJob,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '导入任务不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '无法重试非失败状态的任务' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataImportController.prototype, "retryImportJob", null);
__decorate([
    (0, common_1.Get)('profiles/:profileId/import-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '获取导入任务统计信息',
        description: '获取指定客户档案的数据导入统计信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'profileId', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                totalJobs: { type: 'number' },
                completedJobs: { type: 'number' },
                pendingJobs: { type: 'number' },
                processingJobs: { type: 'number' },
                failedJobs: { type: 'number' },
                totalRecords: { type: 'number' },
                totalProcessed: { type: 'number' },
                totalFailed: { type: 'number' },
                successRate: { type: 'string' },
                lastImport: { type: 'string', format: 'date-time' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataImportController.prototype, "getImportStats", null);
__decorate([
    (0, common_1.Post)('import-jobs/:id/validate'),
    (0, swagger_1.ApiOperation)({
        summary: '验证导入数据',
        description: '对导入的数据进行验证，检查数据质量和合规性',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '导入任务ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                validationRules: {
                    type: 'object',
                    additionalProperties: true,
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '验证完成',
        schema: {
            type: 'object',
            properties: {
                isValid: { type: 'boolean' },
                issues: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            severity: { type: 'string', enum: ['error', 'warning', 'info'] },
                            message: { type: 'string' },
                            field: { type: 'string' },
                            row: { type: 'number' },
                        },
                    },
                },
                summary: { type: 'object' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('validationRules')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DataImportController.prototype, "validateImportData", null);
__decorate([
    (0, common_1.Get)('enums/source-types'),
    (0, swagger_1.ApiOperation)({
        summary: '获取数据源类型枚举列表',
        description: '获取系统支持的所有数据源类型枚举值',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                sourceTypes: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            value: { type: 'string' },
                            label: { type: 'string' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], DataImportController.prototype, "getSourceTypes", null);
__decorate([
    (0, common_1.Get)('enums/import-statuses'),
    (0, swagger_1.ApiOperation)({
        summary: '获取导入状态枚举列表',
        description: '获取系统支持的所有数据导入状态枚举值',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                importStatuses: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            value: { type: 'string' },
                            label: { type: 'string' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], DataImportController.prototype, "getImportStatuses", null);
exports.DataImportController = DataImportController = __decorate([
    (0, swagger_1.ApiTags)('customer-data'),
    (0, common_1.Controller)('api/v1/customer-data'),
    __metadata("design:paramtypes", [data_import_service_1.DataImportService])
], DataImportController);
//# sourceMappingURL=data-import.controller.js.map