import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsIn, IsNumber } from 'class-validator';

export class CreateFeatureConfigDto {
  @IsString()
  @IsNotEmpty()
  featureKey: string;

  @IsString()
  @IsNotEmpty()
  featureName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsString()
  @IsIn(['all', 'business', 'government'])
  @IsOptional()
  tenantType?: string;

  @IsNumber()
  @IsOptional()
  defaultQuota?: number;

  @IsString()
  @IsOptional()
  featureCategory?: string;
}

export class UpdateFeatureConfigDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  featureName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsString()
  @IsIn(['all', 'business', 'government'])
  @IsOptional()
  tenantType?: string;

  @IsNumber()
  @IsOptional()
  defaultQuota?: number;

  @IsString()
  @IsOptional()
  featureCategory?: string;
}
