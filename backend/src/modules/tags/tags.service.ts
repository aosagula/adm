import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(createTagDto: CreateTagDto, userId: string, organizationId: string) {
    // Check if tag name already exists in organization
    const existing = await this.prisma.tag.findFirst({
      where: {
        organizationId,
        name: createTagDto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe un tag con ese nombre');
    }

    const tag = await this.prisma.tag.create({
      data: {
        ...createTagDto,
        organizationId,
        isSystem: createTagDto.isSystem || false,
      },
      include: {
        projectTags: {
          include: {
            project: true,
          },
        },
      },
    });

    await this.auditService.log({
      eventType: 'CREATE',
      resource: 'tag',
      resourceId: tag.id,
      action: 'create',
      description: `Tag ${tag.name} creado`,
      userId,
      newValues: tag,
    });

    return tag;
  }

  async findAll(organizationId: string, filters?: any) {
    const { isSystem } = filters || {};

    const where: any = { organizationId };

    if (typeof isSystem === 'boolean') where.isSystem = isSystem;

    return this.prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: {
            projectTags: true,
            tagSuggestions: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const tag = await this.prisma.tag.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        projectTags: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
              },
            },
          },
        },
        tagSuggestions: {
          take: 10,
          orderBy: {
            confidence: 'desc',
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag no encontrado');
    }

    return tag;
  }

  async update(
    id: string,
    updateTagDto: UpdateTagDto,
    userId: string,
    organizationId: string,
  ) {
    const tag = await this.prisma.tag.findFirst({
      where: { id, organizationId },
    });

    if (!tag) {
      throw new NotFoundException('Tag no encontrado');
    }

    // Check if new name conflicts
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existing = await this.prisma.tag.findFirst({
        where: {
          organizationId,
          name: updateTagDto.name,
        },
      });

      if (existing) {
        throw new ConflictException('Ya existe un tag con ese nombre');
      }
    }

    const oldValues = { ...tag };

    const updated = await this.prisma.tag.update({
      where: { id },
      data: updateTagDto,
    });

    await this.auditService.log({
      eventType: 'UPDATE',
      resource: 'tag',
      resourceId: id,
      action: 'update',
      description: `Tag ${tag.name} actualizado`,
      userId,
      oldValues,
      newValues: updated,
    });

    return updated;
  }

  async remove(id: string, userId: string, organizationId: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id, organizationId },
    });

    if (!tag) {
      throw new NotFoundException('Tag no encontrado');
    }

    if (tag.isSystem) {
      throw new ConflictException('No se pueden eliminar tags del sistema');
    }

    await this.prisma.tag.delete({
      where: { id },
    });

    await this.auditService.log({
      eventType: 'DELETE',
      resource: 'tag',
      resourceId: id,
      action: 'delete',
      description: `Tag ${tag.name} eliminado`,
      userId,
    });

    return { message: 'Tag eliminado exitosamente' };
  }
}
