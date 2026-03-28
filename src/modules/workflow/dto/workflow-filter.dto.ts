import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsDate, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowStatus } from '../../../shared/enums/workflow-status.enum';

export class WorkflowFilterDto {
  @ApiPropertyOptional({ enum: WorkflowStatus, description: '工作流状态' })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiPropertyOptional({
    type: [WorkflowStatus],
    enumName: 'WorkflowStatus',
    description: '工作流状态列表'
  })
  @IsOptional()
  @IsArray()
  @IsEnum(WorkflowStatus, { each: true })
  statuses?: WorkflowStatus[];

  @ApiPropertyOptional({ description: '创建者ID' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiPropertyOptional({ description: '是否为加急流程' })
  @IsOptional()
  @IsBoolean()
  isExpedited?: boolean;

  @ApiPropertyOptional({ description: '最小优先级（1-5）' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priority?: number;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ description: '内容草稿ID' })
  @IsOptional()
  @IsString()
  contentDraftId?: string;

  @ApiPropertyOptional({ description: '搜索关键词（标题或描述）' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;
}