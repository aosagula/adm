import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlatformDto {
  @ApiProperty({ example: 'AWS' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Amazon Web Services' })
  @IsString()
  provider: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, type: 'object' })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
