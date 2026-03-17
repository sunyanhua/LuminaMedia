import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Platform } from '../../../shared/enums/platform.enum';

export class GenerateTextDto {
  @IsString()
  prompt: string;

  @IsEnum(Platform)
  platform: Platform;

  @IsOptional()
  @IsEnum(['formal', 'casual', 'friendly', 'professional'])
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(2000)
  wordCount?: number;

  @IsOptional()
  @IsBoolean()
  includeHashtags?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeImageSuggestions?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(4000)
  maxTokens?: number;
}
