import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔁 Backfill: assigning `un` values to Groups...');

  // Exclude admin for now
  const normalGroups = await prisma.group.findMany({
    where: { name: { not: 'admin' } },
    orderBy: { id: 'asc' },
  });

  for (let i = 0; i < normalGroups.length; i++) {
    const Group = normalGroups[i];
    const unValue = 2 ** i;

    await prisma.group.update({
      where: { id: Group.id },
      data: { un: unValue },
    });

    console.log(`✅ Updated ${Group.name} → un = ${unValue}`);
  }

  // Now handle admin
  const admin = await prisma.group.findUnique({ where: { name: 'admin' } });
  if (admin) {
    const adminMask = (2 ** normalGroups.length) - 1;

    await prisma.group.update({
      where: { id: admin.id },
      data: { un: adminMask },
    });

    console.log(`👑 Updated admin → un = ${adminMask}`);
  } else {
    console.log('⚠️ No admin Group found, skipping...');
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
