import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Node.js REST API' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, example: 'Backend' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ required: false, type: 'object' })
  @IsObject()
  @IsOptional()
  baseConfig?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  dockerCompose?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  readme?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}
