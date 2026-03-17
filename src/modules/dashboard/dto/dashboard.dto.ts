import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsQueryDto {
  @ApiProperty({ required: false, description: '起始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CustomerOverviewQueryDto {
  @ApiProperty({ description: '客户档案ID' })
  @IsString()
  profileId: string;
}

export class MarketingPerformanceQueryDto {
  @ApiProperty({ description: '营销活动ID' })
  @IsString()
  campaignId: string;

  @ApiProperty({
    required: false,
    description: '时间粒度: daily, weekly, monthly',
  })
  @IsOptional()
  @IsString()
  granularity?: string;
}

export class RealTimeMetricsQueryDto {
  @ApiProperty({ required: false, description: '过去N分钟的数据', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  lastMinutes?: number = 5;
}

export class ChartDataQueryDto {
  @ApiProperty({ required: false, description: '天数', default: 7 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  days?: number = 7;

  @ApiProperty({ required: false, description: '客户档案ID' })
  @IsOptional()
  @IsString()
  profileId?: string;

  @ApiProperty({ required: false, description: '营销活动ID' })
  @IsOptional()
  @IsString()
  campaignId?: string;
}

export class GenerateReportDto {
  @ApiProperty({ required: false, description: '客户档案ID' })
  @IsOptional()
  @IsString()
  profileId?: string;

  @ApiProperty({ required: false, description: '营销活动ID' })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiProperty({ required: false, description: '起始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ExportDashboardDto {
  @ApiProperty({ enum: ['csv', 'json'], default: 'json' })
  @IsEnum(['csv', 'json'])
  format: 'csv' | 'json' = 'json';
}
