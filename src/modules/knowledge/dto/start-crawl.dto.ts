import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { CrawlMode } from '../../../entities/crawl-task.entity';

export class StartCrawlDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsEnum(CrawlMode, {
    message: 'mode must be one of: SINGLE, PROJECT, SITE',
  })
  @IsNotEmpty()
  mode: CrawlMode;

  @IsString()
  @IsOptional()
  category?: string;
}
