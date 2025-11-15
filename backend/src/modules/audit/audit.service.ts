import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(createAuditLogDto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        eventType: createAuditLogDto.eventType,
        resource: createAuditLogDto.resource,
        resourceId: createAuditLogDto.resourceId,
        action: createAuditLogDto.action,
        description: createAuditLogDto.description,
        userId: createAuditLogDto.userId,
        ipAddress: createAuditLogDto.ipAddress,
        userAgent: createAuditLogDto.userAgent,
        oldValues: createAuditLogDto.oldValues,
        newValues: createAuditLogDto.newValues,
        metadata: createAuditLogDto.metadata,
      },
    });
  }

  async findAll(queryDto: QueryAuditLogsDto) {
    const { page = 1, limit = 50, eventType, resource, userId, startDate, endDate } = queryDto;

    const where: any = {};

    if (eventType) {
      where.eventType = eventType;
    }

    if (resource) {
      where.resource = resource;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
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

  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
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
  }

  async exportLogs(queryDto: QueryAuditLogsDto) {
    const { eventType, resource, userId, startDate, endDate } = queryDto;

    const where: any = {};

    if (eventType) where.eventType = eventType;
    if (resource) where.resource = resource;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs;
  }
}
