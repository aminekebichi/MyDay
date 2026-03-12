const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { addDays, startOfDay } = require('date-fns');

async function main() {
    console.log('Cleaning database...');
    await prisma.item.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Creating users...');
    const adminHash = bcrypt.hashSync('admin', 10);
    const sarahHash = bcrypt.hashSync('sarah', 10);
    const bobHash = bcrypt.hashSync('bob', 10);

    const amine = await prisma.user.create({
        data: {
            id: 'usr_amine_123',
            displayName: 'Amine',
            username: 'amine',
            passwordHash: adminHash,
            role: 'USER',
        }
    });

    const sarah = await prisma.user.create({
        data: {
            id: 'usr_sarah_123',
            displayName: 'Sarah',
            username: 'sarah',
            passwordHash: sarahHash,
            role: 'USER',
        }
    });

    const bob = await prisma.user.create({
        data: {
            id: 'usr_bob_123',
            displayName: 'Bob',
            username: 'bob',
            passwordHash: bobHash,
            role: 'USER',
        }
    });

    const admin = await prisma.user.create({
        data: {
            id: 'usr_admin_123',
            displayName: 'Administrator',
            username: 'admin',
            passwordHash: adminHash,
            role: 'ADMIN',
        }
    });

    console.log('Seeding items...');
    const today = startOfDay(new Date());

    // Seeding items for Amine
    await prisma.item.createMany({
        data: [
            { userId: amine.id, title: 'Morning Yoga', type: 'EVENT', priority: 'ROUTINE', date: today, startTime: new Date(today.getTime() + 8 * 3600000) },
            { userId: amine.id, title: 'Grocery Shopping', type: 'TASK', priority: 'IMPORTANT', date: today },
            { userId: amine.id, title: 'Physics Research Paper', type: 'DEADLINE', priority: 'CRITICAL', date: addDays(today, 2) },
        ]
    });

    // Seeding items for Sarah
    await prisma.item.createMany({
        data: [
            { userId: sarah.id, title: 'Fix Pod Bug 402', type: 'TASK', priority: 'CRITICAL', date: today },
            { userId: sarah.id, title: 'Sprint 2 Demo Review', type: 'MEETING', priority: 'IMPORTANT', date: today, startTime: new Date(today.getTime() + 14 * 3600000), attendeeName: 'Engineering Team' },
        ]
    });

    // Seeding items for Bob
    await prisma.item.createMany({
        data: [
            { userId: bob.id, title: 'Weekly 1:1', type: 'MEETING', priority: 'IMPORTANT', date: today, startTime: new Date(today.getTime() + 10 * 3600000), attendeeName: 'Manager' },
            { userId: bob.id, title: 'Update Dashboard Styles', type: 'TASK', priority: 'ROUTINE', date: addDays(today, 1) },
        ]
    });

    console.log('✓ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
