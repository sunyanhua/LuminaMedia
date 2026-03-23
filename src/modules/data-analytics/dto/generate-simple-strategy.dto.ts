import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Platform } from '../../../shared/enums/platform.enum';
import { CampaignType } from '../../../shared/enums/campaign-type.enum';

export class GenerateSimpleStrategyDto {
  @IsString()
  goal: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetAudience?: string[] = [];

  @IsOptional()
  @IsNumber()
  budget?: number = 100000;

  @IsOptional()
  @IsEnum(CampaignType)
  campaignType?: CampaignType = CampaignType.ONLINE;

  @IsOptional()
  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms?: Platform[] = [Platform.XHS, Platform.WECHAT_MP, Platform.DOUYIN];

  @IsOptional()
  @IsString()
  strategyType?: string = '综合营销策略';

  @IsOptional()
  @IsNumber()
  durationWeeks?: number = 4;
}
