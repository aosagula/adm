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
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('platforms')
@Controller('platforms')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Post()
  @RequirePermissions('platforms.create')
  @ApiOperation({ summary: 'Crear nueva plataforma' })
  @ApiResponse({ status: 201, description: 'Plataforma creada exitosamente' })
  create(@Body() createPlatformDto: CreatePlatformDto, @Request() req) {
    return this.platformsService.create(
      createPlatformDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get()
  @RequirePermissions('platforms.read')
  @ApiOperation({ summary: 'Listar plataformas' })
  @ApiResponse({ status: 200, description: 'Lista de plataformas' })
  findAll(@Request() req, @Query() filters: any) {
    return this.platformsService.findAll(req.user.organizationId, filters);
  }

  @Get(':id')
  @RequirePermissions('platforms.read')
  @ApiOperation({ summary: 'Obtener detalle de plataforma' })
  @ApiResponse({ status: 200, description: 'Plataforma encontrada' })
  @ApiResponse({ status: 404, description: 'Plataforma no encontrada' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.platformsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('platforms.update')
  @ApiOperation({ summary: 'Actualizar plataforma' })
  @ApiResponse({ status: 200, description: 'Plataforma actualizada' })
  update(
    @Param('id') id: string,
    @Body() updatePlatformDto: UpdatePlatformDto,
    @Request() req,
  ) {
    return this.platformsService.update(
      id,
      updatePlatformDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @RequirePermissions('platforms.delete')
  @ApiOperation({ summary: 'Eliminar plataforma' })
  @ApiResponse({ status: 200, description: 'Plataforma eliminada' })
  remove(@Param('id') id: string, @Request() req) {
    return this.platformsService.remove(id, req.user.id, req.user.organizationId);
  }
}
