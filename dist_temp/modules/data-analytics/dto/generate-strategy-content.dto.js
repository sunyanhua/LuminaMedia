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
exports.GenerateStrategyContentDto = void 0;
const class_validator_1 = require("class-validator");
const platform_enum_1 = require("../../../shared/enums/platform.enum");
class GenerateStrategyContentDto {
    targetPlatforms;
    contentTypes = ['promotional'];
    tone;
    excludeExisting = [];
}
exports.GenerateStrategyContentDto = GenerateStrategyContentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(platform_enum_1.Platform, { each: true }),
    __metadata("design:type", Array)
], GenerateStrategyContentDto.prototype, "targetPlatforms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateStrategyContentDto.prototype, "contentTypes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['formal', 'casual', 'friendly', 'professional']),
    __metadata("design:type", String)
], GenerateStrategyContentDto.prototype, "tone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateStrategyContentDto.prototype, "excludeExisting", void 0);
//# sourceMappingURL=generate-strategy-content.dto.js.map