import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限所属模块', maxLength: 100, example: 'content' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  module: string;

  @ApiProperty({ description: '权限操作', maxLength: 100, example: 'write' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  action: string;

  @ApiProperty({ description: '权限描述', required: false, example: '创建和修改内容' })
  @IsString()
  @IsOptional()
  description?: string;
}