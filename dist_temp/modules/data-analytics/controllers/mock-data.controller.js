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
exports.MockDataController = void 0;
const common_1 = require("@nestjs/common");
const mock_data_service_1 = require("../services/mock-data.service");
let MockDataController = class MockDataController {
    mockDataService;
    constructor(mockDataService) {
        this.mockDataService = mockDataService;
    }
    async generateMockData(userId) {
        if (!userId) {
            return {
                success: false,
                message: 'userId is required',
            };
        }
        try {
            const result = await this.mockDataService.generateMockData(userId);
            return {
                success: true,
                message: 'Mock data generated successfully',
                data: result,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to generate mock data',
            };
        }
    }
    async resetMockData(userId) {
        try {
            const result = await this.mockDataService.resetMockData(userId);
            return {
                success: true,
                message: userId
                    ? `Mock data for user ${userId} reset successfully`
                    : 'All mock data reset successfully',
                data: result,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to reset mock data',
            };
        }
    }
    async getMockDataStatus() {
        try {
            const status = await this.mockDataService.getMockDataStatus();
            return {
                success: true,
                data: status,
                summary: this.generateStatusSummary(status),
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to get mock data status',
            };
        }
    }
    generateStatusSummary(status) {
        return `当前模拟数据：${status.totalBehaviors} 条行为记录，${status.totalCampaigns} 个营销活动，${status.totalStrategies} 个营销策略`;
    }
};
exports.MockDataController = MockDataController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MockDataController.prototype, "generateMockData", null);
__decorate([
    (0, common_1.Post)('reset'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MockDataController.prototype, "resetMockData", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MockDataController.prototype, "getMockDataStatus", null);
exports.MockDataController = MockDataController = __decorate([
    (0, common_1.Controller)('api/v1/analytics/mock'),
    __metadata("design:paramtypes", [mock_data_service_1.MockDataService])
], MockDataController);
//# sourceMappingURL=mock-data.controller.js.map