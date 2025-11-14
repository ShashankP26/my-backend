import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with bitmask roles (un)...');

  // 1️⃣ Create permissions
  const permissionsData: { name: string }[] = [
    { name: 'user:create' },
    { name: 'user:read' },
    { name: 'user:update' },
    { name: 'user:delete' },
    { name: 'admin:access' },
    { name: 'reports:view' },
  ];

  await prisma.permission.createMany({
    data: permissionsData,
    skipDuplicates: true,
  });

  // 2️⃣ Count existing roles (for bitmask assignment)
  const existingRolesCount = await prisma.role.count({
    where: { name: { not: 'admin' } },
  });

  // 3️⃣ Create user role (2^n)
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      un: 2 ** existingRolesCount, // 2^0 = 1
    },
  });

  // 4️⃣ Create manager role (next bit)
  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      un: 2 ** (existingRolesCount + 1), // 2^1 = 2
    },
  });

  // 5️⃣ Create admin (bitmask: all bits set for existing roles)
  const totalNormalRoles = await prisma.role.count({
    where: { name: { not: 'admin' } },
  });
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      un: (2 ** totalNormalRoles) - 1, // e.g. if 2 roles exist, admin = 3
    },
  });

  // 6️⃣ Attach all permissions to admin
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // 7️⃣ Attach read-only to user and manager
  const readPerm = await prisma.permission.findUnique({ where: { name: 'user:read' } });
  if (readPerm) {
    for (const r of [userRole, managerRole]) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: r.id, permissionId: readPerm.id } },
        update: {},
        create: { roleId: r.id, permissionId: readPerm.id },
      });
    }
  }

  // 8️⃣ Create superadmin user
  const hashedPassword = await bcrypt.hash('superadmin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password: hashedPassword,
      groups: 1,
      info: 'Super admin user with full access',
    },
  });

  // 9️⃣ Assign admin role to superadmin
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: adminRole.id } },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Database seeded with bitmask roles successfully!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });