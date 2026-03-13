import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { validateSession } from "../../../../lib/session";
import { UpdateItemSchema } from "../../../../lib/schemas";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await validateSession(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const result = UpdateItemSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid payload", code: "VALIDATION_ERROR", details: result.error.flatten() }, { status: 400 });
        }

        const id = params.id;
        const item = await prisma.item.findUnique({ where: { id } });

        if (!item) {
            return NextResponse.json({ error: "Item not found", code: "NOT_FOUND" }, { status: 404 });
        }

        // Authorization: Owner or Admin
        if (item.userId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        const updatedItem = await prisma.item.update({
            where: { id },
            data: {
                ...result.data,
                date: result.data.date ? new Date(result.data.date) : undefined,
                startTime: result.data.startTime ? new Date(result.data.startTime) : (result.data.startTime === null ? null : undefined),
                endTime: result.data.endTime ? new Date(result.data.endTime) : (result.data.endTime === null ? null : undefined),
                recurrenceEndDate: result.data.recurrenceEndDate ? new Date(result.data.recurrenceEndDate) : (result.data.recurrenceEndDate === null ? null : undefined),
                completedAt: result.data.completedAt ? new Date(result.data.completedAt) : (result.data.completedAt === null ? null : undefined),
            },
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error("PATCH /api/items/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error", code: "INTERNAL_ERROR" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await validateSession(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    try {
        const id = params.id;
        const item = await prisma.item.findUnique({ where: { id } });

        if (!item) {
            return NextResponse.json({ error: "Item not found", code: "NOT_FOUND" }, { status: 404 });
        }

        // Authorization: Owner or Admin
        if (item.userId !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        await prisma.item.delete({ where: { id } });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("DELETE /api/items/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error", code: "INTERNAL_ERROR" }, { status: 500 });
    }
}
