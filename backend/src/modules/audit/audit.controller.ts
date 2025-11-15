import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions('audit.read')
  @ApiOperation({ summary: 'Listar logs de auditoría' })
  @ApiResponse({ status: 200, description: 'Lista de logs de auditoría' })
  findAll(@Query() queryDto: QueryAuditLogsDto) {
    return this.auditService.findAll(queryDto);
  }

  @Get('export')
  @RequirePermissions('audit.export')
  @ApiOperation({ summary: 'Exportar logs de auditoría' })
  @ApiResponse({ status: 200, description: 'Logs exportados' })
  export(@Query() queryDto: QueryAuditLogsDto) {
    return this.auditService.exportLogs(queryDto);
  }

  @Get(':id')
  @RequirePermissions('audit.read')
  @ApiOperation({ summary: 'Obtener detalle de un log de auditoría' })
  @ApiResponse({ status: 200, description: 'Log de auditoría encontrado' })
  @ApiResponse({ status: 404, description: 'Log no encontrado' })
  findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}
