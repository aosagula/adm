import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Listar todos los usuarios de la organización' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  findAll(@Request() req) {
    return this.usersService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.usersService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @RequirePermissions('users.update')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, req.user.organizationId, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  @ApiOperation({ summary: 'Desactivar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user.organizationId);
  }

  @Post(':id/roles')
  @RequirePermissions('users.assign_role')
  @ApiOperation({ summary: 'Asignar rol a usuario' })
  @ApiResponse({ status: 201, description: 'Rol asignado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  assignRole(@Param('id') id: string, @Body() assignRoleDto: AssignRoleDto, @Request() req) {
    return this.usersService.assignRole(id, assignRoleDto.roleId, req.user.organizationId);
  }

  @Delete(':id/roles/:roleId')
  @RequirePermissions('users.remove_role')
  @ApiOperation({ summary: 'Remover rol de usuario' })
  @ApiResponse({ status: 200, description: 'Rol removido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  removeRole(@Param('id') id: string, @Param('roleId') roleId: string, @Request() req) {
    return this.usersService.removeRole(id, roleId, req.user.organizationId);
  }
}
