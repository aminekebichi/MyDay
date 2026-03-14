import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function d(date, time) {
  return time
    ? new Date(`${date}T${time}:00.000Z`)
    : new Date(`${date}T00:00:00.000Z`);
}

// Verify we won't exceed 3 items/user/day before inserting
async function countForDay(userId, date) {
  return prisma.item.count({
    where: { userId, date: { gte: d(date), lt: d(date, '23:59') } },
  });
}

const additions = [
  // ── Friday Mar 13 — 1 EVENT per user (each already has 2 items today) ──
  {
    userId: 'usr_amine_123',
    title: 'Team happy hour',
    type: 'EVENT', priority: 'ROUTINE',
    date: d('2026-03-13'),
    startTime: d('2026-03-13', '17:30'), endTime: d('2026-03-13', '19:00'),
    location: 'The Anchor Bar, downtown',
    notes: 'End-of-sprint Friday tradition — whole eng team invited',
  },
  {
    userId: 'usr_sarah_123',
    title: 'Evening yoga class',
    type: 'EVENT', priority: 'ROUTINE',
    date: d('2026-03-13'),
    startTime: d('2026-03-13', '18:00'), endTime: d('2026-03-13', '19:00'),
    location: 'Studio Flow, 3rd Ave',
  },
  {
    userId: 'usr_bob_123',
    title: 'Dinner with college friends',
    type: 'EVENT', priority: 'ROUTINE',
    date: d('2026-03-13'),
    startTime: d('2026-03-13', '19:00'), endTime: d('2026-03-13', '21:00'),
    location: 'Osteria Roma',
    attendeeName: 'Marcus, Leila, Dev',
  },
  {
    userId: 'usr_admin_123',
    title: 'Leadership dinner',
    type: 'EVENT', priority: 'IMPORTANT',
    date: d('2026-03-13'),
    startTime: d('2026-03-13', '19:00'), endTime: d('2026-03-13', '21:00'),
    location: 'The Capital Grille',
    attendeeName: 'CTO, VP Product, CFO',
    notes: 'Informal Q2 alignment dinner — no agenda, but come prepared',
  },

  // ── Saturday Mar 14 — 2 items per user ──
  {
    userId: 'usr_amine_123',
    title: 'Morning run — Riverside Trail',
    type: 'EVENT', priority: 'ROUTINE',
    date: d('2026-03-14'),
    startTime: d('2026-03-14', '08:00'), endTime: d('2026-03-14', '09:00'),
    location: 'Riverside Trail',
  },
  {
    userId: 'usr_amine_123',
    title: 'Review architecture notes for Monday',
    type: 'TASK', priority: 'ROUTINE',
    date: d('2026-03-14'),
    notes: 'Light review of SWR vs polling notes before the sync with Jordan',
  },
  {
    userId: 'usr_sarah_123',
    title: 'Pottery class',
    type: 'EVENT', priority: 'ROUTINE',
    date: d('2026-03-14'),
    startTime: d('2026-03-14', '10:00'), endTime: d('2026-03-14', '12:00'),
    location: 'Clay & Co Studio',
  },
  {
    userId: 'usr_sarah_123',
    title: 'Sketch personal project ideas',
    type: 'TASK', priority: 'ROUTINE',
    date: d('2026-03-14'),
    notes: 'Side project: minimal journaling app — rough wireframes only',
  },
  {
    userId: 'usr_bob_123',
    title: 'Rock climbing — indoor gym',
    type: 'EVENT', priority: 'ROUTINE',
    date: d('2026-03-14'),
    startTime: d('2026-03-14', '10:00'), endTime: d('2026-03-14', '12:00'),
    location: 'Summit Climbing Gym',
    attendeeName: 'Marcus',
  },
  {
    userId: 'usr_bob_123',
    title: 'Read incident post-mortem template',
    type: 'TASK', priority: 'ROUTINE',
    date: d('2026-03-14'),
    notes: 'Prep for Thursday meeting — review Atlassian PIR template',
  },
  {
    userId: 'usr_admin_123',
    title: 'Family brunch',
    type: 'EVENT', priority: 'ROUTINE',
    date: d('2026-03-14'),
    startTime: d('2026-03-14', '11:00'), endTime: d('2026-03-14', '13:00'),
    location: 'Home',
  },
  {
    userId: 'usr_admin_123',
    title: 'Review OKR draft before Monday sync',
    type: 'TASK', priority: 'ROUTINE',
    date: d('2026-03-14'),
    notes: 'Light pass on Q2 OKR doc — no need to finalize, just flag gaps',
  },
];

// Validate counts per user per day won't exceed 3
const checks = new Map();
for (const item of additions) {
  const key = `${item.userId}::${item.date.toISOString().slice(0, 10)}`;
  checks.set(key, (checks.get(key) ?? 0) + 1);
}
for (const [key, newCount] of checks) {
  const [userId, date] = key.split('::');
  const existing = await countForDay(userId, date);
  if (existing + newCount > 3) {
    console.error(`VIOLATION: ${key} would have ${existing + newCount} items`);
    process.exit(1);
  }
}

const result = await prisma.item.createMany({ data: additions });
console.log(`Added ${result.count} items across Fri Mar 13 and Sat Mar 14.`);
await prisma.$disconnect();
