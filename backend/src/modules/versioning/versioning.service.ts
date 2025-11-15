import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ConfigurationType } from '@prisma/client';
import * as diff from 'diff';

export interface CreateVersionDto {
  projectId: string;
  configurationType: ConfigurationType;
  entityId: string;
  content: any;
  changesSummary?: string;
  createdBy: string;
}

@Injectable()
export class VersioningService {
  constructor(private prisma: PrismaService) {}

  async createVersion(data: CreateVersionDto) {
    const { projectId, configurationType, entityId, content, changesSummary, createdBy } = data;

    // Get last version
    const lastVersion = await this.prisma.configurationVersion.findFirst({
      where: {
        projectId,
        configurationType,
        entityId,
      },
      orderBy: {
        version: 'desc',
      },
    });

    const version = lastVersion ? lastVersion.version + 1 : 1;

    // Calculate diff if there's a previous version
    let diffResult = null;
    if (lastVersion) {
      const oldContent = JSON.stringify(lastVersion.content, null, 2);
      const newContent = JSON.stringify(content, null, 2);
      const patches = diff.createPatch('config', oldContent, newContent);
      diffResult = { patches };
    }

    return this.prisma.configurationVersion.create({
      data: {
        projectId,
        configurationType,
        entityId,
        version,
        content,
        diff: diffResult,
        changesSummary,
        createdBy,
      },
    });
  }

  async getVersionHistory(projectId: string, entityId?: string) {
    const where: any = { projectId };
    if (entityId) {
      where.entityId = entityId;
    }

    return this.prisma.configurationVersion.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getVersion(versionId: string) {
    return this.prisma.configurationVersion.findUnique({
      where: { id: versionId },
    });
  }

  async compareVersions(versionId1: string, versionId2: string) {
    const [version1, version2] = await Promise.all([
      this.getVersion(versionId1),
      this.getVersion(versionId2),
    ]);

    if (!version1 || !version2) {
      throw new Error('Version not found');
    }

    const content1 = JSON.stringify(version1.content, null, 2);
    const content2 = JSON.stringify(version2.content, null, 2);

    const patches = diff.createPatch('config', content1, content2);

    return {
      version1,
      version2,
      diff: patches,
    };
  }

  async restoreVersion(versionId: string, userId: string) {
    const version = await this.getVersion(versionId);

    if (!version) {
      throw new Error('Version not found');
    }

    // Create a new version with the restored content
    return this.createVersion({
      projectId: version.projectId,
      configurationType: version.configurationType,
      entityId: version.entityId,
      content: version.content,
      changesSummary: `Restored to version ${version.version}`,
      createdBy: userId,
    });
  }
}
