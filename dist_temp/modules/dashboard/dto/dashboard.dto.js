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
exports.ExportDashboardDto = exports.GenerateReportDto = exports.ChartDataQueryDto = exports.RealTimeMetricsQueryDto = exports.MarketingPerformanceQueryDto = exports.CustomerOverviewQueryDto = exports.DashboardStatsQueryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class DashboardStatsQueryDto {
    startDate;
    endDate;
}
exports.DashboardStatsQueryDto = DashboardStatsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '起始日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DashboardStatsQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '结束日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DashboardStatsQueryDto.prototype, "endDate", void 0);
class CustomerOverviewQueryDto {
    profileId;
}
exports.CustomerOverviewQueryDto = CustomerOverviewQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '客户档案ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerOverviewQueryDto.prototype, "profileId", void 0);
class MarketingPerformanceQueryDto {
    campaignId;
    granularity;
}
exports.MarketingPerformanceQueryDto = MarketingPerformanceQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '营销活动ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MarketingPerformanceQueryDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: '时间粒度: daily, weekly, monthly',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MarketingPerformanceQueryDto.prototype, "granularity", void 0);
class RealTimeMetricsQueryDto {
    lastMinutes = 5;
}
exports.RealTimeMetricsQueryDto = RealTimeMetricsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '过去N分钟的数据', default: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], RealTimeMetricsQueryDto.prototype, "lastMinutes", void 0);
class ChartDataQueryDto {
    days = 7;
    profileId;
    campaignId;
}
exports.ChartDataQueryDto = ChartDataQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '天数', default: 7 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], ChartDataQueryDto.prototype, "days", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '客户档案ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChartDataQueryDto.prototype, "profileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '营销活动ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChartDataQueryDto.prototype, "campaignId", void 0);
class GenerateReportDto {
    profileId;
    campaignId;
    startDate;
    endDate;
}
exports.GenerateReportDto = GenerateReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '客户档案ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "profileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '营销活动ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '起始日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: '结束日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "endDate", void 0);
class ExportDashboardDto {
    format = 'json';
}
exports.ExportDashboardDto = ExportDashboardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['csv', 'json'], default: 'json' }),
    (0, class_validator_1.IsEnum)(['csv', 'json']),
    __metadata("design:type", String)
], ExportDashboardDto.prototype, "format", void 0);
//# sourceMappingURL=dashboard.dto.js.map