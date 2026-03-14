import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const users = await prisma.user.findMany({ select: { id: true, displayName: true } });
for (const user of users) {
  const items = await prisma.item.findMany({
    where: { userId: user.id },
    orderBy: { date: 'asc' },
    select: { title: true, type: true, priority: true, date: true, completedAt: true },
  });
  console.log(`\n── ${user.displayName} (${items.length} items) ─────────────`);
  for (const item of items) {
    const done = item.completedAt ? '✓' : ' ';
    const d = item.date.toISOString().slice(0, 10);
    console.log(`  [${done}] ${d}  ${item.type.padEnd(11)} ${item.priority.padEnd(10)} ${item.title}`);
  }
}

await prisma.$disconnect();
