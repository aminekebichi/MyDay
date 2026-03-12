import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { validateSession } from '../../../../lib/session';
import { UpdateItemSchema } from '../../../../lib/schemas';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await validateSession(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const result = UpdateItemSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid payload', code: 'VALIDATION_ERROR', details: result.error.flatten() }, { status: 400 });
        }

        const { id } = params;

        const existing = await prisma.item.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Item not found', code: 'NOT_FOUND' }, { status: 404 });
        }

        // Allow if user is owner OR user is an ADMIN
        if (existing.userId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        const {
            startTime, endTime, recurrenceEndDate, completedAt, date, ...rest
        } = result.data as any;

        const updateData: any = { ...rest };
        if (date) updateData.date = new Date(date);
        if (startTime !== undefined) updateData.startTime = startTime ? new Date(startTime) : null;
        if (endTime !== undefined) updateData.endTime = endTime ? new Date(endTime) : null;
        if (recurrenceEndDate !== undefined) updateData.recurrenceEndDate = recurrenceEndDate ? new Date(recurrenceEndDate) : null;
        if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null;

        const updatedItem = await prisma.item.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error("PATCH /api/items/[id] error:", error);
        return NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await validateSession(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    try {
        const { id } = params;

        const existing = await prisma.item.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Item not found', code: 'NOT_FOUND' }, { status: 404 });
        }

        // Allow if user is owner OR user is an ADMIN
        if (existing.userId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        await prisma.item.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/items/[id] error:", error);
        return NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
