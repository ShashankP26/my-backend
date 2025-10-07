import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany({
    orderBy: { id: 'asc' }
  });

  console.log(`Found ${roles.length} roles`);

  // --- Phase 1: move everything to temporary IDs ---
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    const tempId = 1000 + i; // pick a safe high number, no collision
    console.log(`Temporarily moving ${role.name}: ${role.id} → ${tempId}`);

    await prisma.role.update({
      where: { id: role.id },
      data: { id: tempId },
    });
  }

  // --- Phase 2: assign powers of 2 ---
  const tempRoles = await prisma.role.findMany({
    orderBy: { id: 'asc' }
  });

  for (let i = 0; i < tempRoles.length; i++) {
    const role = tempRoles[i];
    const newId = 2 ** i;

    console.log(`Finalizing ${role.name}: ${role.id} → ${newId}`);

    await prisma.role.update({
      where: { id: role.id },
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