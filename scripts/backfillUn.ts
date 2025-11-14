import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔁 Backfill: assigning `un` values to roles...');

  // Exclude admin for now
  const normalRoles = await prisma.role.findMany({
    where: { name: { not: 'admin' } },
    orderBy: { id: 'asc' },
  });

  for (let i = 0; i < normalRoles.length; i++) {
    const role = normalRoles[i];
    const unValue = 2 ** i;

    await prisma.role.update({
      where: { id: role.id },
      data: { un: unValue },
    });

    console.log(`✅ Updated ${role.name} → un = ${unValue}`);
  }

  // Now handle admin
  const admin = await prisma.role.findUnique({ where: { name: 'admin' } });
  if (admin) {
    const adminMask = (2 ** normalRoles.length) - 1;

    await prisma.role.update({
      where: { id: admin.id },
      data: { un: adminMask },
    });

    console.log(`👑 Updated admin → un = ${adminMask}`);
  } else {
    console.log('⚠️ No admin role found, skipping...');
  }

  console.log('🎉 Backfill complete!');
}

main()
  .catch((err) => {
    console.error('❌ Error during backfill:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
