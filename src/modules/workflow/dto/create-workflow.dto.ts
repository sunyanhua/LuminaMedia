import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsDate, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalNodeType } from '../../../shared/enums/workflow-status.enum';

class WorkflowNodeConfigDto {
  @ApiProperty({ enum: ApprovalNodeType, description: '节点类型' })
  @IsEnum(ApprovalNodeType)
  type: ApprovalNodeType;

  @ApiPropertyOptional({ description: '节点名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '审批人ID' })
  @IsOptional()
  @IsString()
  assignee?: string;

  @ApiPropertyOptional({ description: '审批角色' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: '超时时间（小时）', default: 24 })
  @IsOptional()
  @IsNumber()
  timeoutHours?: number;

  @ApiPropertyOptional({ description: '是否必审', default: true })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiPropertyOptional({ description: '并行组标识' })
  @IsOptional()
  @IsString()
  parallelGroup?: string;
}

class WorkflowRulesConfigDto {
  @ApiPropertyOptional({ description: '是否允许加急', default: true })
  @IsOptional()
  @IsBoolean()
  allowExpedite?: boolean;

  @ApiPropertyOptional({ description: '是否允许撤回', default: true })
  @IsOptional()
  @IsBoolean()
  allowWithdraw?: boolean;

  @ApiPropertyOptional({ description: '是否允许转交', default: true })
  @IsOptional()
  @IsBoolean()
  allowReassign?: boolean;

  @ApiPropertyOptional({ description: '最大修改次数', default: 3 })
  @IsOptional()
  @IsNumber()
  maxRevisionCount?: number;

  @ApiPropertyOptional({ description: '自动升级审批时间（小时）', default: 24 })
  @IsOptional()
  @IsNumber()
  autoEscalateHours?: number;
}

export class CreateWorkflowDto {
  @ApiProperty({ description: '内容草稿ID' })
  @IsString()
  contentDraftId: string;

  @ApiPropertyOptional({ description: '工作流标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '工作流描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '优先级（1-5）', default: 3 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priority?: number;

  @ApiPropertyOptional({ description: '是否为加急流程', default: false })
  @IsOptional()
  @IsBoolean()
  isExpedited?: boolean;

  @ApiPropertyOptional({ description: '期望完成时间' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expectedCompletionAt?: Date;

  @ApiPropertyOptional({ type: [WorkflowNodeConfigDto], description: '节点配置' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowNodeConfigDto)
  nodes?: WorkflowNodeConfigDto[];

  @ApiPropertyOptional({ type: WorkflowRulesConfigDto, description: '审批规则配置' })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowRulesConfigDto)
  rules?: WorkflowRulesConfigDto;
}