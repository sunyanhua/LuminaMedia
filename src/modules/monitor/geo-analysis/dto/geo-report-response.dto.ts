import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  AnalysisStatus,
  AnalysisType,
} from '../interfaces/geo-analysis.interface';

export class GeoVisualizationDto {
  @ApiProperty({ type: String, description: '可视化ID' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    enum: ['map', 'chart', 'table', 'heatmap', 'network'],
    description: '可视化类型',
  })
  @IsNotEmpty()
  @IsEnum(['map', 'chart', 'table', 'heatmap', 'network'])
  type: 'map' | 'chart' | 'table' | 'heatmap' | 'network';

  @ApiProperty({ type: String, description: '标题' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ type: String, description: '描述' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ type: Object, description: '数据' })
  @IsNotEmpty()
  @IsObject()
  data: any;

  @ApiProperty({ enum: ['png', 'svg', 'html', 'json'], description: '格式' })
  @IsNotEmpty()
  @IsEnum(['png', 'svg', 'html', 'json'])
  format: 'png' | 'svg' | 'html' | 'json';

  @ApiProperty({ type: Boolean, description: '是否交互式' })
  @IsNotEmpty()
  interactive: boolean;
}

export class GeoRecommendationDto {
  @ApiProperty({ type: String, description: '推荐ID' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    enum: ['seo', 'content', 'marketing', 'product', 'partnership'],
    description: '类别',
  })
  @IsNotEmpty()
  @IsEnum(['seo', 'content', 'marketing', 'product', 'partnership'])
  category: 'seo' | 'content' | 'marketing' | 'product' | 'partnership';

  @ApiProperty({ type: String, description: '标题' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ type: String, description: '描述' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    enum: ['low', 'medium', 'high', 'critical'],
    description: '优先级',
  })
  @IsNotEmpty()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ type: Number, description: '预期影响（0-100）' })
  @IsNotEmpty()
  @IsNumber()
  expectedImpact: number;

  @ApiProperty({ type: Number, description: '实施难度（0-100）' })
  @IsNotEmpty()
  @IsNumber()
  implementationDifficulty: number;

  @ApiProperty({ type: String, description: '时间框架' })
  @IsNotEmpty()
  @IsString()
  timeframe: string;

  @ApiPropertyOptional({ type: Number, description: '预计成本' })
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @ApiProperty({ type: [String], description: '所需资源' })
  @IsArray()
  @IsString({ each: true })
  requiredResources: string[];

  @ApiProperty({ type: [String], description: '相关地区' })
  @IsArray()
  @IsString({ each: true })
  relatedRegions: string[];
}

export class AnalysisMetadataDto {
  @ApiProperty({ type: Number, description: '处理时间（毫秒）' })
  @IsNotEmpty()
  @IsNumber()
  processingTime: number;

  @ApiProperty({ type: [String], description: '使用的数据源' })
  @IsArray()
  @IsString({ each: true })
  dataSourcesUsed: string[];

  @ApiProperty({ type: String, description: '算法版本' })
  @IsNotEmpty()
  @IsString()
  algorithmVersion: string;

  @ApiProperty({ type: Date, description: '生成时间' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  generatedAt: Date;
}

export class GeoAnalysisResponseDto {
  @ApiProperty({ type: String, description: '分析ID' })
  @IsNotEmpty()
  @IsString()
  analysisId: string;

  @ApiProperty({ enum: AnalysisStatus, description: '状态' })
  @IsNotEmpty()
  @IsEnum(AnalysisStatus)
  status: AnalysisStatus;

  @ApiPropertyOptional({ type: Object, description: '分析结果' })
  @IsOptional()
  @IsObject()
  results?: any;

  @ApiPropertyOptional({
    type: [GeoVisualizationDto],
    description: '可视化列表',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeoVisualizationDto)
  visualizations?: GeoVisualizationDto[];

  @ApiPropertyOptional({
    type: [GeoRecommendationDto],
    description: '推荐列表',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeoRecommendationDto)
  recommendations?: GeoRecommendationDto[];

  @ApiProperty({ type: AnalysisMetadataDto, description: '元数据' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AnalysisMetadataDto)
  metadata: AnalysisMetadataDto;
}

export class GeoReportResponseDto {
  @ApiProperty({ type: String, description: '报告ID' })
  @IsNotEmpty()
  @IsString()
  reportId: string;

  @ApiProperty({ type: String, description: '租户ID' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ type: String, description: '客户档案ID' })
  @IsOptional()
  @IsString()
  customerProfileId?: string;

  @ApiProperty({ type: Date, description: '生成时间' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  generatedAt: Date;

  @ApiProperty({ type: Object, description: '时间范围' })
  @IsNotEmpty()
  @IsObject()
  timeframe: {
    start: Date;
    end: Date;
  };

  @ApiProperty({ type: Object, description: '执行摘要' })
  @IsNotEmpty()
  @IsObject()
  executiveSummary: {
    overview: string;
    keyFindings: string[];
    topOpportunities: string[];
    criticalThreats: string[];
    strategicRecommendations: string[];
    expectedOutcomes: string[];
  };

  @ApiProperty({ type: Object, description: '地区分析' })
  @IsNotEmpty()
  @IsObject()
  regionalAnalysis: any;

  @ApiProperty({ type: Object, description: '竞争分析' })
  @IsNotEmpty()
  @IsObject()
  competitiveAnalysis: any;

  @ApiProperty({ type: Object, description: 'SEO分析' })
  @IsNotEmpty()
  @IsObject()
  seoAnalysis: any;

  @ApiProperty({ type: Object, description: '机会分析' })
  @IsNotEmpty()
  @IsObject()
  opportunityAnalysis: any;

  @ApiProperty({ type: Object, description: '推荐建议' })
  @IsNotEmpty()
  @IsObject()
  recommendations: any;

  @ApiProperty({ type: Object, description: '实施计划' })
  @IsNotEmpty()
  @IsObject()
  implementationPlan: any;

  @ApiPropertyOptional({ type: Object, description: '附录' })
  @IsOptional()
  @IsObject()
  appendices?: any;
}
