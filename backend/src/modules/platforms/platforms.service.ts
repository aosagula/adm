import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';

@Injectable()
export class PlatformsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(createPlatformDto: CreatePlatformDto, userId: string, organizationId: string) {
    const platform = await this.prisma.platform.create({
      data: {
        ...createPlatformDto,
        organizationId,
        config: createPlatformDto.config || {},
      },
      include: {
        stacks: {
          include: {
            template: true,
          },
        },
      },
    });

    await this.auditService.log({
      eventType: 'CREATE',
      resource: 'platform',
      resourceId: platform.id,
      action: 'create',
      description: `Platform ${platform.name} creada`,
      userId,
      newValues: platform,
    });

    return platform;
  }

  async findAll(organizationId: string, filters?: any) {
    const { provider } = filters || {};

    const where: any = { organizationId };

    if (provider) where.provider = provider;

    return this.prisma.platform.findMany({
      where,
      include: {
        _count: {
          select: {
            stacks: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const platform = await this.prisma.platform.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        stacks: {
          include: {
            template: true,
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
      },
    });

    if (!platform) {
      throw new NotFoundException('Platform no encontrada');
    }

    return platform;
  }

  async update(
    id: string,
    updatePlatformDto: UpdatePlatformDto,
    userId: string,
    organizationId: string,
  ) {
    const platform = await this.prisma.platform.findFirst({
      where: { id, organizationId },
    });

    if (!platform) {
      throw new NotFoundException('Platform no encontrada');
    }

    const oldValues = { ...platform };

    const updated = await this.prisma.platform.update({
      where: { id },
      data: updatePlatformDto,
    });

    await this.auditService.log({
      eventType: 'UPDATE',
      resource: 'platform',
      resourceId: id,
      action: 'update',
      description: `Platform ${platform.name} actualizada`,
      userId,
      oldValues,
      newValues: updated,
    });

    return updated;
  }

  async remove(id: string, userId: string, organizationId: string) {
    const platform = await this.prisma.platform.findFirst({
      where: { id, organizationId },
    });

    if (!platform) {
      throw new NotFoundException('Platform no encontrada');
    }

    await this.prisma.platform.delete({
      where: { id },
    });

    await this.auditService.log({
      eventType: 'DELETE',
      resource: 'platform',
      resourceId: id,
      action: 'delete',
      description: `Platform ${platform.name} eliminada`,
      userId,
    });

    return { message: 'Platform eliminada exitosamente' };
  }
}
