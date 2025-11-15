import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus, ProjectVisibility } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'Mi Proyecto de Agente' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'mi-proyecto-agente' })
  @IsString()
  slug: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiProperty({ enum: ProjectStatus, required: false, default: 'DEVELOPMENT' })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({ enum: ProjectVisibility, required: false, default: 'PRIVATE' })
  @IsEnum(ProjectVisibility)
  @IsOptional()
  visibility?: ProjectVisibility;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  templateId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repositoryUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  repositoryBranch?: string;
}
