import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloneAgentDto {
  @ApiProperty({ example: 'Copia de Agente de Atención' })
  @IsString()
  newName: string;

  @ApiProperty({ example: 'uuid-target-project-id' })
  @IsUUID()
  targetProjectId: string;
}
