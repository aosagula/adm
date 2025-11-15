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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('tags')
@Controller('tags')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @RequirePermissions('tags.create')
  @ApiOperation({ summary: 'Crear nuevo tag' })
  @ApiResponse({ status: 201, description: 'Tag creado exitosamente' })
  create(@Body() createTagDto: CreateTagDto, @Request() req) {
    return this.tagsService.create(
      createTagDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get()
  @RequirePermissions('tags.read')
  @ApiOperation({ summary: 'Listar tags' })
  @ApiResponse({ status: 200, description: 'Lista de tags' })
  findAll(@Request() req, @Query() filters: any) {
    return this.tagsService.findAll(req.user.organizationId, filters);
  }

  @Get(':id')
  @RequirePermissions('tags.read')
  @ApiOperation({ summary: 'Obtener detalle de tag' })
  @ApiResponse({ status: 200, description: 'Tag encontrado' })
  @ApiResponse({ status: 404, description: 'Tag no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tagsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('tags.update')
  @ApiOperation({ summary: 'Actualizar tag' })
  @ApiResponse({ status: 200, description: 'Tag actualizado' })
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Request() req,
  ) {
    return this.tagsService.update(
      id,
      updateTagDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @RequirePermissions('tags.delete')
  @ApiOperation({ summary: 'Eliminar tag' })
  @ApiResponse({ status: 200, description: 'Tag eliminado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tagsService.remove(id, req.user.id, req.user.organizationId);
  }
}
