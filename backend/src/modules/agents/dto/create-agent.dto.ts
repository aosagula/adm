import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty({ example: 'Agente de Atención al Cliente' })
  @IsString()
  name: string;

  @ApiProperty({ required: false, example: 'Agente especializado en atención al cliente 24/7' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    required: false,
    example: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'Eres un asistente útil...',
    },
  })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
