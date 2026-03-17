import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { CustomerType } from '../../../shared/enums/customer-type.enum';
import { Industry } from '../../../shared/enums/industry.enum';

export class UpdateCustomerProfileDto {
  @IsString()
  @IsOptional()
  customerName?: string;

  @IsEnum(CustomerType)
  @IsOptional()
  customerType?: CustomerType;

  @IsEnum(Industry)
  @IsOptional()
  industry?: Industry;

  @IsObject()
  @IsOptional()
  dataSources?: Record<string, any>;

  @IsObject()
  @IsOptional()
  profileData?: Record<string, any>;

  @IsObject()
  @IsOptional()
  behaviorInsights?: Record<string, any>;
}
