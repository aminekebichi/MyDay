import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-default-key");

export async function validateSession(req: NextRequest) {
    const token = req.headers.get('X-Session-Token');

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
    } catch (error: any) {
        // Only log serious errors, not just invalid tokens (which happen with old local session tokens)
        if (error?.code !== 'ERR_JWS_INVALID' && error?.code !== 'ERR_JWT_EXPIRED') {
            console.error("Session validation error:", error);
        }
        return null;
    }
}
