import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { VersioningService } from '../versioning/versioning.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private versioningService: VersioningService,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string, organizationId: string) {
    const { name, slug, description, longDescription, templateId, visibility, status } =
      createProjectDto;

    // Check if slug already exists in organization
    const existingProject = await this.prisma.project.findFirst({
      where: {
        organizationId,
        slug,
      },
    });

    if (existingProject) {
      throw new ForbiddenException('Ya existe un proyecto con ese slug');
    }

    const project = await this.prisma.project.create({
      data: {
        name,
        slug,
        description,
        longDescription,
        organizationId,
        ownerId: userId,
        templateId,
        visibility: visibility || 'PRIVATE',
        status: status || 'DEVELOPMENT',
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        template: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Add owner as member
    await this.prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: 'OWNER',
      },
    });

    // Create initial version
    await this.versioningService.createVersion({
      projectId: project.id,
      configurationType: 'PROJECT',
      entityId: project.id,
      content: project,
      changesSummary: 'Proyecto creado',
      createdBy: userId,
    });

    // Audit log
    await this.auditService.log({
      eventType: 'CREATE',
      resource: 'project',
      resourceId: project.id,
      action: 'create',
      description: `Proyecto ${name} creado`,
      userId,
      newValues: project,
    });

    return project;
  }

  async findAll(organizationId: string, filters?: any) {
    const { status, visibility, ownerId } = filters || {};

    const where: any = { organizationId };

    if (status) where.status = status;
    if (visibility) where.visibility = visibility;
    if (ownerId) where.ownerId = ownerId;

    return this.prisma.project.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        template: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            agents: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        template: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        agents: true,
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
        tags: {
          include: {
            tag: true,
          },
        },
        configVersions: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
    organizationId: string,
  ) {
    const project = await this.findOne(id, organizationId);

    // Check permissions
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember && project.ownerId !== userId) {
      throw new ForbiddenException('No tiene permisos para editar este proyecto');
    }

    const oldValues = { ...project };

    const updated = await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        template: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Create version
    await this.versioningService.createVersion({
      projectId: id,
      configurationType: 'PROJECT',
      entityId: id,
      content: updated,
      changesSummary: 'Proyecto actualizado',
      createdBy: userId,
    });

    // Audit log
    await this.auditService.log({
      eventType: 'UPDATE',
      resource: 'project',
      resourceId: id,
      action: 'update',
      description: `Proyecto ${project.name} actualizado`,
      userId,
      oldValues,
      newValues: updated,
    });

    return updated;
  }

  async updateStatus(id: string, status: ProjectStatus, userId: string, organizationId: string) {
    const project = await this.findOne(id, organizationId);

    const updated = await this.prisma.project.update({
      where: { id },
      data: { status },
    });

    // Audit log
    await this.auditService.log({
      eventType: 'STATUS_CHANGE',
      resource: 'project',
      resourceId: id,
      action: 'change_status',
      description: `Estado del proyecto ${project.name} cambiado de ${project.status} a ${status}`,
      userId,
      oldValues: { status: project.status },
      newValues: { status },
    });

    return updated;
  }

  async remove(id: string, userId: string, organizationId: string) {
    const project = await this.findOne(id, organizationId);

    // Only owner can delete
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Solo el propietario puede eliminar el proyecto');
    }

    const deleted = await this.prisma.project.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    // Audit log
    await this.auditService.log({
      eventType: 'DELETE',
      resource: 'project',
      resourceId: id,
      action: 'archive',
      description: `Proyecto ${project.name} archivado`,
      userId,
    });

    return deleted;
  }

  async addMember(projectId: string, memberId: string, role: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { owner: true },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Only owner can add members
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Solo el propietario puede agregar miembros');
    }

    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: memberId,
        role: role as any,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Audit log
    await this.auditService.log({
      eventType: 'CREATE',
      resource: 'project_member',
      resourceId: member.id,
      action: 'add_member',
      description: `Miembro agregado al proyecto ${project.name}`,
      userId,
      newValues: member,
    });

    return member;
  }

  async removeMember(projectId: string, memberId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Only owner can remove members
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Solo el propietario puede remover miembros');
    }

    const member = await this.prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: memberId,
      },
    });

    if (!member) {
      throw new NotFoundException('Miembro no encontrado');
    }

    await this.prisma.projectMember.delete({
      where: { id: member.id },
    });

    // Audit log
    await this.auditService.log({
      eventType: 'DELETE',
      resource: 'project_member',
      resourceId: member.id,
      action: 'remove_member',
      description: `Miembro removido del proyecto ${project.name}`,
      userId,
    });

    return { message: 'Miembro removido exitosamente' };
  }
}
