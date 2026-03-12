// Seed script — wipes the DB and populates with Agile sprint mock data
// modelled on the MyDay GitHub issues (#1–#15).
// Run: npx prisma db seed

const { PrismaClient } = require('@prisma/client');
const { addDays, startOfDay } = require('date-fns');

const prisma = new PrismaClient();

// Build a Date for `baseDate` with the given hours/minutes
function at(baseDate, hh, mm = 0) {
    const d = new Date(baseDate);
    d.setHours(hh, mm, 0, 0);
    return d;
}

async function main() {
    // ── Wipe ──────────────────────────────────────────────────────────────────
    console.log('Cleaning database...');
    await prisma.item.deleteMany();
    await prisma.user.deleteMany();

    // ── User ──────────────────────────────────────────────────────────────────
    console.log('Creating users...');
    const admin = await prisma.user.create({
        data: {
            id: 'admin_123',
            displayName: 'Administrator',
            username: 'admin',
            passwordHash: '$2b$10$631QaaXdrX4ewsy6vnCC7.o1v/EzrHEjc6iyx9RVDLorqshnFprJe', // "admin"
            role: 'ADMIN',
            theme: 'dark',
            lastOpenedAt: new Date(),
        },
    });

    const user = await prisma.user.create({
        data: {
            id: 'usr_test_123',
            displayName: 'Amine',
            username: 'amine',
            passwordHash: '$2b$10$631QaaXdrX4ewsy6vnCC7.o1v/EzrHEjc6iyx9RVDLorqshnFprJe', // "admin" (simple password for test user too)
            role: 'USER',
            theme: 'dark',
            lastOpenedAt: new Date(),
        },
    });

    const user3 = await prisma.user.create({
        data: {
            id: 'usr_sarah_123',
            displayName: 'Sarah',
            username: 'sarah',
            passwordHash: '$2b$10$kpBfd01EdKl8Joj1fDWEwe8cK0pKaVKGtPknddo2W8g.8yDYxmOTu', // "sarah"
            role: 'USER',
            theme: 'dark',
            lastOpenedAt: new Date(),
        },
    });

    const user4 = await prisma.user.create({
        data: {
            id: 'usr_bob_123',
            displayName: 'Bob',
            username: 'bob',
            passwordHash: '$2b$10$qhA.TRHZXjy0au1nKbwIpuSeucDrkh1sZj8pXjYpbIuakknCGI7DW', // "bob"
            role: 'USER',
            theme: 'light',
            lastOpenedAt: new Date(),
        },
    });

    // Date anchors — all relative to today so the seed stays fresh
    const today   = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);

    console.log('Seeding items for all users...');
    
    // Items for Amine (Existing sprint data)
    await prisma.item.createMany({
        data: [
            {
                userId: user.id,
                title: 'Sprint 2 Demo & Review',
                type: 'MEETING',
                priority: 'CRITICAL',
                date: today,
                startTime: at(today, 14),
                endTime: at(today, 15, 30),
                attendeeName: 'Full Team',
                notes: 'Demo: calendar strip (#6), Todo list (#7), Add Item sheet (#8).',
            },
            {
                userId: user.id,
                title: 'Finish API Documentation',
                type: 'TASK',
                priority: 'IMPORTANT',
                date: addDays(today, 2),
            }
        ]
    });

    // Items for Sarah
    await prisma.item.createMany({
        data: [
            {
                userId: user3.id,
                title: 'Biology 101 Final Exam',
                type: 'DEADLINE',
                priority: 'CRITICAL',
                date: addDays(today, 5),
                notes: 'Review chapters 1-12. Bring Scantron.',
            },
            {
                userId: user3.id,
                title: 'Study Group Meeting',
                type: 'MEETING',
                priority: 'IMPORTANT',
                date: addDays(today, 1),
                startTime: at(addDays(today, 1), 16),
                endTime: at(addDays(today, 1), 18),
                location: 'Library Room 4',
                attendeeName: 'Biology Group',
            },
            {
                userId: user3.id,
                title: 'Grocery Shopping',
                type: 'TASK',
                priority: 'ROUTINE',
                date: today,
            }
        ]
    });

    // Items for Bob
    await prisma.item.createMany({
        data: [
            {
                userId: user4.id,
                title: 'Client Project Kickoff',
                type: 'MEETING',
                priority: 'CRITICAL',
                date: addDays(today, 1),
                startTime: at(addDays(today, 1), 9),
                endTime: at(addDays(today, 1), 10, 30),
                attendeeName: 'Acme Corp',
                joinUrl: 'https://zoom.us/j/123456789',
            },
            {
                userId: user4.id,
                title: 'Morning Yoga',
                type: 'EVENT',
                priority: 'ROUTINE',
                date: today,
                startTime: at(today, 7),
                endTime: at(today, 8),
                recurrence: 'DAILY',
            },
            {
                userId: user4.id,
                title: 'Fix Production Bug #402',
                type: 'TASK',
                priority: 'CRITICAL',
                date: today,
                notes: 'Memory leak in the worker process.',
            }
        ]
    });


    const count = await prisma.item.count();
    console.log(`✓ Seeded ${count} items for user: ${user.username} with role ${user.role} and admin: ${admin.username} with role ${admin.role}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
