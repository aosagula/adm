import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(createTemplateDto: CreateTemplateDto, userId: string, organizationId: string) {
    const template = await this.prisma.template.create({
      data: {
        ...createTemplateDto,
        organizationId,
        createdById: userId,
        baseConfig: createTemplateDto.baseConfig || {},
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        stacks: {
          include: {
            platform: true,
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
      },
    });

    await this.auditService.log({
      eventType: 'CREATE',
      resource: 'template',
      resourceId: template.id,
      action: 'create',
      description: `Template ${template.name} creado`,
      userId,
      newValues: template,
    });

    return template;
  }

  async findAll(organizationId: string, filters?: any) {
    const { category, isPublic } = filters || {};

    const where: any = {
      OR: [
        { organizationId },
        { isPublic: true },
      ],
    };

    if (category) where.category = category;
    if (typeof isPublic === 'boolean') where.isPublic = isPublic;

    return this.prisma.template.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        stacks: {
          include: {
            platform: true,
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
        _count: {
          select: {
            projects: true,
            stacks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const template = await this.prisma.template.findFirst({
      where: {
        id,
        OR: [
          { organizationId },
          { isPublic: true },
        ],
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        stacks: {
          include: {
            platform: true,
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
        projects: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template no encontrado');
    }

    return template;
  }

  async update(
    id: string,
    updateTemplateDto: UpdateTemplateDto,
    userId: string,
    organizationId: string,
  ) {
    const template = await this.prisma.template.findFirst({
      where: { id, organizationId },
    });

    if (!template) {
      throw new NotFoundException('Template no encontrado');
    }

    if (template.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para editar este template');
    }

    const oldValues = { ...template };

    const updated = await this.prisma.template.update({
      where: { id },
      data: updateTemplateDto,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        stacks: {
          include: {
            platform: true,
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
      },
    });

    await this.auditService.log({
      eventType: 'UPDATE',
      resource: 'template',
      resourceId: id,
      action: 'update',
      description: `Template ${template.name} actualizado`,
      userId,
      oldValues,
      newValues: updated,
    });

    return updated;
  }

  async remove(id: string, userId: string, organizationId: string) {
    const template = await this.prisma.template.findFirst({
      where: { id, organizationId },
    });

    if (!template) {
      throw new NotFoundException('Template no encontrado');
    }

    if (template.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este template');
    }

    await this.prisma.template.delete({
      where: { id },
    });

    await this.auditService.log({
      eventType: 'DELETE',
      resource: 'template',
      resourceId: id,
      action: 'delete',
      description: `Template ${template.name} eliminado`,
      userId,
    });

    return { message: 'Template eliminado exitosamente' };
  }
}
