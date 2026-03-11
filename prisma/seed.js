const { PrismaClient } = require('@prisma/client')
const { addDays, startOfDay, subDays } = require('date-fns')
const { randomUUID } = require('crypto')

const prisma = new PrismaClient()

async function main() {
    console.log("Cleaning database...")
    await prisma.item.deleteMany()
    await prisma.user.deleteMany()

    console.log("Creating test user...")
    const user = await prisma.user.create({
        data: {
            id: 'usr_test_123',
            displayName: 'Alex',
            sessionToken: 'usr_test_123',
            theme: 'dark'
        }
    })

    console.log("Generating sample items...")
    const today = startOfDay(new Date())

    const items = [
        // Today: CRITICAL Task
        {
            userId: user.id,
            title: 'Finish API Design Doc',
            type: 'TASK',
            priority: 'CRITICAL',
            date: today,
        },
        // Today: IMPORTANT Meeting
        {
            userId: user.id,
            title: 'Product Sync with Design',
            type: 'MEETING',
            priority: 'IMPORTANT',
            date: today,
            startTime: new Date(today.setHours(14, 0, 0, 0)),
            endTime: new Date(today.setHours(15, 0, 0, 0)),
            attendeeName: 'Sarah Jenkins',
            joinUrl: 'https://zoom.us/j/123456789'
        },
        // Today: ROUTINE Event
        {
            userId: user.id,
            title: 'Weekly Team Dinner',
            type: 'EVENT',
            priority: 'ROUTINE',
            date: today,
            location: 'Downtown Cafe'
        },
        // Tomorrow: CRITICAL Deadline
        {
            userId: user.id,
            title: 'Submit Q3 Taxes',
            type: 'DEADLINE',
            priority: 'CRITICAL',
            date: addDays(today, 1),
        },
        // Tomorrow: IMPORTANT Assignment
        {
            userId: user.id,
            title: 'Read CS 401 Chapters 3-5',
            type: 'ASSIGNMENT',
            priority: 'IMPORTANT',
            date: addDays(today, 1),
        },
        // Two days ago: Completed Task (Hatched style on calendar)
        {
            userId: user.id,
            title: 'Ship the MVP V1',
            type: 'TASK',
            priority: 'IMPORTANT',
            date: subDays(today, 2),
            completedAt: subDays(today, 2)
        },
        // Two days from now: Heavy day (testing +N more chip)
        {
            userId: user.id, title: 'Buy Groceries', type: 'TASK', priority: 'ROUTINE', date: addDays(today, 2)
        },
        {
            userId: user.id, title: 'Coffee with David', type: 'EVENT', priority: 'ROUTINE', date: addDays(today, 2)
        },
        {
            userId: user.id, title: 'Physics Problem Set', type: 'ASSIGNMENT', priority: 'ROUTINE', date: addDays(today, 2)
        },
        {
            userId: user.id, title: 'Sign Lease Agreement', type: 'DEADLINE', priority: 'ROUTINE', date: addDays(today, 2)
        },
        {
            userId: user.id, title: 'Project Kickoff Call', type: 'MEETING', priority: 'ROUTINE', date: addDays(today, 2)
        }
    ]

    for (const item of items) {
        await prisma.item.create({ data: item })
    }

    console.log('✅ Seed complete!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
