import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { VersioningService } from '../versioning/versioning.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { QueryAgentsDto } from './dto/query-agents.dto';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private versioningService: VersioningService,
    private projectsService: ProjectsService,
  ) {}

  async create(
    projectId: string,
    createAgentDto: CreateAgentDto,
    userId: string,
    organizationId: string,
  ) {
    const { name, description, config, isActive } = createAgentDto;

    // Verify project exists and user has access
    const project = await this.projectsService.findOne(projectId, organizationId);

    // Check if user is member of project
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember && project.ownerId !== userId) {
      throw new ForbiddenException('No tiene permisos para crear agentes en este proyecto');
    }

    const agent = await this.prisma.agent.create({
      data: {
        projectId,
        name,
        description,
        config: config || {},
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        prompts: true,
      },
    });

    // Create initial version
    await this.versioningService.createVersion({
      projectId,
      configurationType: 'AGENT',
      entityId: agent.id,
      content: agent,
      changesSummary: 'Agente creado',
      createdBy: userId,
    });

    // Audit log
    await this.auditService.log({
      eventType: 'CREATE',
      resource: 'agent',
      resourceId: agent.id,
      action: 'create',
      description: `Agente ${name} creado en proyecto ${project.name}`,
      userId,
      newValues: agent,
    });

    this.logger.log(`Agent ${agent.id} created in project ${projectId} by user ${userId}`);

    return agent;
  }

  async findAll(queryDto: QueryAgentsDto, organizationId: string) {
    const { projectId, isActive, search, page = 1, limit = 50 } = queryDto;

    const where: any = {
      project: {
        organizationId,
      },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.agent.count({ where }),
      this.prisma.agent.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          prompts: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              prompts: true,
              metrics: true,
              testSessions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByProject(projectId: string, organizationId: string) {
    // Verify project exists and user has access
    await this.projectsService.findOne(projectId, organizationId);

    return this.prisma.agent.findMany({
      where: { projectId },
      include: {
        prompts: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            prompts: true,
            metrics: true,
            testSessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const agent = await this.prisma.agent.findFirst({
      where: {
        id,
        project: {
          organizationId,
        },
      },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
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
        },
        prompts: {
          orderBy: { order: 'asc' },
        },
        metrics: {
          take: 10,
          orderBy: { timestamp: 'desc' },
        },
        testSessions: {
          take: 5,
          orderBy: { startedAt: 'desc' },
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

    if (!agent) {
      throw new NotFoundException('Agente no encontrado');
    }

    return agent;
  }

  async update(
    id: string,
    updateAgentDto: UpdateAgentDto,
    userId: string,
    organizationId: string,
  ) {
    const agent = await this.findOne(id, organizationId);

    // Check permissions
    const isMember = agent.project.members.some((m) => m.userId === userId);
    if (!isMember && agent.project.ownerId !== userId) {
      throw new ForbiddenException('No tiene permisos para editar este agente');
    }

    const oldValues = { ...agent };

    // Handle config merge if partial update
    let newConfig = updateAgentDto.config;
    if (newConfig && typeof newConfig === 'object') {
      newConfig = {
        ...(agent.config as any),
        ...newConfig,
      };
    }

    const updated = await this.prisma.agent.update({
      where: { id },
      data: {
        ...updateAgentDto,
        config: newConfig || updateAgentDto.config,
      },
      include: {
        project: true,
        prompts: true,
      },
    });

    // Create version
    await this.versioningService.createVersion({
      projectId: agent.projectId,
      configurationType: 'AGENT',
      entityId: id,
      content: updated,
      changesSummary: 'Agente actualizado',
      createdBy: userId,
    });

    // Audit log
    await this.auditService.log({
      eventType: 'UPDATE',
      resource: 'agent',
      resourceId: id,
      action: 'update',
      description: `Agente ${agent.name} actualizado`,
      userId,
      oldValues,
      newValues: updated,
    });

    this.logger.log(`Agent ${id} updated by user ${userId}`);

    return updated;
  }

  async toggleActive(id: string, userId: string, organizationId: string) {
    const agent = await this.findOne(id, organizationId);

    // Check permissions
    const isMember = agent.project.members.some((m) => m.userId === userId);
    if (!isMember && agent.project.ownerId !== userId) {
      throw new ForbiddenException('No tiene permisos para modificar este agente');
    }

    const newStatus = !agent.isActive;

    const updated = await this.prisma.agent.update({
      where: { id },
      data: { isActive: newStatus },
    });

    // Audit log
    await this.auditService.log({
      eventType: 'STATUS_CHANGE',
      resource: 'agent',
      resourceId: id,
      action: newStatus ? 'activate' : 'deactivate',
      description: `Agente ${agent.name} ${newStatus ? 'activado' : 'desactivado'}`,
      userId,
      oldValues: { isActive: agent.isActive },
      newValues: { isActive: newStatus },
    });

    this.logger.log(`Agent ${id} ${newStatus ? 'activated' : 'deactivated'} by user ${userId}`);

    return updated;
  }

  async remove(id: string, userId: string, organizationId: string) {
    const agent = await this.findOne(id, organizationId);

    // Only project owner can delete
    if (agent.project.ownerId !== userId) {
      throw new ForbiddenException('Solo el propietario del proyecto puede eliminar agentes');
    }

    await this.prisma.agent.delete({
      where: { id },
    });

    // Audit log
    await this.auditService.log({
      eventType: 'DELETE',
      resource: 'agent',
      resourceId: id,
      action: 'delete',
      description: `Agente ${agent.name} eliminado`,
      userId,
      oldValues: agent,
    });

    this.logger.log(`Agent ${id} deleted by user ${userId}`);

    return { message: 'Agente eliminado exitosamente' };
  }

  async updateConfig(
    id: string,
    config: any,
    userId: string,
    organizationId: string,
  ) {
    const agent = await this.findOne(id, organizationId);

    // Check permissions
    const isMember = agent.project.members.some((m) => m.userId === userId);
    if (!isMember && agent.project.ownerId !== userId) {
      throw new ForbiddenException('No tiene permisos para modificar este agente');
    }

    const oldConfig = agent.config;

    // Merge with existing config
    const newConfig = {
      ...(agent.config as any),
      ...config,
    };

    const updated = await this.prisma.agent.update({
      where: { id },
      data: { config: newConfig },
    });

    // Create version
    await this.versioningService.createVersion({
      projectId: agent.projectId,
      configurationType: 'AGENT',
      entityId: id,
      content: { config: newConfig },
      changesSummary: 'Configuración del agente actualizada',
      createdBy: userId,
    });

    // Audit log
    await this.auditService.log({
      eventType: 'UPDATE',
      resource: 'agent',
      resourceId: id,
      action: 'update_config',
      description: `Configuración del agente ${agent.name} actualizada`,
      userId,
      oldValues: { config: oldConfig },
      newValues: { config: newConfig },
    });

    this.logger.log(`Agent ${id} config updated by user ${userId}`);

    return updated;
  }

  async getVersionHistory(id: string, organizationId: string) {
    const agent = await this.findOne(id, organizationId);

    return this.versioningService.getVersionHistory(agent.projectId, id);
  }

  async getMetrics(id: string, organizationId: string, days: number = 7) {
    await this.findOne(id, organizationId);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.agentMetric.findMany({
      where: {
        agentId: id,
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async cloneAgent(
    id: string,
    newName: string,
    targetProjectId: string,
    userId: string,
    organizationId: string,
  ) {
    const sourceAgent = await this.findOne(id, organizationId);

    // Verify target project exists and user has access
    await this.projectsService.findOne(targetProjectId, organizationId);

    const clonedAgent = await this.create(
      targetProjectId,
      {
        name: newName,
        description: `Clonado de: ${sourceAgent.name}`,
        config: sourceAgent.config,
        isActive: false, // Start as inactive
      },
      userId,
      organizationId,
    );

    // Clone prompts if any
    for (const prompt of sourceAgent.prompts) {
      await this.prisma.agentPrompt.create({
        data: {
          agentId: clonedAgent.id,
          name: prompt.name,
          content: prompt.content,
          parameters: prompt.parameters,
          order: prompt.order,
          isActive: prompt.isActive,
        },
      });
    }

    this.logger.log(
      `Agent ${id} cloned to ${clonedAgent.id} in project ${targetProjectId} by user ${userId}`,
    );

    return clonedAgent;
  }
}
