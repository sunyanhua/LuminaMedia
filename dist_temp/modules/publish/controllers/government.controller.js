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
exports.GovernmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const feature_guard_1 = require("../../auth/guards/feature.guard");
const feature_decorator_1 = require("../../auth/decorators/feature.decorator");
const government_content_service_1 = require("../services/government-content.service");
const compliance_check_service_1 = require("../services/compliance-check.service");
const government_content_interface_1 = require("../interfaces/government-content.interface");
let GovernmentController = class GovernmentController {
    governmentContentService;
    complianceCheckService;
    constructor(governmentContentService, complianceCheckService) {
        this.governmentContentService = governmentContentService;
        this.complianceCheckService = complianceCheckService;
    }
    async generateContent(request) {
        return await this.governmentContentService.generateContent(request);
    }
    async checkCompliance(content) {
        return await this.complianceCheckService.checkCompliance(content);
    }
    async batchCheckCompliance(contents) {
        return await this.complianceCheckService.batchCheckCompliance(contents);
    }
    async getTemplates() {
        return this.governmentContentService.getTemplates();
    }
    async getTemplate(templateId) {
        const templates = await this.governmentContentService.getTemplates();
        return templates.find((template) => template.id === templateId) || null;
    }
    async getScripts() {
        return this.governmentContentService.getScripts();
    }
    async getScript(scriptId) {
        const scripts = await this.governmentContentService.getScripts();
        return scripts.find((script) => script.id === scriptId) || null;
    }
    async executeScript(scriptId, speed = '1') {
        const scripts = await this.governmentContentService.getScripts();
        const script = scripts.find((s) => s.id === scriptId);
        if (!script) {
            return {
                success: false,
                message: `剧本不存在: ${scriptId}`,
                steps: [],
                totalDuration: 0,
            };
        }
        const steps = [];
        let totalDuration = 0;
        for (const step of script.steps) {
            const stepStartTime = Date.now();
            await new Promise((resolve) => {
                const duration = step.timeAllocation
                    ? (step.timeAllocation * 1000) / parseInt(speed)
                    : 1000;
                setTimeout(resolve, duration);
            });
            const stepDuration = Date.now() - stepStartTime;
            totalDuration += stepDuration;
            steps.push({
                step: step.step,
                name: step.name,
                result: {
                    success: true,
                    message: `步骤 ${step.step} 执行成功`,
                    expectedResult: step.expectedResult,
                },
                duration: stepDuration,
            });
        }
        return {
            success: true,
            message: `剧本执行完成: ${script.name}`,
            steps,
            totalDuration,
        };
    }
    async getStats() {
        return this.governmentContentService.getStats();
    }
    async getContentTypes() {
        const types = [
            {
                value: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                label: '公文发布',
                description: '政府公文、通知、通报等正式文件',
            },
            {
                value: government_content_interface_1.GovernmentContentType.ANTI_FRAUD,
                label: '防诈骗宣传',
                description: '防诈骗警示宣传材料',
            },
            {
                value: government_content_interface_1.GovernmentContentType.POLICY_INTERPRETATION,
                label: '政策解读',
                description: '政策文件解读和说明',
            },
            {
                value: government_content_interface_1.GovernmentContentType.GOVERNMENT_SERVICE,
                label: '政务服务',
                description: '政务办事指南和服务说明',
            },
            {
                value: government_content_interface_1.GovernmentContentType.PUBLIC_ANNOUNCEMENT,
                label: '公共通知',
                description: '公共事务通知和公告',
            },
            {
                value: government_content_interface_1.GovernmentContentType.EMERGENCY_RESPONSE,
                label: '应急响应',
                description: '突发事件应急响应信息',
            },
        ];
        return { types };
    }
    async getContentStyles() {
        const styles = [
            {
                value: government_content_interface_1.GovernmentContentStyle.FORMAL,
                label: '正式',
                description: '正式公文风格，严谨规范',
            },
            {
                value: government_content_interface_1.GovernmentContentStyle.SERIOUS,
                label: '严肃',
                description: '严肃警示风格，具有威慑力',
            },
            {
                value: government_content_interface_1.GovernmentContentStyle.AUTHORITATIVE,
                label: '权威',
                description: '权威解读风格，专业可信',
            },
            {
                value: government_content_interface_1.GovernmentContentStyle.INSTRUCTIVE,
                label: '指导性',
                description: '指导说明风格，清晰易懂',
            },
            {
                value: government_content_interface_1.GovernmentContentStyle.FRIENDLY,
                label: '亲民友好',
                description: '亲民友好风格，贴近群众',
            },
        ];
        return { styles };
    }
    async getComplianceLevels() {
        const levels = [
            {
                value: government_content_interface_1.ComplianceLevel.HIGH,
                label: '高',
                description: '高合规性要求，如红头文件',
            },
            {
                value: government_content_interface_1.ComplianceLevel.MEDIUM,
                label: '中',
                description: '中等合规性要求，如宣传材料',
            },
            {
                value: government_content_interface_1.ComplianceLevel.LOW,
                label: '低',
                description: '低合规性要求，如内部通知',
            },
        ];
        return { levels };
    }
    async testGenerate(type = government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT) {
        const sampleRequests = {
            [government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT]: {
                contentType: government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT,
                theme: '关于加强安全生产工作的通知',
                style: government_content_interface_1.GovernmentContentStyle.FORMAL,
                complianceLevel: government_content_interface_1.ComplianceLevel.HIGH,
                params: {
                    issuingAuthority: 'XX市安全生产委员会办公室',
                    documentNumber: `X安委办〔${new Date().getFullYear()}〕12号`,
                },
            },
            [government_content_interface_1.GovernmentContentType.ANTI_FRAUD]: {
                contentType: government_content_interface_1.GovernmentContentType.ANTI_FRAUD,
                theme: '防范电信网络诈骗',
                style: government_content_interface_1.GovernmentContentStyle.SERIOUS,
                complianceLevel: government_content_interface_1.ComplianceLevel.MEDIUM,
                params: {
                    fraudType: '电信网络诈骗',
                },
            },
            [government_content_interface_1.GovernmentContentType.POLICY_INTERPRETATION]: {
                contentType: government_content_interface_1.GovernmentContentType.POLICY_INTERPRETATION,
                theme: '小微企业税收优惠政策解读',
                style: government_content_interface_1.GovernmentContentStyle.AUTHORITATIVE,
                complianceLevel: government_content_interface_1.ComplianceLevel.HIGH,
                params: {
                    issuingAuthority: 'XX市税务局',
                },
            },
            [government_content_interface_1.GovernmentContentType.GOVERNMENT_SERVICE]: {
                contentType: government_content_interface_1.GovernmentContentType.GOVERNMENT_SERVICE,
                theme: '企业开办一站式服务',
                style: government_content_interface_1.GovernmentContentStyle.INSTRUCTIVE,
                complianceLevel: government_content_interface_1.ComplianceLevel.MEDIUM,
            },
            [government_content_interface_1.GovernmentContentType.PUBLIC_ANNOUNCEMENT]: {
                contentType: government_content_interface_1.GovernmentContentType.PUBLIC_ANNOUNCEMENT,
                theme: '关于临时交通管制的通知',
                style: government_content_interface_1.GovernmentContentStyle.FRIENDLY,
                complianceLevel: government_content_interface_1.ComplianceLevel.LOW,
            },
            [government_content_interface_1.GovernmentContentType.EMERGENCY_RESPONSE]: {
                contentType: government_content_interface_1.GovernmentContentType.EMERGENCY_RESPONSE,
                theme: '台风应急响应',
                style: government_content_interface_1.GovernmentContentStyle.SERIOUS,
                complianceLevel: government_content_interface_1.ComplianceLevel.HIGH,
            },
        };
        const request = sampleRequests[type] ||
            sampleRequests[government_content_interface_1.GovernmentContentType.OFFICIAL_DOCUMENT];
        return await this.governmentContentService.generateContent(request);
    }
};
exports.GovernmentController = GovernmentController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '生成政府内容',
        description: '根据指定类型和参数生成政府场景内容',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '内容生成成功', type: Object }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "generateContent", null);
