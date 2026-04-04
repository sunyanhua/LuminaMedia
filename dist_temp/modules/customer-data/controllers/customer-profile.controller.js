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
exports.CustomerProfileController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const customer_profile_service_1 = require("../services/customer-profile.service");
const customer_profile_entity_1 = require("../../../entities/customer-profile.entity");
const create_customer_profile_dto_1 = require("../dto/create-customer-profile.dto");
const update_customer_profile_dto_1 = require("../dto/update-customer-profile.dto");
const customer_type_enum_1 = require("../../../shared/enums/customer-type.enum");
const industry_enum_1 = require("../../../shared/enums/industry.enum");
let CustomerProfileController = class CustomerProfileController {
    customerProfileService;
    constructor(customerProfileService) {
        this.customerProfileService = customerProfileService;
    }
    async createProfile(createDto) {
        const { userId, customerName, customerType, industry, dataSources } = createDto;
        return await this.customerProfileService.createProfile(userId, customerName, customerType, industry, dataSources);
    }
    async getProfile(id) {
        return await this.customerProfileService.getProfile(id);
    }
    async getProfilesByUser(userId) {
        return await this.customerProfileService.getProfilesByUser(userId);
    }
    async updateProfile(id, updateDto) {
        return await this.customerProfileService.updateProfile(id, updateDto);
    }
    async deleteProfile(id) {
        await this.customerProfileService.deleteProfile(id);
    }
    async generateMallCustomerDemo(id) {
        const profile = await this.customerProfileService.getProfile(id);
        return await this.customerProfileService.generateMallCustomerDemo(profile.userId);
    }
    async getProfileStats(id) {
        return await this.customerProfileService.getProfileStats(id);
    }
    getIndustries() {
        return Object.entries(industry_enum_1.Industry).map(([_key, value]) => ({
            value,
            label: this.getIndustryLabel(value),
        }));
    }
    getCustomerTypes() {
        return Object.entries(customer_type_enum_1.CustomerType).map(([_key, value]) => ({
            value,
            label: this.getCustomerTypeLabel(value),
        }));
    }
    getIndustryLabel(industry) {
        const labels = {
            [industry_enum_1.Industry.RETAIL]: '零售',
            [industry_enum_1.Industry.ECOMMERCE]: '电子商务',
            [industry_enum_1.Industry.RESTAURANT]: '餐饮',
            [industry_enum_1.Industry.EDUCATION]: '教育',
            [industry_enum_1.Industry.HEALTHCARE]: '医疗健康',
            [industry_enum_1.Industry.FINANCE]: '金融',
            [industry_enum_1.Industry.REAL_ESTATE]: '房地产',
            [industry_enum_1.Industry.TRAVEL_HOTEL]: '旅游酒店',
            [industry_enum_1.Industry.MANUFACTURING]: '制造业',
            [industry_enum_1.Industry.TECHNOLOGY]: '科技互联网',
            [industry_enum_1.Industry.MEDIA_ENTERTAINMENT]: '媒体娱乐',
            [industry_enum_1.Industry.AUTOMOTIVE]: '汽车',
            [industry_enum_1.Industry.FASHION_BEAUTY]: '时尚美容',
            [industry_enum_1.Industry.SPORTS_FITNESS]: '体育健身',
            [industry_enum_1.Industry.GOVERNMENT]: '政府机构',
            [industry_enum_1.Industry.RESEARCH]: '研究机构',
            [industry_enum_1.Industry.PUBLIC_SERVICE]: '公共服务',
            [industry_enum_1.Industry.OTHER]: '其他',
        };
        return labels[industry] || industry;
    }
    getCustomerTypeLabel(customerType) {
        const labels = {
            [customer_type_enum_1.CustomerType.INDIVIDUAL]: '个人客户',
            [customer_type_enum_1.CustomerType.ENTERPRISE]: '企业客户',
            [customer_type_enum_1.CustomerType.SME]: '中小型企业',
            [customer_type_enum_1.CustomerType.INDIVIDUAL_BUSINESS]: '个体工商户',
            [customer_type_enum_1.CustomerType.GOVERNMENT]: '政府机构',
            [customer_type_enum_1.CustomerType.NON_PROFIT]: '非营利组织',
        };
        return labels[customerType] || customerType;
    }
};
exports.CustomerProfileController = CustomerProfileController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: '创建客户档案',
        description: '创建新的客户档案，包含客户基本信息、行业分类等',
    }),
    (0, swagger_1.ApiBody)({ type: create_customer_profile_dto_1.CreateCustomerProfileDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '客户档案创建成功',
        type: customer_profile_entity_1.CustomerProfile,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数无效' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_profile_dto_1.CreateCustomerProfileDto]),
    __metadata("design:returntype", Promise)
], CustomerProfileController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '获取客户档案详情',
        description: '根据ID获取客户档案的详细信息，包括关联的导入任务和分群',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        type: customer_profile_entity_1.CustomerProfile,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '获取用户客户档案列表',
        description: '根据用户ID获取该用户的所有客户档案列表',
    }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: true, description: '用户ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        type: [customer_profile_entity_1.CustomerProfile],
    }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerProfileController.prototype, "getProfilesByUser", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '更新客户档案',
        description: '更新客户档案的部分或全部信息',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '客户档案ID' }),
    (0, swagger_1.ApiBody)({ type: update_customer_profile_dto_1.UpdateCustomerProfileDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '更新成功',
        type: customer_profile_entity_1.CustomerProfile,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_customer_profile_dto_1.UpdateCustomerProfileDto]),
    __metadata("design:returntype", Promise)
], CustomerProfileController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: '删除客户档案',
        description: '删除客户档案及其关联的导入任务和分群数据',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerProfileController.prototype, "deleteProfile", null);
