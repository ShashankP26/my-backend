import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const Groups = await prisma.group.findMany({
    orderBy: { id: 'asc' }
  });

  console.log(`Found ${Groups.length} Groups`);

  // --- Phase 1: move everything to temporary IDs ---
  for (let i = 0; i < Groups.length; i++) {
    const Group = Groups[i];
    const tempId = 1000 + i; // pick a safe high number, no collision
    console.log(`Temporarily moving ${Group.name}: ${Group.id} → ${tempId}`);

    await prisma.group.update({
      where: { id: Group.id },
      data: { id: tempId },
    });
  }

  // --- Phase 2: assign powers of 2 ---
  const tempGroups = await prisma.group.findMany({
    orderBy: { id: 'asc' }
  });

  for (let i = 0; i < tempGroups.length; i++) {
    const Group = tempGroups[i];
    const newId = 2 ** i;

    console.log(`Finalizing ${Group.name}: ${Group.id} → ${newId}`);

    await prisma.group.update({
      where: { id: Group.id },
      data: { id: newId },
    });
  }

  console.log("✅ Migration complete");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });