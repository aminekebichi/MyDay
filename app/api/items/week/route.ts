import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { validateSession } from "../../../../lib/session";
import { startOfDay, endOfDay, addDays } from "date-fns";

export async function GET(req: NextRequest) {
    const user = await validateSession(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startStr = searchParams.get("start");
    const userIdArg = searchParams.get("userId");
    const globalFlag = searchParams.get("global") === "true";

    let targetUserId: string | undefined = user.id;

    if (user.role === 'ADMIN') {
        if (globalFlag) {
            targetUserId = undefined; // Fetch for all users
        } else if (userIdArg) {
            targetUserId = userIdArg;
        }
    }

    const startDate = startStr ? new Date(startStr) : new Date();
    const endDate = addDays(startDate, 7);

    try {
        const items = await prisma.item.findMany({
            where: {
                ...(targetUserId ? { userId: targetUserId } : {}),
                date: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate),
                },
            },
            include: {
                user: {
                    select: {
                        displayName: true
                    }
                }
            },
            orderBy: [{ date: "asc" }, { startTime: "asc" }],
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error("GET /api/items/week error:", error);
        return NextResponse.json({ error: "Internal Server Error", code: "INTERNAL_ERROR" }, { status: 500 });
    }
}
