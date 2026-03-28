import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export enum RuleSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export class CreateDataQualityRuleDto {
  @ApiProperty({ description: '规则名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '表名' })
  @IsString()
  tableName: string;

  @ApiProperty({ description: '字段名', required: false })
  @IsOptional()
  @IsString()
  fieldName?: string;

  @ApiProperty({
    description:
      'SQL条件表达式，如 "mobile IS NOT NULL AND LENGTH(mobile) = 11"',
  })
  @IsString()
  condition: string;

  @ApiProperty({ description: '阈值，例如0.95表示完整度需≥95%' })
  @IsNumber()
  threshold: number;

  @ApiProperty({ description: '严重程度', enum: RuleSeverity })
  @IsEnum(RuleSeverity)
  severity: RuleSeverity;

  @ApiProperty({ description: '规则描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    description: '检查频率（cron表达式），如 "0 0 * * *" 表示每天零点',
    required: false,
  })
  @IsOptional()
  @IsString()
  schedule?: string;
}
