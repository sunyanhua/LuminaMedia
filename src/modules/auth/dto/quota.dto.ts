import { IsString, IsNotEmpty, IsNumber, IsOptional, IsIn, Min, Max } from 'class-validator';

export class CreateQuotaDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  featureKey: string;

  @IsNumber()
  @Min(0)
  maxCount: number;

  @IsString()
  @IsIn(['daily', 'weekly', 'monthly'])
  @IsOptional()
  quotaPeriod?: 'daily' | 'weekly' | 'monthly';
}

export class UpdateQuotaDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxCount?: number;

  @IsString()
  @IsIn(['daily', 'weekly', 'monthly'])
  @IsOptional()
  quotaPeriod?: 'daily' | 'weekly' | 'monthly';
}

export class ResetQuotaDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  featureKey?: string;
}

export class QuotaQueryDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  featureKey?: string;

  @IsString()
  @IsIn(['daily', 'weekly', 'monthly'])
  @IsOptional()
  quotaPeriod?: 'daily' | 'weekly' | 'monthly';

  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number = 20;
}