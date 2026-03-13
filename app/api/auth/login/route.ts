// Implements Login Auth Route
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-default-key");

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password required", code: "BAD_REQUEST" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
            return NextResponse.json({ error: "Invalid username or password", code: "UNAUTHORIZED" }, { status: 401 });
        }

        // Create JWT
        const token = await new SignJWT({
            id: user.id,
            username: user.username,
            role: user.role,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(JWT_SECRET);

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                role: user.role,
                theme: user.theme,
            },
        });
    } catch (error) {
        console.error("Login route error:", error);
        return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
    }
}
