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
exports.ApprovalRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const workflow_status_enum_1 = require("../../../shared/enums/workflow-status.enum");
class ApprovalRequestDto {
    action;
    comments;
    attachments;
    transferTo;
    isExpedited;
}
exports.ApprovalRequestDto = ApprovalRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: workflow_status_enum_1.ApprovalAction, description: '审批动作' }),
    (0, class_validator_1.IsEnum)(workflow_status_enum_1.ApprovalAction),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '审批意见' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: '附件URL列表' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ApprovalRequestDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '转交给用户ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApprovalRequestDto.prototype, "transferTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '是否加急处理', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ApprovalRequestDto.prototype, "isExpedited", void 0);
//# sourceMappingURL=approval-request.dto.js.map