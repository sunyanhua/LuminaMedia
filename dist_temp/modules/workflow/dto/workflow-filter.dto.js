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
exports.WorkflowFilterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
class WorkflowFilterDto {
    status;
    statuses;
    createdBy;
    isExpedited;
    priority;
    startDate;
    endDate;
    contentDraftId;
    search;
    page = 1;
    limit = 20;
}
exports.WorkflowFilterDto = WorkflowFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: workflow_status_enum_1.WorkflowStatus, description: '工作流状态' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(workflow_status_enum_1.WorkflowStatus),
    __metadata("design:type", String)
], WorkflowFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [workflow_status_enum_1.WorkflowStatus],
        enumName: 'WorkflowStatus',
        description: '工作流状态列表',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(workflow_status_enum_1.WorkflowStatus, { each: true }),
    __metadata("design:type", Array)
], WorkflowFilterDto.prototype, "statuses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '创建者ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowFilterDto.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否为加急流程' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WorkflowFilterDto.prototype, "isExpedited", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '最小优先级（1-5）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], WorkflowFilterDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '开始日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], WorkflowFilterDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '结束日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], WorkflowFilterDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '内容草稿ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowFilterDto.prototype, "contentDraftId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '搜索关键词（标题或描述）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowFilterDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '页码', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], WorkflowFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '每页数量', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], WorkflowFilterDto.prototype, "limit", void 0);
//# sourceMappingURL=workflow-filter.dto.js.map