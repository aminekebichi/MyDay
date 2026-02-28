import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSession } from "@/lib/session";
import { createItemSchema } from "@/lib/validation";
import { startOfDay, endOfDay } from "date-fns";
import { z } from "zod";

export async function GET(request: Request) {
    try {
        const user = await validateSession(request);

        const { searchParams } = new URL(request.url);
        const dateQuery = searchParams.get("date");

        if (!dateQuery) {
            return NextResponse.json({ error: "Missing date parameter", code: "BAD_REQUEST" }, { status: 400 });
        }

        const targetDate = new Date(dateQuery);

        if (isNaN(targetDate.getTime())) {
            return NextResponse.json({ error: "Invalid date format", code: "BAD_REQUEST" }, { status: 400 });
        }

        // Adjust date boundaries to accommodate potential timezone shifts when SQLite stores UTC dates.
        const startOfTargetDay = new Date(targetDate);
        startOfTargetDay.setUTCHours(0, 0, 0, 0);
        const queryStart = new Date(startOfTargetDay.getTime() - 24 * 60 * 60 * 1000);

        const endOfTargetDay = new Date(targetDate);
        endOfTargetDay.setUTCHours(23, 59, 59, 999);
        const queryEnd = new Date(endOfTargetDay.getTime() + 24 * 60 * 60 * 1000);

        const items = await prisma.item.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: queryStart,
                    lte: queryEnd,
                },
            },
            orderBy: [
                { priority: 'desc' },
                { time: 'asc' },
            ],
        });

        // Filter in memory for MVP to avoid SQLite Date quirks
        // Target date from query (e.g. 2026-02-28)
        const targetYear = targetDate.getUTCFullYear();
        const targetMonth = targetDate.getUTCMonth();
        const targetDay = targetDate.getUTCDate();

        const filteredItems = items.filter((item: any) => {
            const itemDate = new Date(item.date);
            return itemDate.getUTCFullYear() === targetYear &&
                itemDate.getUTCMonth() === targetMonth &&
                itemDate.getUTCDate() === targetDay;
        });

        return NextResponse.json(filteredItems);
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }
        return NextResponse.json({ error: "Internal Server Error", code: "INTERNAL_ERROR" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await validateSession(request);
        const body = await request.json();

        const parsedData = createItemSchema.parse(body);

        const item = await prisma.item.create({
            data: {
                ...parsedData,
                userId: user.id,
            }
        });

        return NextResponse.json(item, { status: 201 });
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
