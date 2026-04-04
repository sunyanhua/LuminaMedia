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
exports.FieldMappingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const field_mapping_service_1 = require("./field-mapping.service");
let FieldMappingController = class FieldMappingController {
    fieldMappingService;
    constructor(fieldMappingService) {
        this.fieldMappingService = fieldMappingService;
    }
    async mapHeaders(body) {
        const { headers, industry, dataSourceType, sampleData } = body;
        if (!headers || !Array.isArray(headers) || headers.length === 0) {
            throw new Error('headers参数必须是非空数组');
        }
        return this.fieldMappingService.mapHeadersWithAI(headers, {
            industry,
            dataSourceType,
            sampleData,
        });
    }
    async getStandardFields() {
        return this.fieldMappingService.getAllStandardFields();
    }
    async getStandardFieldsByCategory() {
        return this.fieldMappingService.getStandardFieldsByCategory();
    }
    async saveManualMapping(body) {
        const { sourceHeader, targetField, userId, notes } = body;
        if (!sourceHeader || !targetField || !userId) {
            throw new Error('sourceHeader, targetField, userId为必填参数');
        }
        this.fieldMappingService.saveManualMapping(sourceHeader, targetField, userId, notes);
        return {
            success: true,
            message: '人工映射保存成功',
        };
    }
    async getMappingStats() {
        return this.fieldMappingService.getMappingStats();
    }
    async validateMapping(body) {
        const { mapping, headers } = body;
        if (!mapping || !headers) {
            throw new Error('mapping和headers为必填参数');
        }
        const issues = [];
        let validCount = 0;
        const unmappedHeaders = headers.filter((h) => !mapping[h]);
        if (unmappedHeaders.length > 0) {
            issues.push({
                type: 'missing',
                description: `${unmappedHeaders.length}个表头未映射`,
                suggestion: `请为以下表头添加映射: ${unmappedHeaders.join(', ')}`,
            });
        }
        else {
            validCount++;
        }
        const targetFieldCount = {};
        Object.values(mapping).forEach((field) => {
            targetFieldCount[field] = (targetFieldCount[field] || 0) + 1;
        });
        const duplicateFields = Object.entries(targetFieldCount)
            .filter(([_, count]) => count > 1)
            .map(([field]) => field);
        if (duplicateFields.length > 0) {
            issues.push({
                type: 'duplicate',
                description: `${duplicateFields.length}个字段被多次映射`,
                suggestion: `以下字段被多次映射: ${duplicateFields.join(', ')}，建议检查映射准确性`,
            });
        }
        else {
            validCount++;
        }
        const standardFields = this.fieldMappingService.getAllStandardFields();
        const validFieldIds = new Set(standardFields.map((f) => f.id));
        const invalidMappings = Object.entries(mapping)
            .filter(([_, targetField]) => !validFieldIds.has(targetField))
            .map(([sourceHeader, targetField]) => `${sourceHeader} -> ${targetField}`);
        if (invalidMappings.length > 0) {
            issues.push({
                type: 'invalid',
                description: `${invalidMappings.length}个映射使用了无效字段`,
                suggestion: `无效映射: ${invalidMappings.join('; ')}`,
            });
        }
        else {
            validCount++;
        }
        const score = Math.round((validCount / 3) * 100);
        return {
            valid: issues.length === 0,
            issues,
            score,
        };
    }
    async batchProcess(body) {
        const { files, autoConfirm = false } = body;
        if (!files || !Array.isArray(files) || files.length === 0) {
            throw new Error('files参数必须是非空数组');
        }
        const results = [];
        let totalMappedHeaders = 0;
        let totalHeaders = 0;
        let totalConfidence = 0;
        let confidenceCount = 0;
        for (const file of files) {
            const mappingResult = await this.fieldMappingService.mapHeadersWithAI(file.headers, {
                industry: file.industry,
                dataSourceType: file.dataSourceType,
            });
            const mappedCount = Object.keys(mappingResult.mapping).length;
            totalMappedHeaders += mappedCount;
            totalHeaders += file.headers.length;
            Object.values(mappingResult.confidence).forEach((confidence) => {
                totalConfidence += confidence;
                confidenceCount++;
            });
            const issues = [];
            if (mappingResult.unmatchedHeaders.length > 0) {
                issues.push(`${mappingResult.unmatchedHeaders.length}个表头未匹配`);
            }
            results.push({
                filename: file.filename,
                mappingResult,
                autoConfirmed: autoConfirm,
                issues,
            });
        }
        const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
        const matchRate = totalHeaders > 0 ? totalMappedHeaders / totalHeaders : 0;
        return {
            results,
            summary: {
                totalFiles: files.length,
                mappedHeaders: totalMappedHeaders,
                totalHeaders,
                matchRate,
                averageConfidence,
            },
        };
    }
};
exports.FieldMappingController = FieldMappingController;
__decorate([
    (0, common_1.Post)('map-headers'),
    (0, swagger_1.ApiOperation)({
        summary: '映射表头到标准字段',
        description: '使用AI自动识别非标Excel/API表头，转换为标准4维度字段',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '映射成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数无效' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FieldMappingController.prototype, "mapHeaders", null);
__decorate([
    (0, common_1.Get)('standard-fields'),
    (0, swagger_1.ApiOperation)({
        summary: '获取所有标准字段',
        description: '获取4维度共50+标准字段列表',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FieldMappingController.prototype, "getStandardFields", null);
__decorate([
    (0, common_1.Get)('standard-fields/by-category'),
    (0, swagger_1.ApiOperation)({
        summary: '按分类获取标准字段',
        description: '按4维度分类组织标准字段',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FieldMappingController.prototype, "getStandardFieldsByCategory", null);
__decorate([
    (0, common_1.Post)('manual-mapping'),
    (0, swagger_1.ApiOperation)({
        summary: '保存人工修正映射',
        description: '保存用户手动修正的字段映射规则',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '保存成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '无效的映射' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FieldMappingController.prototype, "saveManualMapping", null);
__decorate([
    (0, common_1.Get)('mapping-stats'),
    (0, swagger_1.ApiOperation)({
        summary: '获取映射统计信息',
        description: '获取映射规则的学习和缓存统计信息',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FieldMappingController.prototype, "getMappingStats", null);
__decorate([
    (0, common_1.Post)('validate-mapping'),
    (0, swagger_1.ApiOperation)({
        summary: '验证映射结果',
        description: '验证字段映射结果的准确性和完整性',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '验证完成' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FieldMappingController.prototype, "validateMapping", null);
__decorate([
    (0, common_1.Post)('batch-process'),
    (0, swagger_1.ApiOperation)({
        summary: '批量处理表头映射',
        description: '批量处理多个文件的表头映射，支持批量确认和修正',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '处理成功' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FieldMappingController.prototype, "batchProcess", null);
exports.FieldMappingController = FieldMappingController = __decorate([
    (0, swagger_1.ApiTags)('字段映射'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('data-engine/field-mapping'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [field_mapping_service_1.FieldMappingService])
], FieldMappingController);
//# sourceMappingURL=field-mapping.controller.js.map