import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsDate, IsUUID, Min, Max, IsInt } from 'class-validator';
import { ContentStatus } from '../../../entities/content-draft.entity';

export class ContentDraftFilterDto {
  @ApiPropertyOptional({ description: '按状态筛选', enum: ContentStatus })
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;

  @ApiPropertyOptional({ description: '按关键词搜索（标题或内容）' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '按创建人ID筛选' })
  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @ApiPropertyOptional({ description: '按创建时间起始筛选（ISO日期字符串）' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: '按创建时间结束筛选（ISO日期字符串）' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: '页码，从1开始', default: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量，默认20，最大100', default: 20, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}