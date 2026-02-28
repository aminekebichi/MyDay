import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateSession } from "@/lib/session";
import { addDays } from "date-fns";
import { z } from "zod";

export async function GET(request: Request) {
    try {
        const user = await validateSession(request);

        const { searchParams } = new URL(request.url);
        const startQuery = searchParams.get("start");

        if (!startQuery) {
            return NextResponse.json({ error: "Missing start parameter", code: "BAD_REQUEST" }, { status: 400 });
        }

        const startDate = new Date(startQuery);

        if (isNaN(startDate.getTime())) {
            return NextResponse.json({ error: "Invalid start date format", code: "BAD_REQUEST" }, { status: 400 });
        }

        const endDate = addDays(startDate, 6); // 7-day window

        // Adjust date boundaries to accommodate potential timezone shifts when SQLite stores UTC dates.
        const startOfTargetWeek = new Date(startDate);
        startOfTargetWeek.setUTCHours(0, 0, 0, 0);
        const queryStart = new Date(startOfTargetWeek.getTime() - 24 * 60 * 60 * 1000);

        const endOfTargetWeek = new Date(endDate);
        endOfTargetWeek.setUTCHours(23, 59, 59, 999);
        const queryEnd = new Date(endOfTargetWeek.getTime() + 24 * 60 * 60 * 1000);

        const items = await prisma.item.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: queryStart,
                    lte: queryEnd,
                },
            },
            orderBy: [
                { date: 'asc' },
                { priority: 'desc' },
                { time: 'asc' },
            ],
        });

        // Filter precisely in memory to bypass SQLite timezone shifts
        // Get string dates for exact matching
        const validDates = new Set();
        let currentDate = new Date(startOfTargetWeek);

        // Populate valid dates for the 7-day window
        for (let i = 0; i < 7; i++) {
            validDates.add(currentDate.toISOString().split('T')[0]);
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        const filteredItems = items.filter((item: any) => {
            const itemDateStr = new Date(item.date).toISOString().split('T')[0];
            return validDates.has(itemDateStr);
        });

        // Note: Recurrence expansion logic (Issue #13) will be integrated here later
        // e.g., const expandedItems = expandRecurrences(items, startDate, endDate);

        return NextResponse.json(filteredItems);
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
