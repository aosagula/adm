import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConfigDto {
  @ApiProperty({
    example: {
      model: 'gpt-4-turbo',
      temperature: 0.8,
      maxTokens: 4000,
    },
    description: 'Configuración del agente (se hará merge con la existente)',
  })
  @IsObject()
  config: Record<string, any>;
}
