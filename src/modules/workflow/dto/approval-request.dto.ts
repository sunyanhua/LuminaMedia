import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApprovalAction } from '../../../shared/enums/workflow-status.enum';

export class ApprovalRequestDto {
  @ApiProperty({ enum: ApprovalAction, description: '审批动作' })
  @IsEnum(ApprovalAction)
  action: ApprovalAction;

  @ApiPropertyOptional({ description: '审批意见' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ type: [String], description: '附件URL列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: '转交给用户ID' })
  @IsOptional()
  @IsString()
  transferTo?: string;

  @ApiPropertyOptional({ description: '是否加急处理', default: false })
  @IsOptional()
  @IsBoolean()
  isExpedited?: boolean;
}
