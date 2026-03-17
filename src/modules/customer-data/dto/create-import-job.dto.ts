import { IsEnum, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { SourceType } from '../../../shared/enums/source-type.enum';

export class CreateImportJobDto {
  @IsString()
  customerProfileId: string;

  @IsEnum(SourceType)
  sourceType: SourceType;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  recordCount?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
