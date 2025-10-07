import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1️⃣ Create permissions
  const permissionsData: Prisma.PermissionUncheckedCreateInput[] = [
    { name: 'user:create' },
    { name: 'user:read' },
    { name: 'user:update' },
    { name: 'user:delete' },
    { name: 'admin:access' },
  ];

  await prisma.permission.createMany({
    data: permissionsData,
    skipDuplicates: true,
  });

  // 2️⃣ Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' } as Prisma.RoleUncheckedCreateInput,
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user' } as Prisma.RoleUncheckedCreateInput,
  });

  // 3️⃣ Attach all permissions to admin
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // 4️⃣ Attach default permission to user role
  const userPerms = await prisma.permission.findMany({
    where: { name: { in: ['user:read'] } },
  });

  for (const perm of userPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: userRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: userRole.id, permissionId: perm.id },
    });
  }

  // 5️⃣ Create super-admin user
  const hashedPassword = await bcrypt.hash('superadmin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password: hashedPassword,
      groups: 1,
      info: 'Super admin user with full access',
    } as Prisma.UserUncheckedCreateInput,
  });

  // 6️⃣ Attach admin role to super-admin
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: adminRole.id } },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });