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
        const windowStart = startOfDay(parseISO(startParam));
        const windowEnd = endOfDay(addDays(windowStart, 6));

        const items = await prisma.item.findMany({
            where: {
                userId: user.id,
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
                        date: { lte: windowEnd }, // Must have started on or before the end of the window
                    } // We could also filter out items where recurrenceEndDate < windowStart, but expandRecurringItems will filter them out anyway
                ]
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