__decorate([
    (0, common_1.Post)(':id/generate-demo'),
    (0, swagger_1.ApiOperation)({
        summary: '生成商场客户演示数据',
        description: '为指定的客户档案生成完整的商场客户演示数据，包括模拟的导入任务和客户分群',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '演示数据生成成功',
        schema: {
            type: 'object',
            properties: {
                profile: { $ref: '#/components/schemas/CustomerProfile' },
                importJobs: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/DataImportJob' },
                },
                segments: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CustomerSegment' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerProfileController.prototype, "generateMallCustomerDemo", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, swagger_1.ApiOperation)({
        summary: '获取客户档案统计信息',
        description: '获取客户档案的统计数据，包括导入任务数量、记录总数、分群数量等',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '客户档案ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                profileName: { type: 'string' },
                industry: { type: 'string' },
                totalImportJobs: { type: 'number' },
                completedImports: { type: 'number' },
                totalRecords: { type: 'number' },
                totalSegments: { type: 'number' },
                totalMembers: { type: 'number' },
                dataFreshness: { type: 'string' },
                insightsCount: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '客户档案不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerProfileController.prototype, "getProfileStats", null);
__decorate([
    (0, common_1.Get)('enums/industries'),
    (0, swagger_1.ApiOperation)({
        summary: '获取行业枚举列表',
        description: '获取系统支持的所有行业分类枚举值',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                industries: {
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
], CustomerProfileController.prototype, "getIndustries", null);
__decorate([
    (0, common_1.Get)('enums/customer-types'),
    (0, swagger_1.ApiOperation)({
        summary: '获取客户类型枚举列表',
        description: '获取系统支持的所有客户类型枚举值',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                customerTypes: {
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
], CustomerProfileController.prototype, "getCustomerTypes", null);
exports.CustomerProfileController = CustomerProfileController = __decorate([
    (0, swagger_1.ApiTags)('customer-data'),
    (0, common_1.Controller)('api/v1/customer-data/profiles'),
    __metadata("design:paramtypes", [customer_profile_service_1.CustomerProfileService])
], CustomerProfileController);
//# sourceMappingURL=customer-profile.controller.js.map