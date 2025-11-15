import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { AuditModule } from '../audit/audit.module';
import { VersioningModule } from '../versioning/versioning.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [AuditModule, VersioningModule, ProjectsModule],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
