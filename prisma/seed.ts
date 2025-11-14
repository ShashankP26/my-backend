// // prisma/seed.ts
// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('Seeding database (bitmask groups + permissions)...');

//   // 1️⃣ create permissions (skip duplicates)
//   const perms = [
//     'user:create',
//     'user:read',
//     'user:update',
//     'user:delete',
//     'admin:access',
//     'reports:view',
//   ];

//   for (const name of perms) {
//     await prisma.groupPermission.upsert({
//       where: { name },
//       update: {},
//       create: { name },
//     });
//   }

//   // 2️⃣ ensure some normal groups exist (user + manager as examples)
//   const normalCountBefore = await prisma.group.count({ where: { NOT: { name: 'admin' } } });

//   const userGroup = await prisma.group.upsert({
//     where: { name: 'user' },
//     update: {},
//     create: { name: 'user', un: 2 ** normalCountBefore },
//   });

//   const managerGroup = await prisma.group.upsert({
//     where: { name: 'manager' },
//     update: {},
//     create: { name: 'manager', un: 2 ** (normalCountBefore + 1) },
//   });

//   // 3️⃣ admin group: full mask for existing normal groups
//   const totalNormal = await prisma.group.count({ where: { NOT: { name: 'admin' } } });
//   const adminUn = (2 ** totalNormal) - 1;

//   const adminGroup = await prisma.group.upsert({
//     where: { name: 'admin' },
//     update: {},
//     create: { name: 'admin', un: adminUn, super_un: -1 },
//   });

//   // 4️⃣ attach all permissions to admin (GroupJunction)
//   const allPerms = await prisma.groupPermission.findMany();
//   for (const p of allPerms) {
//     await prisma.groupJunction.upsert({
//       where: { groupId_permissionId: { groupId: adminGroup.id, permissionId: p.id } },
//       update: {},
//       create: { groupId: adminGroup.id, permissionId: p.id },
//     });
//   }

//   // 5️⃣ give read permission to user and manager
//   const readPerm = await prisma.groupPermission.findUnique({ where: { name: 'user:read' } });
//   if (readPerm) {
//     for (const g of [userGroup, managerGroup]) {
//       await prisma.groupJunction.upsert({
//         where: { groupId_permissionId: { groupId: g.id, permissionId: readPerm.id } },
//         update: {},
//         create: { groupId: g.id, permissionId: readPerm.id },
//       });
//     }
//   }

//   // 6️⃣ create superadmin user and assign admin group
//   const pw = await bcrypt.hash('superadmin123', 10);
//   const superAdmin = await prisma.user.upsert({
//     where: { username: 'superadmin' },
//     update: {},
//     create: {
//       username: 'superadmin',
//       password: pw,
//       info: 'Super admin user',
//     },
//   });

//   await prisma.userGroup.upsert({
//     where: { userId_groupId: { userId: superAdmin.id, groupId: adminGroup.id } },
//     update: {},
//     create: { userId: superAdmin.id, groupId: adminGroup.id },
//   });

//   console.log('✅ Seeding complete.');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });