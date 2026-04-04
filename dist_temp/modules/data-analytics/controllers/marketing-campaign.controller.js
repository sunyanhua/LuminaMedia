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
exports.MarketingCampaignController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const analytics_service_1 = require("../services/analytics.service");
const create_campaign_dto_1 = require("../dto/create-campaign.dto");
const campaign_status_enum_1 = require("../../../shared/enums/campaign-status.enum");
const marketing_campaign_repository_1 = require("../../../shared/repositories/marketing-campaign.repository");
let MarketingCampaignController = class MarketingCampaignController {
    campaignRepository;
    analyticsService;
    constructor(campaignRepository, analyticsService) {
        this.campaignRepository = campaignRepository;
        this.analyticsService = analyticsService;
    }
    async createCampaign(createCampaignDto) {
        const campaign = this.campaignRepository.create({
            ...createCampaignDto,
            status: campaign_status_enum_1.CampaignStatus.DRAFT,
            createdAt: new Date(),
        });
        const savedCampaign = await this.campaignRepository.save(campaign);
        return {
            success: true,
            message: 'Campaign created successfully',
            data: savedCampaign,
        };
    }
    async getCampaigns(userId, status, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (status) {
            where.status = status;
        }
        const [campaigns, total] = await this.campaignRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            success: true,
            data: {
                campaigns,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        };
    }
    async getCampaign(id) {
        const campaign = await this.campaignRepository.findOne({
            where: { id },
            relations: ['strategies'],
        });
        if (!campaign) {
            return {
                success: false,
                message: `Campaign ${id} not found`,
            };
        }
        return {
            success: true,
            data: campaign,
        };
    }
    async updateCampaign(id, updateData) {
        const campaign = await this.campaignRepository.findOne({
            where: { id },
        });
        if (!campaign) {
            return {
                success: false,
                message: `Campaign ${id} not found`,
            };
        }
        const { id: _, createdAt: __, ...safeUpdateData } = updateData;
        Object.assign(campaign, safeUpdateData);
        const updatedCampaign = await this.campaignRepository.save(campaign);
        return {
            success: true,
            message: 'Campaign updated successfully',
            data: updatedCampaign,
        };
    }
    async analyzeCampaign(id) {
        try {
            const insights = await this.analyticsService.generateCampaignInsights(id);
            return {
                success: true,
                message: 'Campaign analysis completed',
                data: insights,
                recommendations: this.generateRecommendations(insights),
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to analyze campaign',
            };
        }
    }
    generateRecommendations(insights) {
        const recommendations = [];
        if (insights.totalStrategies === 0) {
            recommendations.push('建议为活动创建营销策略');
        }
        if (insights.averageConfidenceScore < 70) {
            recommendations.push('策略置信度较低，建议进一步优化或进行测试');
        }
        if (insights.estimatedTotalROI < 30) {
            recommendations.push('预期 ROI 较低，建议调整策略或预算分配');
        }
        if (insights.completionRate === 0) {
            recommendations.push('活动尚未完成，建议设置明确的时间节点和目标');
        }
        if (recommendations.length === 0) {
            recommendations.push('活动表现良好，继续保持当前策略');
        }
        return recommendations;
    }
};
exports.MarketingCampaignController = MarketingCampaignController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_campaign_dto_1.CreateCampaignDto]),
    __metadata("design:returntype", Promise)
], MarketingCampaignController.prototype, "createCampaign", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], MarketingCampaignController.prototype, "getCampaigns", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketingCampaignController.prototype, "getCampaign", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketingCampaignController.prototype, "updateCampaign", null);
__decorate([
    (0, common_1.Post)(':id/analyze'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketingCampaignController.prototype, "analyzeCampaign", null);
exports.MarketingCampaignController = MarketingCampaignController = __decorate([
    (0, common_1.Controller)('api/v1/analytics/campaigns'),
    __param(0, (0, typeorm_1.InjectRepository)(marketing_campaign_repository_1.MarketingCampaignRepository)),
    __metadata("design:paramtypes", [marketing_campaign_repository_1.MarketingCampaignRepository,
        analytics_service_1.AnalyticsService])
], MarketingCampaignController);
//# sourceMappingURL=marketing-campaign.controller.js.map