import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { CloneAgentDto } from './dto/clone-agent.dto';
import { QueryAgentsDto } from './dto/query-agents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('agents')
@Controller('agents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('project/:projectId')
  @RequirePermissions('agents.create')
  @ApiOperation({ summary: 'Crear nuevo agente en un proyecto' })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
  @ApiResponse({ status: 201, description: 'Agente creado exitosamente' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  create(
    @Param('projectId') projectId: string,
    @Body() createAgentDto: CreateAgentDto,
    @Request() req,
  ) {
    return this.agentsService.create(
      projectId,
      createAgentDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get()
  @RequirePermissions('agents.read')
  @ApiOperation({ summary: 'Listar agentes con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de agentes' })
  findAll(@Query() queryDto: QueryAgentsDto, @Request() req) {
    return this.agentsService.findAll(queryDto, req.user.organizationId);
  }

  @Get('project/:projectId')
  @RequirePermissions('agents.read')
  @ApiOperation({ summary: 'Listar agentes de un proyecto' })
  @ApiParam({ name: 'projectId', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Lista de agentes del proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  findByProject(@Param('projectId') projectId: string, @Request() req) {
    return this.agentsService.findByProject(projectId, req.user.organizationId);
  }

  @Get(':id')
  @RequirePermissions('agents.read')
  @ApiOperation({ summary: 'Obtener detalle de agente' })
  @ApiResponse({ status: 200, description: 'Agente encontrado' })
  @ApiResponse({ status: 404, description: 'Agente no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.agentsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('agents.update')
  @ApiOperation({ summary: 'Actualizar agente' })
  @ApiResponse({ status: 200, description: 'Agente actualizado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Agente no encontrado' })
  update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto, @Request() req) {
    return this.agentsService.update(id, updateAgentDto, req.user.id, req.user.organizationId);
  }

  @Patch(':id/toggle-active')
  @RequirePermissions('agents.update')
  @ApiOperation({ summary: 'Activar/Desactivar agente' })
  @ApiResponse({ status: 200, description: 'Estado del agente cambiado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Agente no encontrado' })
  toggleActive(@Param('id') id: string, @Request() req) {
    return this.agentsService.toggleActive(id, req.user.id, req.user.organizationId);
  }

  @Patch(':id/config')
  @RequirePermissions('agents.update')
  @ApiOperation({ summary: 'Actualizar configuración del agente' })
  @ApiResponse({ status: 200, description: 'Configuración actualizada' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Agente no encontrado' })
  updateConfig(@Param('id') id: string, @Body() updateConfigDto: UpdateConfigDto, @Request() req) {
    return this.agentsService.updateConfig(
      id,
      updateConfigDto.config,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @RequirePermissions('agents.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar agente' })
  @ApiResponse({ status: 200, description: 'Agente eliminado' })
  @ApiResponse({ status: 403, description: 'Solo el propietario del proyecto puede eliminar' })
  @ApiResponse({ status: 404, description: 'Agente no encontrado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.agentsService.remove(id, req.user.id, req.user.organizationId);
  }

  @Get(':id/versions')
  @RequirePermissions('agents.read')
  @ApiOperation({ summary: 'Obtener historial de versiones del agente' })
  @ApiResponse({ status: 200, description: 'Historial de versiones' })
  @ApiResponse({ status: 404, description: 'Agente no encontrado' })
  getVersionHistory(@Param('id') id: string, @Request() req) {
    return this.agentsService.getVersionHistory(id, req.user.organizationId);
  }

  @Get(':id/metrics')
  @RequirePermissions('agents.read')
  @ApiOperation({ summary: 'Obtener métricas del agente' })
  @ApiResponse({ status: 200, description: 'Métricas del agente' })
  @ApiResponse({ status: 404, description: 'Agente no encontrado' })
  getMetrics(@Param('id') id: string, @Query('days') days: number = 7, @Request() req) {
    return this.agentsService.getMetrics(id, req.user.organizationId, days);
  }

  @Post(':id/clone')
  @RequirePermissions('agents.create')
  @ApiOperation({ summary: 'Clonar agente a otro proyecto' })
  @ApiResponse({ status: 201, description: 'Agente clonado exitosamente' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Agente o proyecto no encontrado' })
  cloneAgent(@Param('id') id: string, @Body() cloneAgentDto: CloneAgentDto, @Request() req) {
    return this.agentsService.cloneAgent(
      id,
      cloneAgentDto.newName,
      cloneAgentDto.targetProjectId,
      req.user.id,
      req.user.organizationId,
    );
  }
}
