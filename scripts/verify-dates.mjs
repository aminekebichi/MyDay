import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, addDays, startOfWeek, format } from 'date-fns';

const prisma = new PrismaClient();
const today = startOfDay(new Date());
const weekStart = startOfWeek(today, { weekStartsOn: 1 });

console.log('Local today:', format(today, 'yyyy-MM-dd'), '|', today.toISOString());
console.log('weekStart:  ', format(weekStart, 'yyyy-MM-dd'), '|', weekStart.toISOString());

const items = await prisma.item.findMany({
  where: {
    userId: 'usr_amine_123',
    date: { gte: startOfDay(weekStart), lte: endOfDay(addDays(weekStart, 14)) }
  },
  orderBy: { date: 'asc' },
  select: { title: true, date: true }
});

console.log(`\nAPI query returns ${items.length} items for Amine:`);
for (const item of items) {
  const localKey = format(startOfDay(new Date(item.date)), 'yyyy-MM-dd');
  console.log(` stored: ${item.date.toISOString()}  local key: ${localKey}  ${item.title.slice(0, 45)}`);
}

await prisma.$disconnect();
