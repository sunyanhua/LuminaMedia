import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', maxLength: 50, example: 'editor' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: '角色描述',
    required: false,
    example: '内容编辑人员',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
