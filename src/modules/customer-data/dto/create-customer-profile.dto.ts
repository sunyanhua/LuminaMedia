import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { CustomerType } from '../../../shared/enums/customer-type.enum';
import { Industry } from '../../../shared/enums/industry.enum';

export class CreateCustomerProfileDto {
  @IsString()
  userId: string;

  @IsString()
  customerName: string;

  @IsEnum(CustomerType)
  customerType: CustomerType;

  @IsEnum(Industry)
  industry: Industry;

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
