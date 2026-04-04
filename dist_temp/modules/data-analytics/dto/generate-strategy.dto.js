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
exports.GenerateStrategyDto = void 0;
const class_validator_1 = require("class-validator");
const strategy_type_enum_1 = require("../../../shared/enums/strategy-type.enum");
const generation_method_enum_1 = require("../../../shared/enums/generation-method.enum");
class GenerateStrategyDto {
    campaignId;
    strategyType;
    generatedBy;
    useGemini = true;
}
exports.GenerateStrategyDto = GenerateStrategyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateStrategyDto.prototype, "campaignId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(strategy_type_enum_1.StrategyType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateStrategyDto.prototype, "strategyType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(generation_method_enum_1.GenerationMethod),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateStrategyDto.prototype, "generatedBy", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], GenerateStrategyDto.prototype, "useGemini", void 0);
//# sourceMappingURL=generate-strategy.dto.js.map