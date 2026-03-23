import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { CampaignType } from '../../../shared/enums/campaign-type.enum';

export class CreateCampaignDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsEnum(CampaignType)
  campaignType: CampaignType;

  @IsObject()
  @IsOptional()
  targetAudience?: Record<string, any>;

  @IsNumber()
  budget: number;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;
}
