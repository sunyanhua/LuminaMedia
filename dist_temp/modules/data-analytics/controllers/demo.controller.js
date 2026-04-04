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
exports.DemoController = void 0;
const common_1 = require("@nestjs/common");
const demo_service_1 = require("../services/demo.service");
const government_demo_service_1 = require("../../government/services/government-demo.service");
let DemoController = class DemoController {
    demoService;
    governmentDemoService;
    constructor(demoService, governmentDemoService) {
        this.demoService = demoService;
        this.governmentDemoService = governmentDemoService;
    }
    async quickStartDemo(userId) {
        try {
            const demoResult = await this.demoService.createMallCustomerDemo(userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
            return {
                success: true,
                message: '演示流程执行成功',
                data: {
                    demoId: `demo-${Date.now()}`,
                    customerProfile: {
                        id: demoResult.customerProfile.id,
                        name: demoResult.customerProfile.customerName,
                        description: demoResult.customerProfile.profileData?.description ||
                            '商场顾客数据',
                    },
                    segments: demoResult.segments.map((s) => ({
                        id: s.id,
                        segmentName: s.segmentName,
                        description: s.description,
                        memberCount: s.memberCount,
                    })),
                    campaign: {
                        id: demoResult.campaign.id,
                        name: demoResult.campaign.name,
                        budget: demoResult.campaign.budget,
                        status: demoResult.campaign.status,
                    },
                    strategies: demoResult.strategies.map((s) => ({
                        id: s.id,
                        strategyType: s.strategyType,
                        confidenceScore: s.confidenceScore,
                        expectedROI: s.expectedROI,
                    })),
                    contentGenerated: !!demoResult.contentGenerationResult?.success,
                    contentPlatforms: demoResult.contentGenerationResult?.marketingContent?.recommendedPostingSchedule?.map((s) => s.platform) || [],
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'DEMO_ERROR',
                    message: error.message || '演示流程执行失败',
                    details: error.stack,
                },
            };
        }
    }
    async getMallCustomerScenario() {
        try {
            const scenario = {
                name: '商场顾客营销方案演示',
                description: '模拟商场顾客数据，展示从数据导入到营销内容生成的全流程',
                steps: [
                    {
                        step: 1,
                        title: '数据导入',
                        description: '导入1000条商场顾客消费记录CSV文件',
                        dataSource: 'demo-data/mall_customers.csv',
                    },
                    {
                        step: 2,
                        title: '客户分析',
                        description: '自动分析客户特征，生成用户画像和消费行为洞察',
                        analysisTypes: ['人口统计', '消费习惯', '兴趣偏好', '时间模式'],
                    },
                    {
                        step: 3,
                        title: '客户分群',
                        description: '基于分析结果将客户分为3个典型群体',
                        segments: ['高价值VIP客户', '年轻时尚族群', '家庭消费群体'],
                    },
                    {
                        step: 4,
                        title: '活动策划',
                        description: '创建"商场春季焕新购物节"营销活动',
                        budget: 200000,
                        duration: '3个月',
                        target: '提升商场客流量和消费额',
                    },
                    {
                        step: 5,
                        title: '策略生成',
                        description: '使用AI生成4种类型的营销策略',
                        strategies: ['内容策略', '渠道策略', '时间策略', '预算策略'],
                    },
                    {
                        step: 6,
                        title: '内容生成',
                        description: '为小红书和微信公众号生成营销内容',
                        platforms: ['小红书', '微信公众号'],
                        contentTypes: ['促销文案', '教育文章'],
                    },
                ],
                expectedOutcomes: [
                    '完整的客户画像分析报告',
                    '3个客户分群及特征描述',
                    '营销活动策划方案',
                    '4个AI生成的营销策略',
                    '跨平台营销内容包',
                ],
                estimatedTime: '2-3分钟',
            };
            return {
                success: true,
                data: scenario,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'SCENARIO_ERROR',
                    message: error.message || '获取场景数据失败',
                },
            };
        }
    }
    async resetDemoData(userId) {
        try {
            const result = await this.demoService.resetDemoData(userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
            return {
                success: true,
                message: '演示数据重置成功',
                data: result,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'RESET_ERROR',
                    message: error.message || '重置演示数据失败',
                },
            };
        }
    }
    async getDemoStatus() {
        try {
            const status = this.demoService.getDemoStatus();
            return {
                success: true,
                data: status,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'STATUS_ERROR',
                    message: error.message || '获取演示状态失败',
                },
            };
        }
    }
    async executeDemoStep(stepNumber, stepData) {
        const step = parseInt(stepNumber, 10);
        if (step < 1 || step > 6) {
            return {
                success: false,
                error: {
                    code: 'INVALID_STEP',
                    message: '步骤编号必须在1-6之间',
                },
            };
        }
        const stepDescriptions = [
            '数据导入步骤',
            '客户分析步骤',
            '客户分群步骤',
            '活动策划步骤',
            '策略生成步骤',
            '内容生成步骤',
        ];
        return {
            success: true,
            data: {
                step,
                description: stepDescriptions[step - 1],
                completed: true,
                timestamp: new Date().toISOString(),
                stepData,
            },
        };
    }
    async getDemoProgress(userId) {
        try {
            const progress = await this.demoService.getDemoProgress(userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
            return {
                success: true,
                data: progress,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'PROGRESS_ERROR',
                    message: error.message || '获取演示进度失败',
                },
            };
        }
    }
    async getDemoResults(userId) {
        try {
            const results = await this.demoService.getDemoResults(userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
            return {
                success: true,
                data: results,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'RESULTS_ERROR',
                    message: error.message || '获取演示结果失败',
                },
            };
        }
    }
    async validateDemoResults(userId) {
        try {
            const validation = await this.demoService.validateDemoResults(userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
            return {
                success: true,
                data: validation,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error.message || '验证演示结果失败',
                },
            };
        }
    }
    async generateDemoReport(userId) {
        try {
            const report = await this.demoService.generateDemoReport(userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
            return {
                success: true,
                data: report,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'REPORT_ERROR',
                    message: error.message || '生成演示报告失败',
                },
            };
        }
    }
    async getDemoDataTypes() {
        try {
            const dataTypes = [
                { id: 'mall-customer', name: '商场顾客营销方案', description: '商场顾客数据导入到营销内容生成全流程' },
                { id: 'government-demo', name: '政务版演示数据', description: '政务内容、舆情监测和地理分析数据' },
                { id: 'e-commerce', name: '电商用户行为分析', description: '电商用户购买行为分析和个性化推荐' },
                { id: 'social-media', name: '社交媒体舆情监测', description: '社交媒体舆情数据收集和情感分析' },
            ];
            return {
                success: true,
                data: dataTypes,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'DATA_TYPES_ERROR',
                    message: error.message || '获取演示数据类型失败',
                },
            };
        }
    }
    async generateGovernmentDemoData(tenantId) {
        try {
            await this.governmentDemoService.generateGovernmentDemoData(tenantId || 'demo-government-001');
            return {
                success: true,
                message: '政务版演示数据生成成功',
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'GOVERNMENT_DEMO_ERROR',
                    message: error.message || '政务版演示数据生成失败',
                },
            };
        }
    }
    async resetGovernmentDemoData(tenantId) {
        try {
            await this.governmentDemoService.clearGovernmentDemoData(tenantId || 'demo-government-001');
            return {
                success: true,
                message: '政务版演示数据重置成功',
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'GOVERNMENT_RESET_ERROR',
                    message: error.message || '政务版演示数据重置失败',
                },
            };
        }
    }
};
exports.DemoController = DemoController;
__decorate([
    (0, common_1.Post)('quick-start'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "quickStartDemo", null);
__decorate([
    (0, common_1.Get)('scenario/mall-customer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "getMallCustomerScenario", null);
__decorate([
    (0, common_1.Delete)('reset'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "resetDemoData", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "getDemoStatus", null);
__decorate([
    (0, common_1.Post)('step/:stepNumber'),
    __param(0, (0, common_1.Param)('stepNumber')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "executeDemoStep", null);
__decorate([
    (0, common_1.Get)('progress'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "getDemoProgress", null);
__decorate([
    (0, common_1.Get)('results'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "getDemoResults", null);
__decorate([
    (0, common_1.Get)('validate'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "validateDemoResults", null);
__decorate([
    (0, common_1.Get)('report'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "generateDemoReport", null);
__decorate([
    (0, common_1.Get)('data-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "getDemoDataTypes", null);
__decorate([
    (0, common_1.Post)('government/generate'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "generateGovernmentDemoData", null);
__decorate([
    (0, common_1.Delete)('government/reset'),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "resetGovernmentDemoData", null);
exports.DemoController = DemoController = __decorate([
    (0, common_1.Controller)('api/v1/analytics/demo'),
    __metadata("design:paramtypes", [demo_service_1.DemoService,
        government_demo_service_1.GovernmentDemoService])
], DemoController);
//# sourceMappingURL=demo.controller.js.map