__decorate([
    (0, common_1.Post)('check-compliance'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '检查内容合规性',
        description: '检查政府内容是否符合法律法规和政策要求',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '合规性检查完成', type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "checkCompliance", null);
__decorate([
    (0, common_1.Post)('batch-check-compliance'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '批量检查合规性',
        description: '批量检查多个政府内容的合规性',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '批量合规性检查完成', type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "batchCheckCompliance", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({
        summary: '获取内容模板列表',
        description: '获取所有可用的政府内容模板',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取模板列表', type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('templates/:templateId'),
    (0, swagger_1.ApiOperation)({
        summary: '获取模板详情',
        description: '获取指定模板的详细信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'templateId', description: '模板ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取模板详情', type: Object }),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Get)('scripts'),
    (0, swagger_1.ApiOperation)({
        summary: '获取演示剧本列表',
        description: '获取所有可用的政府场景演示剧本',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取剧本列表', type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "getScripts", null);
__decorate([
    (0, common_1.Get)('scripts/:scriptId'),
    (0, swagger_1.ApiOperation)({
        summary: '获取剧本详情',
        description: '获取指定演示剧本的详细信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'scriptId', description: '剧本ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取剧本详情', type: Object }),
    __param(0, (0, common_1.Param)('scriptId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "getScript", null);
__decorate([
    (0, common_1.Post)('scripts/:scriptId/execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '执行演示剧本',
        description: '执行指定的政府场景演示剧本',
    }),
    (0, swagger_1.ApiParam)({ name: 'scriptId', description: '剧本ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'speed',
        required: false,
        description: '执行速度（1=正常，2=快速）',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '剧本执行完成', type: Object }),
    __param(0, (0, common_1.Param)('scriptId')),
    __param(1, (0, common_1.Query)('speed')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "executeScript", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: '获取统计信息',
        description: '获取政府内容生成和合规性检查的统计信息',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取统计信息', type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('content-types'),
    (0, swagger_1.ApiOperation)({
        summary: '获取内容类型枚举',
        description: '获取所有支持的政府内容类型',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '成功获取内容类型枚举',
        type: Object,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "getContentTypes", null);
__decorate([
    (0, common_1.Get)('content-styles'),
    (0, swagger_1.ApiOperation)({
        summary: '获取内容风格枚举',
        description: '获取所有支持的政府内容风格',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '成功获取内容风格枚举',
        type: Object,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "getContentStyles", null);
__decorate([
    (0, common_1.Get)('compliance-levels'),
    (0, swagger_1.ApiOperation)({
        summary: '获取合规级别枚举',
        description: '获取所有支持的合规级别',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '成功获取合规级别枚举',
        type: Object,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "getComplianceLevels", null);
__decorate([
    (0, common_1.Post)('test-generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '测试内容生成',
        description: '生成示例内容用于测试',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        description: '内容类型，默认为公文发布',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '测试内容生成成功', type: Object }),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GovernmentController.prototype, "testGenerate", null);
exports.GovernmentController = GovernmentController = __decorate([
    (0, swagger_1.ApiTags)('政府内容管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('government'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, feature_decorator_1.Feature)('government-publish'),
    __metadata("design:paramtypes", [government_content_service_1.GovernmentContentService,
        compliance_check_service_1.ComplianceCheckService])
], GovernmentController);
//# sourceMappingURL=government.controller.js.map