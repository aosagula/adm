import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default organization
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Organización Default',
      slug: 'default',
      description: 'Organización por defecto para pruebas',
      isActive: true,
      settings: {
        create: {
          brandColor: '#1976d2',
          allowPublicSignup: true,
          requireEmailVerification: false,
        },
      },
    },
  });

  console.log('✅ Organization created:', org.name);

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Administrador con todos los permisos',
      isSystem: true,
      isDefault: false,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'Usuario estándar',
      isSystem: true,
      isDefault: true,
    },
  });

  console.log('✅ Roles created: Admin, User');

  // Create permissions
  const permissions = [
    { name: 'users.read', resource: 'users', action: 'read', description: 'Ver usuarios' },
    { name: 'users.create', resource: 'users', action: 'create', description: 'Crear usuarios' },
    { name: 'users.update', resource: 'users', action: 'update', description: 'Actualizar usuarios' },
    { name: 'users.delete', resource: 'users', action: 'delete', description: 'Eliminar usuarios' },
    { name: 'users.assign_role', resource: 'users', action: 'assign_role', description: 'Asignar roles' },
    { name: 'users.remove_role', resource: 'users', action: 'remove_role', description: 'Remover roles' },

    { name: 'projects.read', resource: 'projects', action: 'read', description: 'Ver proyectos' },
    { name: 'projects.create', resource: 'projects', action: 'create', description: 'Crear proyectos' },
    { name: 'projects.update', resource: 'projects', action: 'update', description: 'Actualizar proyectos' },
    { name: 'projects.delete', resource: 'projects', action: 'delete', description: 'Eliminar proyectos' },
    { name: 'projects.manage_members', resource: 'projects', action: 'manage_members', description: 'Gestionar miembros' },

    { name: 'audit.read', resource: 'audit', action: 'read', description: 'Ver auditoría' },
    { name: 'audit.export', resource: 'audit', action: 'export', description: 'Exportar logs' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  console.log(`✅ ${permissions.length} permissions created`);

  // Assign all permissions to Admin role
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Assign basic permissions to User role
  const userPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: ['projects.read', 'projects.create', 'projects.update'],
      },
    },
  });

  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Permissions assigned to roles');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@adm.com' },
    update: {},
    create: {
      email: 'admin@adm.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      organizationId: org.id,
      authProvider: 'LOCAL',
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin user created (admin@adm.com / admin123)');

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@adm.com' },
    update: {},
    create: {
      email: 'user@adm.com',
      password: userPassword,
      firstName: 'Test',
      lastName: 'User',
      organizationId: org.id,
      authProvider: 'LOCAL',
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: userRole.id,
    },
  });

  console.log('✅ Test user created (user@adm.com / user123)');

  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
