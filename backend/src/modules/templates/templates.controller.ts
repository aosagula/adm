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
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('templates')
@Controller('templates')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @RequirePermissions('templates.create')
  @ApiOperation({ summary: 'Crear nueva plantilla' })
  @ApiResponse({ status: 201, description: 'Plantilla creada exitosamente' })
  create(@Body() createTemplateDto: CreateTemplateDto, @Request() req) {
    return this.templatesService.create(
      createTemplateDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get()
  @RequirePermissions('templates.read')
  @ApiOperation({ summary: 'Listar plantillas' })
  @ApiResponse({ status: 200, description: 'Lista de plantillas' })
  findAll(@Request() req, @Query() filters: any) {
    return this.templatesService.findAll(req.user.organizationId, filters);
  }

  @Get(':id')
  @RequirePermissions('templates.read')
  @ApiOperation({ summary: 'Obtener detalle de plantilla' })
  @ApiResponse({ status: 200, description: 'Plantilla encontrada' })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.templatesService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('templates.update')
  @ApiOperation({ summary: 'Actualizar plantilla' })
  @ApiResponse({ status: 200, description: 'Plantilla actualizada' })
  update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @Request() req,
  ) {
    return this.templatesService.update(
      id,
      updateTemplateDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @RequirePermissions('templates.delete')
  @ApiOperation({ summary: 'Eliminar plantilla' })
  @ApiResponse({ status: 200, description: 'Plantilla eliminada' })
  remove(@Param('id') id: string, @Request() req) {
    return this.templatesService.remove(id, req.user.id, req.user.organizationId);
  }
}
