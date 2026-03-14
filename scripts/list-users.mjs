import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany({ select: { id: true, displayName: true, username: true } });
console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
