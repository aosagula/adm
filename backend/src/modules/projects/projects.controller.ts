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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @RequirePermissions('projects.create')
  @ApiOperation({ summary: 'Crear nuevo proyecto' })
  @ApiResponse({ status: 201, description: 'Proyecto creado exitosamente' })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(
      createProjectDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get()
  @RequirePermissions('projects.read')
  @ApiOperation({ summary: 'Listar proyectos' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos' })
  findAll(@Request() req, @Query() filters: any) {
    return this.projectsService.findAll(req.user.organizationId, filters);
  }

  @Get(':id')
  @RequirePermissions('projects.read')
  @ApiOperation({ summary: 'Obtener detalle de proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('projects.update')
  @ApiOperation({ summary: 'Actualizar proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto actualizado' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req) {
    return this.projectsService.update(
      id,
      updateProjectDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Patch(':id/status')
  @RequirePermissions('projects.update')
  @ApiOperation({ summary: 'Cambiar estado del proyecto' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto, @Request() req) {
    return this.projectsService.updateStatus(
      id,
      updateStatusDto.status,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @RequirePermissions('projects.delete')
  @ApiOperation({ summary: 'Archivar proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto archivado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.id, req.user.organizationId);
  }

  @Post(':id/members')
  @RequirePermissions('projects.manage_members')
  @ApiOperation({ summary: 'Agregar miembro al proyecto' })
  @ApiResponse({ status: 201, description: 'Miembro agregado' })
  addMember(@Param('id') id: string, @Body() addMemberDto: AddMemberDto, @Request() req) {
    return this.projectsService.addMember(id, addMemberDto.userId, addMemberDto.role, req.user.id);
  }

  @Delete(':id/members/:memberId')
  @RequirePermissions('projects.manage_members')
  @ApiOperation({ summary: 'Remover miembro del proyecto' })
  @ApiResponse({ status: 200, description: 'Miembro removido' })
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string, @Request() req) {
    return this.projectsService.removeMember(id, memberId, req.user.id);
  }
}
