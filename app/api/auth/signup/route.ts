// Implements Signup Auth Route
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-default-key");

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password, displayName } = body;

        if (!username || !password || !displayName) {
            return NextResponse.json({ error: "Username, password and display name required", code: "BAD_REQUEST" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Username already taken", code: "CONFLICT" }, { status: 409 });
        }

        const passwordHash = bcrypt.hashSync(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                passwordHash,
                displayName,
                role: "USER", // All signups are simple USERs by default
                theme: "dark",
                lastOpenedAt: new Date(),
            },
        });

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
        console.error("Signup route error:", error);
        return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
    }
}
