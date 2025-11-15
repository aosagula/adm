import { IsString, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectMemberRole } from '@prisma/client';

export class AddMemberDto {
  @ApiProperty({ example: 'uuid-user-id' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: ProjectMemberRole, default: 'VIEWER' })
  @IsEnum(ProjectMemberRole)
  role: string;
}
