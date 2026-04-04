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
exports.GenerateTextDto = void 0;
const class_validator_1 = require("class-validator");
const platform_enum_1 = require("../../../shared/enums/platform.enum");
class GenerateTextDto {
    prompt;
    platform;
    tone;
    wordCount;
    includeHashtags = true;
    includeImageSuggestions = true;
    temperature;
    maxTokens;
}
exports.GenerateTextDto = GenerateTextDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateTextDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(platform_enum_1.Platform),
    __metadata("design:type", String)
], GenerateTextDto.prototype, "platform", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['formal', 'casual', 'friendly', 'professional']),
    __metadata("design:type", String)
], GenerateTextDto.prototype, "tone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", Number)
], GenerateTextDto.prototype, "wordCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateTextDto.prototype, "includeHashtags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateTextDto.prototype, "includeImageSuggestions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], GenerateTextDto.prototype, "temperature", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(4000),
    __metadata("design:type", Number)
], GenerateTextDto.prototype, "maxTokens", void 0);
//# sourceMappingURL=generate-text.dto.js.map