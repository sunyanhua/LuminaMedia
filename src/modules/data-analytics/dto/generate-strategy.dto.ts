import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { StrategyType } from '../../../shared/enums/strategy-type.enum';
import { GenerationMethod } from '../../../shared/enums/generation-method.enum';

export class GenerateStrategyDto {
  @IsString()
  campaignId: string;

  @IsEnum(StrategyType)
  @IsOptional()
  strategyType?: StrategyType;

  @IsEnum(GenerationMethod)
  @IsOptional()
  generatedBy?: GenerationMethod;

  @IsBoolean()
  @IsOptional()
  useGemini?: boolean = true;
}
