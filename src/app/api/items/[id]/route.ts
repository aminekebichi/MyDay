import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSession } from "@/lib/session";
import { updateItemSchema } from "@/lib/validation";
import { z } from "zod";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const user = await validateSession(request);
        const body = await request.json();

        // For Next.js App Router dynamic routes, params is a promise in Next 15+
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: "Item ID is required", code: "BAD_REQUEST" }, { status: 400 });
        }

        const parsedData = updateItemSchema.parse(body);

        // Verify ownership before updating
        const existingItem = await prisma.item.findUnique({
            where: { id }
        });

        if (!existingItem) {
            return NextResponse.json({ error: "Item not found", code: "NOT_FOUND" }, { status: 404 });
        }

        if (existingItem.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        const item = await prisma.item.update({
            where: { id },
            data: parsedData,
        });

        return NextResponse.json(item);
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", code: "VALIDATION_ERROR", details: error.flatten().fieldErrors }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error", code: "INTERNAL_ERROR" }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const user = await validateSession(request);

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: "Item ID is required", code: "BAD_REQUEST" }, { status: 400 });
        }

        // Verify ownership before deleting
        const existingItem = await prisma.item.findUnique({
            where: { id }
        });

        if (!existingItem) {
            return NextResponse.json({ error: "Item not found", code: "NOT_FOUND" }, { status: 404 });
        }

        if (existingItem.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
        }

        await prisma.item.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }
        return NextResponse.json({ error: "Internal Server Error", code: "INTERNAL_ERROR" }, { status: 500 });
    }
}
