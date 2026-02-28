import { NextRequest } from 'next/server';
import { prisma } from './db';

export async function validateSession(req: NextRequest) {
    const token = req.headers.get('X-Session-Token');

    if (!token) {
        return null;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { sessionToken: token },
        });
        return user;
    } catch (error) {
        console.error("Session validation error:", error);
        return null;
    }
}
