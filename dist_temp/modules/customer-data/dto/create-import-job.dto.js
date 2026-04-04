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
exports.CreateImportJobDto = void 0;
const class_validator_1 = require("class-validator");
const source_type_enum_1 = require("../../../shared/enums/source-type.enum");
class CreateImportJobDto {
    customerProfileId;
    sourceType;
    filePath;
    fileName;
    recordCount;
    notes;
}
exports.CreateImportJobDto = CreateImportJobDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImportJobDto.prototype, "customerProfileId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(source_type_enum_1.SourceType),
    __metadata("design:type", String)
], CreateImportJobDto.prototype, "sourceType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateImportJobDto.prototype, "filePath", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateImportJobDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateImportJobDto.prototype, "recordCount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateImportJobDto.prototype, "notes", void 0);
//# sourceMappingURL=create-import-job.dto.js.map