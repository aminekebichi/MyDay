import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { validateSession } from "../../../lib/session";

export async function GET(req: NextRequest) {
    const user = await validateSession(req);
    
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                displayName: true,
                username: true,
                role: true,
            },
            orderBy: { displayName: 'asc' }
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error("GET /api/users error:", error);
        return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
    }
}
