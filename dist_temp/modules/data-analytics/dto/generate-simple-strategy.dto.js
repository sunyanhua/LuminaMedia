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
exports.GenerateSimpleStrategyDto = void 0;
const class_validator_1 = require("class-validator");
const platform_enum_1 = require("../../../shared/enums/platform.enum");
const campaign_type_enum_1 = require("../../../shared/enums/campaign-type.enum");
class GenerateSimpleStrategyDto {
    goal;
    targetAudience = [];
    budget = 100000;
    campaignType = campaign_type_enum_1.CampaignType.ONLINE;
    platforms = [platform_enum_1.Platform.XHS, platform_enum_1.Platform.WECHAT_MP, platform_enum_1.Platform.DOUYIN];
    strategyType = '综合营销策略';
    durationWeeks = 4;
}
exports.GenerateSimpleStrategyDto = GenerateSimpleStrategyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSimpleStrategyDto.prototype, "goal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateSimpleStrategyDto.prototype, "targetAudience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GenerateSimpleStrategyDto.prototype, "budget", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(campaign_type_enum_1.CampaignType),
    __metadata("design:type", String)
], GenerateSimpleStrategyDto.prototype, "campaignType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(platform_enum_1.Platform, { each: true }),
    __metadata("design:type", Array)
], GenerateSimpleStrategyDto.prototype, "platforms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSimpleStrategyDto.prototype, "strategyType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GenerateSimpleStrategyDto.prototype, "durationWeeks", void 0);
//# sourceMappingURL=generate-simple-strategy.dto.js.map