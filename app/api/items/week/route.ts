import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { validateSession } from '../../../../lib/session';
import { expandRecurringItems } from '../../../../lib/recurrence';
import { startOfDay, endOfDay, parseISO, addDays } from 'date-fns';

export async function GET(req: NextRequest) {
    const user = await validateSession(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get('start');

    if (!startParam) {
        return NextResponse.json({ error: 'Missing start parameter', code: 'BAD_REQUEST' }, { status: 400 });
    }

    try {
        const adminRequestedUserId = searchParams.get('userId');
        const isGlobal = searchParams.get('global') === 'true' && user.role === 'ADMIN';
        let targetUserId = user.id;

        if (user.role === 'ADMIN' && adminRequestedUserId && adminRequestedUserId !== 'all') {
            targetUserId = adminRequestedUserId;
        }

        const windowStart = startOfDay(parseISO(startParam));
        const daysParam = parseInt(searchParams.get('days') ?? '7', 10);
        const windowEnd = endOfDay(addDays(windowStart, Math.max(7, daysParam)));

        // Base where clause
        const whereClause: any = {
            OR: [
                {
                    recurrence: 'NONE',
                    date: {
                        gte: windowStart,
                        lte: windowEnd
                    }
                },
                {
                    recurrence: { not: 'NONE' },
                    date: { lte: windowEnd },
                }
            ]
        };

        if (!isGlobal) {
            whereClause.userId = targetUserId;
        }

        const items = await prisma.item.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        displayName: true,
                        username: true
                    }
                }
            },
            orderBy: [{ priority: 'desc' }, { startTime: 'asc' }],
        });

        const expandedItems = expandRecurringItems(items, windowStart, windowEnd);

        return NextResponse.json(expandedItems);
    } catch (error) {
        console.error("GET /api/items/week error:", error);
        return NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
