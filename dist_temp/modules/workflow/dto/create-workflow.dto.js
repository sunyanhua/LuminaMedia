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
exports.CreateWorkflowDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
class WorkflowNodeConfigDto {
    type;
    name;
    assignee;
    role;
    timeoutHours;
    isMandatory;
    parallelGroup;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: workflow_status_enum_1.ApprovalNodeType,
        description: '节点类型',
        example: 'EDITOR'
    }),
    (0, class_validator_1.IsEnum)(workflow_status_enum_1.ApprovalNodeType),
    __metadata("design:type", String)
], WorkflowNodeConfigDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '节点名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodeConfigDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '审批人ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodeConfigDto.prototype, "assignee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '审批角色' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodeConfigDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '超时时间（小时）', default: 24 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkflowNodeConfigDto.prototype, "timeoutHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否必审', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WorkflowNodeConfigDto.prototype, "isMandatory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '并行组标识' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodeConfigDto.prototype, "parallelGroup", void 0);
class WorkflowRulesConfigDto {
    allowExpedite;
    allowWithdraw;
    allowReassign;
    maxRevisionCount;
    autoEscalateHours;
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否允许加急', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WorkflowRulesConfigDto.prototype, "allowExpedite", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否允许撤回', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WorkflowRulesConfigDto.prototype, "allowWithdraw", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否允许转交', default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WorkflowRulesConfigDto.prototype, "allowReassign", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '最大修改次数', default: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkflowRulesConfigDto.prototype, "maxRevisionCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '自动升级审批时间（小时）', default: 24 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkflowRulesConfigDto.prototype, "autoEscalateHours", void 0);
class CreateWorkflowDto {
    contentDraftId;
    title;
    description;
    priority;
    isExpedited;
    expectedCompletionAt;
    nodes;
    rules;
}
exports.CreateWorkflowDto = CreateWorkflowDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '内容草稿ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "contentDraftId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '工作流标题' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '工作流描述' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '优先级（1-5）', default: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateWorkflowDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否为加急流程', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateWorkflowDto.prototype, "isExpedited", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '期望完成时间' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateWorkflowDto.prototype, "expectedCompletionAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [WorkflowNodeConfigDto],
        description: '节点配置',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkflowNodeConfigDto),
    __metadata("design:type", Array)
], CreateWorkflowDto.prototype, "nodes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: WorkflowRulesConfigDto,
        description: '审批规则配置',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkflowRulesConfigDto),
    __metadata("design:type", WorkflowRulesConfigDto)
], CreateWorkflowDto.prototype, "rules", void 0);
//# sourceMappingURL=create-workflow.dto.js.map