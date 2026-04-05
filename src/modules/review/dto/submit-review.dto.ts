import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReviewStatus } from '../../../shared/enums/review-status.enum';

export class SubmitReviewDto {
  @ApiProperty({
    description: '内容草稿ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  contentDraftId: string;

  @ApiProperty({
    description: '审核结果',
    enum: ReviewStatus,
    example: ReviewStatus.PASSED,
  })
  @IsEnum([ReviewStatus.PASSED, ReviewStatus.REJECTED], {
    message: 'status必须是PASSED或REJECTED',
  })
  status: ReviewStatus.PASSED | ReviewStatus.REJECTED;

  @ApiProperty({
    description: '审核意见',
    required: false,
    example: '内容符合要求，建议发布。',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}