import { IsString, IsOptional, IsObject } from 'class-validator';

export class ProcessImportDto {
  @IsString()
  importJobId: string;

  @IsString()
  @IsOptional()
  fileContent?: string;

  @IsObject()
  @IsOptional()
  validationRules?: Record<string, any>;
}
