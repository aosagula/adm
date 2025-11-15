import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        isActive: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async update(id: string, organizationId: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id, organizationId);

    return this.prisma.user.update({
      where: { id: user.id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        isActive: true,
        isVerified: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    const user = await this.findOne(id, organizationId);

    return this.prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });
  }

  async assignRole(userId: string, roleId: string, organizationId: string) {
    const user = await this.findOne(userId, organizationId);

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    return this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId,
      },
      include: {
        role: true,
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

  async removeRole(userId: string, roleId: string, organizationId: string) {
    const user = await this.findOne(userId, organizationId);

    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId: user.id,
        roleId,
      },
    });

    if (!userRole) {
      throw new NotFoundException('El usuario no tiene ese rol asignado');
    }

    return this.prisma.userRole.delete({
      where: { id: userRole.id },
    });
  }
}
