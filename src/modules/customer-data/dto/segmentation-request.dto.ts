import { IsString, IsOptional, IsObject } from 'class-validator';

export class SegmentationRequestDto {
  @IsString()
  profileId: string;

  @IsObject()
  @IsOptional()
  segmentationRules?: Record<string, any>;
}
