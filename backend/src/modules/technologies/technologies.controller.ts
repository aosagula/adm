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
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('technologies')
@Controller('technologies')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Post()
  @RequirePermissions('technologies.create')
  @ApiOperation({ summary: 'Crear nueva tecnología' })
  @ApiResponse({ status: 201, description: 'Tecnología creada exitosamente' })
  create(@Body() createTechnologyDto: CreateTechnologyDto, @Request() req) {
    return this.technologiesService.create(
      createTechnologyDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get()
  @RequirePermissions('technologies.read')
  @ApiOperation({ summary: 'Listar tecnologías' })
  @ApiResponse({ status: 200, description: 'Lista de tecnologías' })
  findAll(@Request() req, @Query() filters: any) {
    return this.technologiesService.findAll(req.user.organizationId, filters);
  }

  @Get(':id')
  @RequirePermissions('technologies.read')
  @ApiOperation({ summary: 'Obtener detalle de tecnología' })
  @ApiResponse({ status: 200, description: 'Tecnología encontrada' })
  @ApiResponse({ status: 404, description: 'Tecnología no encontrada' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.technologiesService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('technologies.update')
  @ApiOperation({ summary: 'Actualizar tecnología' })
  @ApiResponse({ status: 200, description: 'Tecnología actualizada' })
  update(
    @Param('id') id: string,
    @Body() updateTechnologyDto: UpdateTechnologyDto,
    @Request() req,
  ) {
    return this.technologiesService.update(
      id,
      updateTechnologyDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @RequirePermissions('technologies.delete')
  @ApiOperation({ summary: 'Eliminar tecnología' })
  @ApiResponse({ status: 200, description: 'Tecnología eliminada' })
  remove(@Param('id') id: string, @Request() req) {
    return this.technologiesService.remove(id, req.user.id, req.user.organizationId);
  }
}
