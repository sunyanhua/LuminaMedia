import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Platform } from '../../../shared/enums/platform.enum';

export class GenerateStrategyContentDto {
  @IsOptional()
  @IsArray()
  @IsEnum(Platform, { each: true })
  targetPlatforms?: Platform[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentTypes?: string[] = ['promotional'];

  @IsOptional()
  @IsEnum(['formal', 'casual', 'friendly', 'professional'])
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeExisting?: string[] = [];
}
