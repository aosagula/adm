import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';

@Injectable()
export class TechnologiesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(createTechnologyDto: CreateTechnologyDto, userId: string, organizationId: string) {
    const technology = await this.prisma.technology.create({
      data: {
        ...createTechnologyDto,
        organizationId,
      },
      include: {
        versions: true,
        stackTechnologies: {
          include: {
            stack: true,
          },
        },
      },
    });

    await this.auditService.log({
      eventType: 'CREATE',
      resource: 'technology',
      resourceId: technology.id,
      action: 'create',
      description: `Technology ${technology.name} creada`,
      userId,
      newValues: technology,
    });

    return technology;
  }

  async findAll(organizationId: string, filters?: any) {
    const { type } = filters || {};

    const where: any = { organizationId };

    if (type) where.type = type;

    return this.prisma.technology.findMany({
      where,
      include: {
        versions: {
          orderBy: {
            releaseDate: 'desc',
          },
        },
        _count: {
          select: {
            stackTechnologies: true,
            versions: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const technology = await this.prisma.technology.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        versions: {
          orderBy: {
            releaseDate: 'desc',
          },
        },
        stackTechnologies: {
          include: {
            stack: {
              include: {
                template: true,
              },
            },
          },
        },
      },
    });

    if (!technology) {
      throw new NotFoundException('Technology no encontrada');
    }

    return technology;
  }

  async update(
    id: string,
    updateTechnologyDto: UpdateTechnologyDto,
    userId: string,
    organizationId: string,
  ) {
    const technology = await this.prisma.technology.findFirst({
      where: { id, organizationId },
    });

    if (!technology) {
      throw new NotFoundException('Technology no encontrada');
    }

    const oldValues = { ...technology };

    const updated = await this.prisma.technology.update({
      where: { id },
      data: updateTechnologyDto,
      include: {
        versions: true,
      },
    });

    await this.auditService.log({
      eventType: 'UPDATE',
      resource: 'technology',
      resourceId: id,
      action: 'update',
      description: `Technology ${technology.name} actualizada`,
      userId,
      oldValues,
      newValues: updated,
    });

    return updated;
  }

  async remove(id: string, userId: string, organizationId: string) {
    const technology = await this.prisma.technology.findFirst({
      where: { id, organizationId },
    });

    if (!technology) {
      throw new NotFoundException('Technology no encontrada');
    }

    await this.prisma.technology.delete({
      where: { id },
    });

    await this.auditService.log({
      eventType: 'DELETE',
      resource: 'technology',
      resourceId: id,
      action: 'delete',
      description: `Technology ${technology.name} eliminada`,
      userId,
    });

    return { message: 'Technology eliminada exitosamente' };
  }
}
