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
exports.UpdateWorkflowDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
class UpdateWorkflowDto {
    title;
    description;
    priority;
    isExpedited;
    expectedCompletionAt;
    status;
    config;
}
exports.UpdateWorkflowDto = UpdateWorkflowDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '工作流标题' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkflowDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '工作流描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkflowDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '优先级（1-5）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateWorkflowDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否为加急流程' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateWorkflowDto.prototype, "isExpedited", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '期望完成时间' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UpdateWorkflowDto.prototype, "expectedCompletionAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: workflow_status_enum_1.WorkflowStatus,
        description: '工作流状态',
        example: 'DRAFT'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(workflow_status_enum_1.WorkflowStatus),
    __metadata("design:type", String)
], UpdateWorkflowDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '配置信息', type: Object }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateWorkflowDto.prototype, "config", void 0);
//# sourceMappingURL=update-workflow.dto.js.map