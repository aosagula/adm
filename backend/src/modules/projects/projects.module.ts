import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AuditModule } from '../audit/audit.module';
import { VersioningModule } from '../versioning/versioning.module';

@Module({
  imports: [AuditModule, VersioningModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
