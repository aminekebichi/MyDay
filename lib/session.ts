import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-default-key");

export async function validateSession(req: NextRequest) {
    const token = req.headers.get("X-Session-Token");

    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return {
            id: payload.id as string,
            username: payload.username as string,
            role: payload.role as string,
        };
    } catch (error) {
        // Silently handle invalid tokens
        return null;
    }
}
