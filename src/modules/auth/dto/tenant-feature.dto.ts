import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class EnableFeatureForTenantDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsOptional()
  featureKey?: string;

  @IsOptional()
  quotaConfig?: any;
}

export class DisableFeatureForTenantDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsOptional()
  featureKey?: string;
}

export class BatchEnableFeaturesDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsArray()
  @IsNotEmpty()
  featureKeys: string[];

  @IsOptional()
  quotaConfig?: any; // Optional quota config applied to all features
}

export class BatchDisableFeaturesDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsArray()
  @IsNotEmpty()
  featureKeys: string[];
}