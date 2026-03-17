import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Platform } from '../../../shared/enums/platform.enum';

export class GenerateMarketingContentDto {
  @IsString()
  campaignId: string;

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
