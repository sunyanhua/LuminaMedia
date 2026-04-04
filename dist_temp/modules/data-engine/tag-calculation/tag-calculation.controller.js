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
exports.TagCalculationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const tag_calculation_service_1 = require("./tag-calculation.service");
let TagCalculationController = class TagCalculationController {
    tagCalculatorService;
    constructor(tagCalculatorService) {
        this.tagCalculatorService = tagCalculatorService;
    }
    async calculateTags(body) {
        const { tagName, forceRecalculate = false, batchSize } = body;
        return this.tagCalculatorService.calculateTags(tagName, forceRecalculate);
    }
    async getTagDefinitions() {
        return this.tagCalculatorService.getTagDefinitions();
    }
    async getTagDefinition(tagName) {
        const definitions = this.tagCalculatorService.getTagDefinitions();
        const definition = definitions.find((def) => def.name === tagName);
        if (!definition) {
            throw new Error(`标签 ${tagName} 不存在`);
        }
        return definition;
    }
    async getCalculationStatus() {
        const definitions = this.tagCalculatorService.getTagDefinitions();
        return {
            tags: definitions.map((def) => ({
                name: def.name,
                lastCalculated: undefined,
                nextCalculation: undefined,
                refreshInterval: def.refreshInterval,
                dependsOn: def.dependsOn || [],
            })),
            systemStatus: 'idle',
            lastCalculationTime: undefined,
            nextScheduledCalculation: undefined,
        };
    }
    async createCustomTag(body) {
        return {
            success: true,
            message: '自定义标签创建成功（待实现）',
            tagName: body.name,
        };
    }
    async testSqlTemplate(body) {
        const { sqlTemplate, sampleSize = 10 } = body;
        return {
            valid: false,
            error: 'SQL测试功能待实现',
        };
    }
};
exports.TagCalculationController = TagCalculationController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({
        summary: '执行标签计算',
        description: '执行离线标签计算，基于SQL模板系统批量计算用户标签',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '计算成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数无效' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TagCalculationController.prototype, "calculateTags", null);
__decorate([
    (0, common_1.Get)('tags'),
    (0, swagger_1.ApiOperation)({
        summary: '获取所有标签定义',
        description: '获取系统支持的所有标签定义，包括SQL模板和刷新间隔',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TagCalculationController.prototype, "getTagDefinitions", null);
__decorate([
    (0, common_1.Get)('tags/:tagName'),
    (0, swagger_1.ApiOperation)({
        summary: '获取单个标签定义',
        description: '根据标签名称获取详细的标签定义信息',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '标签不存在' }),
    __param(0, (0, common_1.Param)('tagName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TagCalculationController.prototype, "getTagDefinition", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: '获取标签计算状态',
        description: '获取各标签的最后计算时间和下次计算计划',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TagCalculationController.prototype, "getCalculationStatus", null);
__decorate([
    (0, common_1.Post)('custom-tag'),
    (0, swagger_1.ApiOperation)({
        summary: '创建自定义标签',
        description: '创建自定义SQL标签模板，支持复杂业务规则',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'SQL模板无效' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TagCalculationController.prototype, "createCustomTag", null);
__decorate([
    (0, common_1.Post)('test-sql'),
    (0, swagger_1.ApiOperation)({
        summary: '测试SQL模板',
        description: '测试SQL模板语法的正确性和性能',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '测试完成' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TagCalculationController.prototype, "testSqlTemplate", null);
exports.TagCalculationController = TagCalculationController = __decorate([
    (0, swagger_1.ApiTags)('标签计算'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('data-engine/tag-calculation'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tag_calculation_service_1.TagCalculatorService])
], TagCalculationController);
//# sourceMappingURL=tag-calculation.controller.js.map