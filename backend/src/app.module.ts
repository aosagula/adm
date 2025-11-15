import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import * as redisStore from 'cache-manager-redis-store';

// Common modules
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './common/health/health.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AgentsModule } from './modules/agents/agents.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { TechnologiesModule } from './modules/technologies/technologies.module';
import { PlatformsModule } from './modules/platforms/platforms.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { VersioningModule } from './modules/versioning/versioning.module';
import { AuditModule } from './modules/audit/audit.module';
import { TagsModule } from './modules/tags/tags.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { SandboxModule } from './modules/sandbox/sandbox.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../.env.local', '../.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Event Emitter
    EventEmitterModule.forRoot(),

    // Cache
    CacheModule.register({
      isGlobal: true,
      store: redisStore as any,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ttl: 300,
    }),

    // Bull Queue
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // Common
    PrismaModule,
    HealthModule,

    // Features
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    AgentsModule,
    TemplatesModule,
    TechnologiesModule,
    PlatformsModule,
    PromptsModule,
    ResourcesModule,
    VersioningModule,
    AuditModule,
    TagsModule,
    MetricsModule,
    AlertsModule,
    IntegrationsModule,
    SandboxModule,
  ],
})
export class AppModule {}
