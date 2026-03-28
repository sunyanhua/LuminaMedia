import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowStatus } from '../../../shared/enums/workflow-status.enum';

export class UpdateWorkflowDto {
  @ApiPropertyOptional({ description: '工作流标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '工作流描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '优先级（1-5）' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priority?: number;

  @ApiPropertyOptional({ description: '是否为加急流程' })
  @IsOptional()
  @IsBoolean()
  isExpedited?: boolean;

  @ApiPropertyOptional({ description: '期望完成时间' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expectedCompletionAt?: Date;

  @ApiPropertyOptional({ enum: WorkflowStatus, description: '工作流状态' })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiPropertyOptional({ description: '配置信息', type: Object })
  @IsOptional()
  config?: any;
}