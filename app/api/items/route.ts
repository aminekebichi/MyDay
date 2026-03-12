import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { validateSession } from '../../../lib/session';
import { CreateItemSchema } from '../../../lib/schemas';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
    const user = await validateSession(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    const adminRequestedUserId = searchParams.get('userId');

    let targetUserId = user.id;

    if (user.role === 'ADMIN' && adminRequestedUserId) {
        targetUserId = adminRequestedUserId;
    }

    let whereClause: any = { userId: targetUserId };

    if (dateStr) {
        const date = new Date(dateStr);
        whereClause.date = {
            gte: startOfDay(date),
            lte: endOfDay(date),
        };
    }

    try {
        const items = await prisma.item.findMany({
            where: whereClause,
            orderBy: [{ priority: 'desc' }, { startTime: 'asc' }],
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error("GET /api/items error:", error);
        return NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const user = await validateSession(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const result = CreateItemSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid payload', code: 'VALIDATION_ERROR', details: result.error.flatten() }, { status: 400 });
        }

        const itemData = result.data;
        let targetUserId = user.id;

        // If an Admin wants to create an item for another user, they can pass userId in the body.
        // We assume CreateItemSchema will allow an optional userId field, or we bypass it explicitly.
        // To keep it simple, we just check the raw body here before schema parsing, or rely on the body's userId.
        if (user.role === 'ADMIN' && body.userId) {
            targetUserId = body.userId;
        }

        const newItem = await prisma.item.create({
            data: {
                userId: targetUserId,
                title: itemData.title,
                type: itemData.type,
                priority: itemData.priority,
                date: new Date(itemData.date),
                startTime: itemData.startTime ? new Date(itemData.startTime) : null,
                endTime: itemData.endTime ? new Date(itemData.endTime) : null,
                recurrence: itemData.recurrence,
                recurrenceEndDate: itemData.recurrenceEndDate ? new Date(itemData.recurrenceEndDate) : null,
                notes: itemData.notes,
                attendeeName: itemData.attendeeName,
                joinUrl: itemData.joinUrl,
                location: itemData.location,
            }
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error("POST /api/items error:", error);
        return NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
