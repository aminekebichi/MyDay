// Implements User Directory for Admin
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { validateSession } from "../../../lib/session";

export async function GET(req: NextRequest) {
    const user = await validateSession(req);
    
    // Only admins can see the full user list
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                displayName: true,
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
