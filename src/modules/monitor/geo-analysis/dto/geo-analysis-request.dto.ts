import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  AnalysisType,
  RegionLevel,
} from '../interfaces/geo-analysis.interface';

export class TimeRangeDto {
  @ApiProperty({ type: Date, description: '开始时间' })
  @IsDate()
  @Type(() => Date)
  start: Date;

  @ApiProperty({ type: Date, description: '结束时间' })
  @IsDate()
  @Type(() => Date)
  end: Date;
}

export class AnalysisOptionsDto {
  @ApiPropertyOptional({
    type: Boolean,
    description: '是否包含可视化',
    default: true,
  })
  @IsOptional()
  includeVisualizations?: boolean = true;

  @ApiPropertyOptional({
    type: Boolean,
    description: '是否包含推荐建议',
    default: true,
  })
  @IsOptional()
  includeRecommendations?: boolean = true;

  @ApiPropertyOptional({ type: String, description: '语言', default: 'zh-CN' })
  @IsOptional()
  @IsString()
  language?: string = 'zh-CN';

  @ApiPropertyOptional({
    enum: ['basic', 'standard', 'comprehensive'],
    description: '分析深度',
    default: 'standard',
  })
  @IsOptional()
  @IsEnum(['basic', 'standard', 'comprehensive'])
  depth?: 'basic' | 'standard' | 'comprehensive' = 'standard';
}

export class GeoAnalysisRequestDto {
  @ApiProperty({ type: String, description: '租户ID' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ type: String, description: '客户档案ID' })
  @IsOptional()
  @IsString()
  customerProfileId?: string;

  @ApiPropertyOptional({ type: [String], description: '目标地区ID列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetRegionIds?: string[];

  @ApiPropertyOptional({ type: [String], description: '目标地区名称列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetRegionNames?: string[];

  @ApiProperty({
    enum: AnalysisType,
    isArray: true,
    description: '分析类型列表',
  })
  @IsArray()
  @IsEnum(AnalysisType, { each: true })
  analysisTypes: AnalysisType[];

  @ApiPropertyOptional({ type: TimeRangeDto, description: '时间范围' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange?: TimeRangeDto;

  @ApiPropertyOptional({ type: [String], description: '竞争对手列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competitors?: string[];

  @ApiPropertyOptional({ type: [String], description: '行业列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];

  @ApiPropertyOptional({ type: [String], description: '关键词列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ type: [String], description: '指标列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @ApiPropertyOptional({ enum: RegionLevel, description: '地区级别' })
  @IsOptional()
  @IsEnum(RegionLevel)
  regionLevel?: RegionLevel;

  @ApiPropertyOptional({ type: [String], description: '数据源列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataSources?: string[];

  @ApiPropertyOptional({ type: AnalysisOptionsDto, description: '分析选项' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AnalysisOptionsDto)
  options?: AnalysisOptionsDto;
}
