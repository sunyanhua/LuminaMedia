import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsObject,
  IsNotEmptyObject,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Platform } from '../../../shared/enums/platform.enum';
import { CampaignType } from '../../../shared/enums/campaign-type.enum';

export class GenerateMarketingContentDto {
  @IsString()
  campaignId: string;

  @IsString()
  campaignName: string;

  @IsEnum(CampaignType)
  campaignType: CampaignType;

  @IsObject()
  @IsNotEmptyObject()
  targetAudience: Record<string, any>;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  userId: string;

  @IsArray()
  @IsEnum(Platform, { each: true })
  targetPlatforms: Platform[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentTypes?: string[] = ['promotional'];

  @IsOptional()
  @IsEnum(['formal', 'casual', 'friendly', 'professional'])
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  quantity?: number = 1;
}
