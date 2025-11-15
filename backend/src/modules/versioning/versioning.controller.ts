import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VersioningService } from './versioning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('versioning')
@Controller('versioning')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VersioningController {
  constructor(private readonly versioningService: VersioningService) {}

  @Get('project/:projectId')
  getHistory(@Param('projectId') projectId: string, @Query('entityId') entityId?: string) {
    return this.versioningService.getVersionHistory(projectId, entityId);
  }

  @Get(':versionId')
  getVersion(@Param('versionId') versionId: string) {
    return this.versioningService.getVersion(versionId);
  }

  @Get('compare/:versionId1/:versionId2')
  compareVersions(
    @Param('versionId1') versionId1: string,
    @Param('versionId2') versionId2: string,
  ) {
    return this.versioningService.compareVersions(versionId1, versionId2);
  }

  @Post('restore/:versionId')
  restoreVersion(@Param('versionId') versionId: string, @Request() req) {
    return this.versioningService.restoreVersion(versionId, req.user.id);
  }
}
