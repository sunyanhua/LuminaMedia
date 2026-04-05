import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

export class GenerateWechatArticleDto {
  @ApiProperty({
    description: '选题ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  topicId: string;

  @ApiProperty({
    description: '租户ID',
    example: 'default-tenant',
  })
  @IsString()
  tenantId: string;

  @ApiProperty({
    description: '用户ID',
    example: 'user-123',
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: '语气风格',
    enum: ['formal', 'casual', 'friendly', 'professional'],
    example: 'professional',
  })
  @IsOptional()
  @IsEnum(['formal', 'casual', 'friendly', 'professional'])
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';

  @ApiPropertyOptional({
    description: '目标字数',
    example: 1000,
    minimum: 300,
    maximum: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(300)
  @Max(5000)
  wordCount?: number;

  @ApiPropertyOptional({
    description: '是否包含配图建议',
    example: true,
  })
  @IsOptional()
  includeImageSuggestions?: boolean;

  @ApiPropertyOptional({
    description: 'AI生成温度（创造性）',
    example: 0.7,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;

  @ApiPropertyOptional({
    description: '最大token数',
    example: 2000,
    minimum: 500,
    maximum: 4000,
  })
  @IsOptional()
  @IsNumber()
  @Min(500)
  @Max(4000)
  maxTokens?: number;

  @ApiPropertyOptional({
    description: '语言风格覆盖',
    example: '正式严谨',
  })
  @IsOptional()
  @IsString()
  languageStyle?: string;

  @ApiPropertyOptional({
    description: '视觉偏好覆盖',
    example: '简约风格',
  })
  @IsOptional()
  @IsString()
  visualPreference?: string;
}